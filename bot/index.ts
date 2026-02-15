import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { handleButtonInteraction } from './handlers/buttonHandler';
import { registerCommands } from './commands/export-users';
import { registerNotifyCommand } from './commands/notify-new-server';

// ✅ Load .env chắc chắn theo project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

function buildStaffMention(): string | null {
  const ownerRoleId = process.env.DISCORD_OWNER_ROLE_ID;
  const ownerUserId = process.env.DISCORD_OWNER_USER_ID;
  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;

  if (ownerRoleId && isSnowflake(ownerRoleId)) return `<@&${ownerRoleId}>`;
  if (ownerUserId && isSnowflake(ownerUserId)) return `<@${ownerUserId}>`;
  if (staffRoleId && isSnowflake(staffRoleId)) return `<@&${staffRoleId}>`;
  return null;
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// ✅ Validate Snowflake ID (Discord IDs are 17–20 digits)
function isSnowflake(v: unknown): v is string {
  return typeof v === 'string' && /^\d{17,20}$/.test(v);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Bot is ready! Logged in as ${c.user.tag}`);

  await registerCommands(client);
  await registerNotifyCommand(client);

  // ⚠️ Lưu ý: bạn đang log success dù register bị lỗi 403 trước đó
  console.log('✅ Slash commands registration attempted');

  startOrderPolling();
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
      return;
    }

    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      if (commandName === 'export_users') {
        await handleExportUsersCommand(interaction);
      } else if (commandName === 'notify_new_server') {
        await handleNotifyNewServerCommand(interaction);
      }
    }
  } catch (err) {
    console.error('Interaction error:', err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({ content: '❌ Bot error.', ephemeral: true });
      } catch {}
    }
  }
});

function startOrderPolling() {
  console.log('🔄 Starting order polling...');

  setInterval(async () => {
    try {
      const pendingOrders = await prisma.order.findMany({
        where: {
          status: 'pending',
          discordTicketId: null,
        },
        include: { user: true },
        take: 5,
      });

      for (const order of pendingOrders) {
        // nếu user chưa link discord -> bỏ qua (không tạo ticket)
        if (!order.user?.discordId) continue;
        await createTicketForOrder(order);
      }
    } catch (error) {
      console.error('Error polling orders:', error);
    }
  }, 10_000);
}

// ✅ Create ticket for an order (FIXED)
async function createTicketForOrder(order: any) {
  try {
    const guildId = mustEnv('DISCORD_GUILD_ID');
    const categoryId = mustEnv('DISCORD_TICKET_CATEGORY_ID');

    // ✅ Validate IDs early (prevents InvalidType)
    if (!isSnowflake(guildId)) throw new Error(`DISCORD_GUILD_ID invalid: ${guildId}`);
    if (!isSnowflake(categoryId)) throw new Error(`DISCORD_TICKET_CATEGORY_ID invalid: ${categoryId}`);

    const buyerId = String(order.user.discordId ?? '');
    if (!isSnowflake(buyerId)) {
      throw new Error(`Buyer discordId invalid (must be numeric ID): ${buyerId}`);
    }

    const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;
    if (staffRoleId && !isSnowflake(staffRoleId)) {
      throw new Error(`DISCORD_STAFF_ROLE_ID invalid: ${staffRoleId}`);
    }

    const ownerRoleId = process.env.DISCORD_OWNER_ROLE_ID;
    if (ownerRoleId && !isSnowflake(ownerRoleId)) {
      throw new Error(`DISCORD_OWNER_ROLE_ID invalid: ${ownerRoleId}`);
    }

    const ownerUserId = process.env.DISCORD_OWNER_USER_ID;
    if (ownerUserId && !isSnowflake(ownerUserId)) {
      throw new Error(`DISCORD_OWNER_USER_ID invalid: ${ownerUserId}`);
    }

    const staffMention = buildStaffMention();

    const guild = await client.guilds.fetch(guildId);

    // Optional: help ensure member exists (not required for overwrite by ID, but helpful)
    await guild.members.fetch(buyerId).catch(() => null);

    // Parse items (safe)
    let items: any[] = [];
    try {
      items = JSON.parse(order.items || '[]');
      if (!Array.isArray(items)) items = [];
    } catch {
      items = [];
    }

    const channelNameRaw = `ticket-${String(order.orderNumber || '').toLowerCase()}`;
    const channelName = channelNameRaw.replace(/[^a-z0-9-]/g, '-').slice(0, 90);

    // ✅ IMPORTANT FIX: @everyone overwrite must use guild.roles.everyone.id (NOT guild.id)
    const overwrites: any[] = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: buyerId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: client.user!.id, // bot itself
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];

    // Add staff role overwrite if configured (best to include here instead of separate create())
    if (staffRoleId) {
      overwrites.push({
        id: staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }

    // Add owner role/user overwrite if configured
    if (ownerRoleId) {
      overwrites.push({
        id: ownerRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      });
    } else if (ownerUserId) {
      overwrites.push({
        id: ownerUserId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      });
    }

    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId, // category channel ID (string)
      permissionOverwrites: overwrites,
    });

    if (ticketChannel.type !== ChannelType.GuildText) {
      throw new Error('Created channel is not a GuildText channel');
    }

    // Build items list
    const itemsList =
      items
        .map((item: any, index: number) => {
          const name = item?.name ?? 'Item';
          const qty = Number(item?.quantity ?? 1);
          const price = Number(item?.price ?? 0);
          const line = price * qty;
          return `${index + 1}. **${name}** x${qty} - ${formatCurrency(line)}`;
        })
        .join('\n') || 'No items';

    const embed = new EmbedBuilder()
      .setColor(0x116466)
      .setTitle(`🧾 Order: ${order.orderNumber}`)
      .setDescription(`Customer: <@${buyerId}>`)
      .addFields(
        { name: '📦 Items', value: itemsList, inline: false },
        { name: '💰 Total', value: formatCurrency(Number(order.totalAmount || 0)), inline: true },
        { name: '📅 Date', value: new Date(order.createdAt).toLocaleString(), inline: true }
      )
      .setFooter({ text: 'Select a payment method below' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`payment_paypal_${order.id}`)
        .setLabel('PayPal')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId(`payment_ltc_${order.id}`)
        .setLabel('Litecoin (LTC)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🪙'),
      new ButtonBuilder()
        .setCustomId(`payment_applepay_${order.id}`)
        .setLabel('Apple Pay')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🍎')
    );

    await ticketChannel.send({
      content: staffMention ?? undefined,
      embeds: [embed],
      components: [row],
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { discordTicketId: ticketChannel.id },
    });

    console.log(`✅ Created ticket #${ticketChannel.name} for ${order.orderNumber}`);
  } catch (error) {
    console.error(`Error creating ticket for order ${order.orderNumber}:`, error);
  }
}

