export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getDiscordUser } from '@/lib/discord';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.BASE_URL}/link-discord?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.BASE_URL}/link-discord?error=no_code`
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get user info
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Save or update user in database
    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      update: {
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar,
      },
      create: {
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar,
      },
    });

    // Create a response that sets user data in a cookie or redirects with user info
    const redirectUrl = new URL('/link-discord', process.env.BASE_URL);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('discordId', user.discordId);
    redirectUrl.searchParams.set('discordUsername', user.discordUsername);
    if (user.discordAvatar) {
      redirectUrl.searchParams.set('discordAvatar', user.discordAvatar);
    }

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
  console.error('Error in Discord OAuth callback:', error);

  const message =
    typeof error?.message === 'string' ? error.message : 'unknown_error';

  return NextResponse.redirect(
    `${process.env.BASE_URL}/link-discord?error=${encodeURIComponent(message)}`
  );
}

}