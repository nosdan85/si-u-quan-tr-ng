const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_API_BASE = 'https://discord.com/api';

type TokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const clientId = process.env.DISCORD_OAUTH_CLIENT_ID;
  const clientSecret = process.env.DISCORD_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      `Missing Discord OAuth env. Need DISCORD_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI`
    );
  }

  const body = new URLSearchParams();
  body.set('client_id', clientId);
  body.set('client_secret', clientSecret);
  body.set('grant_type', 'authorization_code');
  body.set('code', code);
  body.set('redirect_uri', redirectUri);

  const res = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const text = await res.text();
  if (!res.ok) {
    // Log rõ để biết Discord trả gì: invalid_client, invalid_grant, redirect_uri_mismatch...
    console.error('Discord token exchange failed:', res.status, text);
    throw new Error(`Discord token exchange failed: ${res.status}`);
  }

  return JSON.parse(text) as TokenResponse;
}

export async function getDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Get Discord user failed:', res.status, text);
    throw new Error('Failed to fetch Discord user');
  }

  return res.json() as Promise<{ id: string; username: string; avatar: string | null }>;
}
