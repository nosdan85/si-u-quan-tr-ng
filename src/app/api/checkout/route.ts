import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discordId, items, totalAmount } = body;

    // Validation
    if (!discordId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Optional: validate totalAmount
    const total = Number(totalAmount);
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json({ error: 'Invalid totalAmount' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please link your Discord account first.' },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        items: JSON.stringify(items),
        totalAmount: total,
        status: 'pending',
      },
    });

    // ✅ Call bot API to create ticket (App Router path: /bot/create-ticket)
    // Use the real origin (works in localhost + deploy)
    const origin = request.nextUrl.origin;

    try {
      const res = await fetch(`${origin}/bot/create-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BOT_API_SECRET || ''}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          items,
          totalAmount: total,
        }),
      });

      // If your /bot/create-ticket returns { ticketId: "..." }
      if (res.ok) {
        const data = await res.json().catch(() => null);

        if (data?.ticketId) {
          await prisma.order.update({
            where: { id: order.id },
            data: { discordTicketId: data.ticketId },
          });
        }
      } else {
        const txt = await res.text().catch(() => '');
        console.error('Error creating Discord ticket:', res.status, txt);
      }
    } catch (botError) {
      console.error('Error creating Discord ticket:', botError);
      // Don't fail checkout if ticket creation fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
