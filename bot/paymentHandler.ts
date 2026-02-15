import { ButtonInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

const paymentImages = {
  paypal: 'paypal.png',
  ltc: 'ltc.png',
  applepay: 'applepay.png',
};

export async function handlePaymentButton(interaction: ButtonInteraction) {
  try {
    await interaction.deferUpdate();

    const [, paymentMethod, orderId] = interaction.customId.split('_');

    if (!paymentMethod || !orderId) {
      await interaction.followUp({
        content: '❌ Invalid payment button',
        ephemeral: true,
      });
      return;
    }

    // Get payment image
    const imageName = paymentImages[paymentMethod as keyof typeof paymentImages];
    
    if (!imageName) {
      await interaction.followUp({
        content: '❌ Invalid payment method',
        ephemeral: true,
      });
      return;
    }

    // Path to payment images (adjust based on your setup)
    const imagePath = path.join(process.cwd(), '..', 'web', 'public', 'pictures', 'payments', imageName);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      await interaction.followUp({
        content: `❌ Payment image not found: ${imageName}`,
        ephemeral: true,
      });
      return;
    }

    // Create embed for payment instructions
    const paymentEmbed = new EmbedBuilder()
      .setTitle(`💳 ${getPaymentMethodName(paymentMethod)} Payment Instructions`)
      .setDescription('Please follow the instructions in the image below to complete your payment.')
      .setColor('#3B82F6')
      .addFields({
        name: '📋 Order ID',
        value: orderId,
        inline: true,
      })
      .setFooter({ text: 'After payment, please send proof in this ticket' })
      .setTimestamp();

    // Create attachment
    const attachment = new AttachmentBuilder(imagePath, { name: imageName });

    // Send payment image
    await interaction.channel?.send({
      embeds: [paymentEmbed],
      files: [attachment],
    });

    // Disable all payment buttons
    const message = interaction.message;
    const updatedComponents = message.components.map((row) => {
      const newRow = { ...row };
      newRow.components = newRow.components.map((button) => ({
        ...button,
        disabled: true,
      }));
      return newRow;
    });

    await interaction.editReply({
      components: updatedComponents as any,
    });

    // Send confirmation message
    await interaction.channel?.send({
      content: `✅ <@${interaction.user.id}> selected **${getPaymentMethodName(paymentMethod)}** as payment method.`,
    });

    console.log(`✅ User ${interaction.user.tag} selected ${paymentMethod} for order ${orderId}`);
  } catch (error) {
    console.error('Payment button handler error:', error);
    
    try {
      await interaction.followUp({
        content: '❌ An error occurred while processing your payment selection. Please contact support.',
        ephemeral: true,
      });
    } catch (followUpError) {
      console.error('Error sending error message:', followUpError);
    }
  }
}

function getPaymentMethodName(method: string): string {
  const names: Record<string, string> = {
    paypal: 'PayPal',
    ltc: 'Litecoin (LTC)',
    applepay: 'Apple Pay',
  };
  return names[method] || method;
}