// Export users command
async function handleExportUsersCommand(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const users = await prisma.user.findMany({
      select: { discordId: true, discordUsername: true, linkedAt: true },
    });

    const userList = users
      .map((u: { discordUsername: string; discordId: string; linkedAt: Date }, i: number) => {
        const linked = u.linkedAt ? new Date(u.linkedAt).toLocaleDateString() : 'N/A';
        return `${i + 1}. ${u.discordUsername} (${u.discordId}) - Linked: ${linked}`;
      })
      .join('\n');

    const content = `**Exported Users (${users.length} total)**\n\`\`\`\n${userList}\n\`\`\``;

    if (content.length > 2000) {
      const buffer = Buffer.from(userList, 'utf-8');
      await interaction.editReply({
        content: `📋 Exported ${users.length} users`,
        files: [{ attachment: buffer, name: 'users.txt' }],
      });
    } else {
      await interaction.editReply(content);
    }
  } catch (error) {
    console.error('Error in export_users command:', error);
    await interaction.editReply('❌ Failed to export users');
  }
}

// Notify command
async function handleNotifyNewServerCommand(interaction: any) {
  const inviteLink = interaction.options.getString('invite_link');
  await interaction.deferReply({ ephemeral: true });

  try {
    const users = await prisma.user.findMany();
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const discordUser = await client.users.fetch(user.discordId);
        await discordUser.send(
          `🔔 **Important Notice**\n\n` +
            `Our server has been migrated to a new location.\n\n` +
            `New Server Invite: ${inviteLink}\n\n` +
            `Your account data has been preserved.`
        );
        successCount++;
      } catch (dmError) {
        failCount++;
        console.error(`❌ Failed to DM ${user.discordUsername}:`, dmError);
      }
    }

    await interaction.editReply(`📨 Done!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
  } catch (error) {
    console.error('Error in notify_new_server command:', error);
    await interaction.editReply('❌ Failed to send notifications');
  }
}

function formatCurrency(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

client.on(Events.Error, (error: unknown) => console.error('Discord client error:', error));
process.on('unhandledRejection', (error: unknown) =>
  console.error('Unhandled promise rejection:', error)
);

// ✅ Token name: bạn đang dùng DISCORD_BOT_TOKEN
client.login(mustEnv('DISCORD_BOT_TOKEN'));
