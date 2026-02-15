export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/prisma'


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Save or update user in database
    const user = await prisma.user.upsert({
      where: { discordId: userData.id },
      update: {
        discordUsername: userData.username,
        discordAvatar: userData.avatar,
        isLinked: true,
      },
      create: {
        discordId: userData.id,
        discordUsername: userData.username,
        discordAvatar: userData.avatar,
        isLinked: true,
      },
    });

    // Set session cookie or JWT
    const response = NextResponse.redirect(new URL('/?linked=true', request.url));
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}