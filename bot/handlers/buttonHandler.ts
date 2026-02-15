import { ButtonInteraction, AttachmentBuilder } from "discord.js";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // payment_{method}_{orderId}
  const match = customId.match(/^payment_(\w+)_(\d+)$/);
  if (!match) return;

  const [, paymentMethodRaw, orderIdStr] = match;
  const orderId = parseInt(orderIdStr, 10);
  const paymentMethod = paymentMethodRaw.toLowerCase(); // paypal | ltc | applepay

  try {
    await interaction.deferReply({ ephemeral: true });

    const allowedMethods = new Set(["paypal", "ltc", "applepay"]);
    if (!allowedMethods.has(paymentMethod)) {
      await interaction.editReply("❌ Payment method not supported.");
      return;
    }

    if (!interaction.guild) {
      await interaction.editReply("❌ This must be used inside a server ticket channel.");
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      await interaction.editReply("❌ Order not found.");
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod },
    });

    const imagePath = resolvePaymentImageAbsolutePath(paymentMethod);

    if (!fs.existsSync(imagePath)) {
      await interaction.editReply(
        `⚠️ Selected: **${paymentMethod.toUpperCase()}**\n\n` +
          `Payment image not found at:\n${imagePath}\n\n` +
          `Please contact staff for payment details.`
      );
      return;
    }

    // ✅ Fetch channel from guild (avoid Partial* from interaction.channel typings)
    const fetched = await interaction.guild.channels.fetch(interaction.channelId);

    // Runtime safety
    if (!fetched || !fetched.isTextBased()) {
      await interaction.editReply("❌ Cannot send message in this channel.");
      return;
    }

    const attachment = new AttachmentBuilder(imagePath);

    // ✅ TS “bướng” => cast after runtime check
    await (fetched as any).send({
      content:
        `💳 **Payment method selected:** ${paymentMethod.toUpperCase()}\n` +
        `Please pay using the details in the image below.\n` +
        `Order ID: **${orderId}**`,
      files: [attachment],
    });

    await interaction.editReply(
      `✅ Payment method selected: **${paymentMethod.toUpperCase()}**\n\n` +
        `Payment details have been posted in this ticket.`
    );
  } catch (error) {
    console.error("Error handling payment button:", error);
    try {
      await interaction.editReply("❌ An error occurred while processing your selection.");
    } catch {
      // ignore
    }
  }
}

/**
 * ENV:
 *  PAYMENT_PAYPAL_IMAGE=public/payments-images/paypal.png
 *  PAYMENT_LTC_IMAGE=public/payments-images/ltc.png
 *  PAYMENT_APPLEPAY_IMAGE=public/payments-images/applepay.png
 *
 * Default:
 *  <root>/public/payments-images/{method}.png
 */
function resolvePaymentImageAbsolutePath(method: string): string {
  const envKey = `PAYMENT_${method.toUpperCase()}_IMAGE`;
  const configuredPath = process.env[envKey];

  if (configuredPath && typeof configuredPath === "string" && configuredPath.trim()) {
    const rel = configuredPath.trim().replace(/^\/+/, "");
    return path.join(process.cwd(), rel);
  }

  return path.join(process.cwd(), "public", "payments-images", `${method}.png`);
}

// Optional: close Prisma on shutdown
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});
process.on("SIGTERM", async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});
