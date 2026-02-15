import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Please log in first' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isLinked) {
      return NextResponse.json(
        { success: false, message: 'Please link your Discord account first' },
        { status: 403 }
      );
    }

    // Get cart items
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + item.priceNum * item.quantity,
      0
    );

    // Get next ticket number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { ticketNumber: 'desc' },
    });
    const ticketNumber = (lastOrder?.ticketNumber || 0) + 1;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        ticketNumber,
        totalPrice,
        status: 'PENDING',
      },
    });

    // Create order items
    await Promise.all(
      items.map((item: any) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.name, // Using name as temporary ID
            quantity: item.quantity,
            price: item.priceNum,
          },
        })
      )
    );

    // Call Discord bot to create ticket
    try {
      const botResponse = await fetch(`${process.env.BOT_API_URL}/create-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BOT_API_SECRET}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          ticketNumber,
          userId: user.discordId,
          username: user.discordUsername,
          items,
          totalPrice,
        }),
      });

      if (!botResponse.ok) {
        throw new Error('Failed to create Discord ticket');
      }

      const botData = await botResponse.json();

      // Update order with Discord ticket ID
      await prisma.order.update({
        where: { id: order.id },
        data: { discordTicketId: botData.ticketId },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        ticketNumber,
        discordServerLink: process.env.DISCORD_SERVER_LINK,
      });
    } catch (botError) {
      console.error('Discord bot error:', botError);
      
      // Still return success but indicate ticket creation failed
      return NextResponse.json({
        success: true,
        orderId: order.id,
        ticketNumber,
        discordServerLink: process.env.DISCORD_SERVER_LINK,
        warning: 'Order created but ticket creation failed. Please contact support.',
      });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Checkout failed. Please try again.' },
      { status: 500 }
    );
  }
}