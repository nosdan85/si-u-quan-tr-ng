import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ isLinked: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isLinked) {
      return NextResponse.json({ isLinked: false });
    }

    return NextResponse.json({
      isLinked: true,
      user: {
        id: user.id,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        discordAvatar: user.discordAvatar,
      },
    });
  } catch (error) {
    console.error('Check link error:', error);
    return NextResponse.json({ isLinked: false }, { status: 500 });
  }
}