import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.DISCORD_OAUTH_CLIENT_ID;
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('Missing Discord OAuth env:', {
      DISCORD_OAUTH_CLIENT_ID: !!clientId,
      DISCORD_OAUTH_REDIRECT_URI: !!redirectUri,
    });
    return NextResponse.json(
      { error: 'Missing Discord OAuth env (clientId/redirectUri)' },
      { status: 500 }
    );
  }

  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify');

  // giữ redirect về trang trước sau khi link xong (optional)
  const redirect = req.nextUrl.searchParams.get('redirect');
  if (redirect) url.searchParams.set('state', encodeURIComponent(redirect));

  // ✅ Redirect thẳng sang Discord (không trả JSON nữa)
  return NextResponse.redirect(url.toString());
}
