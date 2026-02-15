import {
  Client,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';

interface TicketData {
  orderId: string;
  ticketNumber: number;
  userId: string;
  username: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
    priceNum: number;
  }>;
  totalPrice: number;
}

export async function createTicket(client: Client, data: TicketData) {
  const { orderId, ticketNumber, userId, username, items, totalPrice } = data;

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const categoryId = process.env.TICKET_CATEGORY_ID!;
    const ownerRoleId = process.env.OWNER_ROLE_ID!;

    // Create ticket channel
    const ticketChannel = await guild.channels.create({
      name: `order_fp${String(ticketNumber).padStart(3, '0')}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: guild.id, // @everyone
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: userId, // Buyer
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        {
          id: ownerRoleId, // Owner role
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
          ],
        },
        {
          id: client.user!.id, // Bot
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles,
          ],
        },
      ],
    });

    // Create order embed
    const embed = new EmbedBuilder()
      .setTitle(`🎮 Order #FP${String(ticketNumber).padStart(3, '0')}`)
      .setColor('#4DA3FF')
      .setDescription(`Thank you for your purchase, <@${userId}>!`)
      .addFields(
        {
          name: '📦 Items',
          value: items
            .map(
              (item) =>
                `**${item.name}** x${item.quantity} - ${item.price} each`
            )
            .join('\n'),
        },
        {
          name: '💰 Total',
          value: `**$${totalPrice.toFixed(2)}**`,
          inline: true,
        },
        {
          name: '📋 Order ID',
          value: orderId,
          inline: true,
        }
      )
      .setFooter({ text: 'Please select a payment method below' })
      .setTimestamp();

    // Create payment buttons
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`payment_paypal_${orderId}`)
        .setLabel('PayPal')
        .setEmoji('💳')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`payment_ltc_${orderId}`)
        .setLabel('LTC (Litecoin)')
        .setEmoji('🪙')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`payment_applepay_${orderId}`)
        .setLabel('Apple Pay')
        .setEmoji('🍎')
        .setStyle(ButtonStyle.Secondary)
    );

    // Send message with embed and buttons
    await ticketChannel.send({
      content: `<@${userId}> <@&${ownerRoleId}>`,
      embeds: [embed],
      components: [row],
    });

    console.log(`✅ Created ticket for order ${orderId}: ${ticketChannel.name}`);

    return {
      success: true,
      ticketId: ticketChannel.id,
      channelId: ticketChannel.id,
      ticketName: ticketChannel.name,
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

// Function to add user to ticket (if they're not in the server)
export async function addUserToTicket(client: Client, ticketChannelId: string, userId: string) {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const channel = await guild.channels.fetch(ticketChannelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error('Invalid ticket channel');
    }

    await channel.permissionOverwrites.create(userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding user to ticket:', error);
    throw error;
  }
}

// Function to close ticket
export async function closeTicket(client: Client, ticketChannelId: string) {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID!);
    const channel = await guild.channels.fetch(ticketChannelId);

    if (!channel) {
      throw new Error('Ticket channel not found');
    }

    // Archive or delete the channel
    await channel.delete('Order completed');

    return { success: true };
  } catch (error) {
    console.error('Error closing ticket:', error);
    throw error;
  }
}