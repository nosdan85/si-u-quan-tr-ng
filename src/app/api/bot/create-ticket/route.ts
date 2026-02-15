import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const API_BASE = 'https://discord.com/api/v10';

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    // 🔐 Simple shared-secret auth (prevents anyone hitting this endpoint)
    const secret = process.env.BOT_API_SECRET;
    if (secret) {
      const auth = req.headers.get('authorization') || '';
      const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
      if (token !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const botToken = mustEnv('DISCORD_BOT_TOKEN');
    const guildId = mustEnv('DISCORD_GUILD_ID');
    const categoryId = mustEnv('DISCORD_TICKET_CATEGORY_ID');

    const body = await req.json();
    const orderId: number | undefined = body.orderId;
    const orderNumber: string = body.orderNumber;
    const discordId: string | undefined = body.discordId; // khách đã link
    const items: any[] = Array.isArray(body.items) ? body.items : [];
    const totalAmount: number = Number(body.totalAmount ?? 0);

    const paymentMethods: string[] = Array.isArray(body.paymentMethods)
      ? body.paymentMethods
      : ['paypal', 'ltc', 'applepay'];

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing orderNumber' }, { status: 400 });
    }
    if (!discordId) {
      return NextResponse.json({ error: 'Missing discordId (user not linked)' }, { status: 400 });
    }

    const channelName = `ticket-${orderNumber.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`.slice(0, 90);

    // 1) Create channel
    const createChannelRes = await fetch(`${API_BASE}/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: channelName,
        type: 0, // GUILD_TEXT
        parent_id: categoryId,
        permission_overwrites: [
          // everyone denied
          {
            id: guildId,
            type: 0, // role
            deny: '1024', // VIEW_CHANNEL
            allow: '0',
          },
          // user allowed
          {
            id: discordId,
            type: 1, // member
            allow: String(1024 + 2048 + 16384), // VIEW + SEND + READ_MESSAGE_HISTORY (basic)
            deny: '0',
          },
        ],
      }),
    });

    if (!createChannelRes.ok) {
      const txt = await createChannelRes.text();
      return NextResponse.json({ error: 'Create channel failed', details: txt }, { status: 500 });
    }

    const channel = await createChannelRes.json();
    const channelId = channel.id as string;

    // 2) Prepare buttons (Discord components)
    // IMPORTANT: custom_id must match the bot button handler format: payment_{method}_{orderId}
    const safeOrderId = typeof orderId === 'number' ? orderId : 0;
    const buttons = paymentMethods.map((m) => ({
      type: 2,
      style: 1, // primary
      label: String(m).toUpperCase(),
      custom_id: `payment_${String(m).toLowerCase()}_${safeOrderId}`,
    }));

    const ownerUserId = process.env.DISCORD_OWNER_USER_ID;
    const ownerRoleId = process.env.DISCORD_OWNER_ROLE_ID;

    const mention = ownerRoleId
      ? `<@&${ownerRoleId}>`
      : ownerUserId
        ? `<@${ownerUserId}>`
        : '';

    const itemsList =
      items
        .map((it, idx) => {
          const name = it?.name ?? 'Item';
          const qty = Number(it?.quantity ?? 1);
          const price = Number(it?.price ?? 0);
          const line = price * qty;
          return `${idx + 1}. ${name} x${qty} - $${line.toFixed(2)}`;
        })
        .join('\n') || 'No items';

    // 3) Send initial message
    const sendMsgRes = await fetch(`${API_BASE}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content:
          `✅ **Order:** \`${orderNumber}\`\n` +
          `👤 **Customer:** <@${discordId}>\n` +
          (mention ? `🔔 **Staff:** ${mention}\n` : '') +
          `\n📦 **Items:**\n${itemsList}\n` +
          `\n💰 **Total:** $${Number.isFinite(totalAmount) ? totalAmount.toFixed(2) : '0.00'}\n` +
          `\nChọn phương thức thanh toán bên dưới:`,
        components: [
          {
            type: 1,
            components: buttons,
          },
        ],
      }),
    });

    if (!sendMsgRes.ok) {
      const txt = await sendMsgRes.text();
      return NextResponse.json({ error: 'Send message failed', details: txt }, { status: 500 });
    }

    // 4) Persist ticket ID for this order (prevents duplicate tickets)
    if (typeof orderId === 'number' && orderId > 0) {
      await prisma.order.update({
        where: { id: orderId },
        data: { discordTicketId: channelId },
      });
    }

    return NextResponse.json({ ok: true, ticketId: channelId, channelId, channelName });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
