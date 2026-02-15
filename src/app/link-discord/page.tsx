'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type DiscordUser = {
  discordId: string | null;
  discordUsername: string | null;
  discordAvatar?: string | null;
};

export default function LinkDiscordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLinked, setIsLinked] = useState(false);
  const [userData, setUserData] = useState<DiscordUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const redirect = searchParams.get('redirect');

    if (success === 'true') {
      const user: DiscordUser = {
        discordId: searchParams.get('discordId'),
        discordUsername: searchParams.get('discordUsername'),
        discordAvatar: searchParams.get('discordAvatar'),
      };

      localStorage.setItem('discord_user', JSON.stringify(user));
      setUserData(user);
      setIsLinked(true);
      setLoading(false);
      setError(null);

      // Notify other components about Discord link update
      window.dispatchEvent(new Event('discordUserUpdated'));

      if (redirect) {
        setTimeout(() => router.push(redirect), 800);
      }
      return;
    }

    if (errorParam) {
      setError(getErrorMessage(errorParam));
      setLoading(false);
      return;
    }

    // load localStorage (đã link trước đó)
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserData(parsed);
        setIsLinked(true);
      } catch {
        localStorage.removeItem('discord_user');
      }
    }
    setLoading(false);
  }, [searchParams, router]);

  function getErrorMessage(errorCode: string): string {
    const messages: { [key: string]: string } = {
      access_denied: 'You denied access to your Discord account',
      no_code: 'Authorization code was not provided',
      auth_failed: 'Failed to authenticate with Discord',
      invalid_scope: 'Discord scope is invalid',
      invalid_request: 'Invalid request to Discord OAuth',
    };
    return messages[errorCode] || `An unknown error occurred: ${errorCode}`;
  }

  function handleLink() {
    setLoading(true);
    setError(null);

    // optional: sau khi link xong quay lại /checkout chẳng hạn
    // ví dụ: /api/auth/discord?redirect=/checkout
    const redirectAfter = searchParams.get('redirect');
    const url = redirectAfter
      ? `/api/auth/discord?redirect=${encodeURIComponent(redirectAfter)}`
      : '/api/auth/discord';

    window.location.href = url;
  }

  function handleUnlink() {
    if (confirm('Are you sure you want to unlink your Discord account?')) {
      localStorage.removeItem('discord_user');
      setIsLinked(false);
      setUserData(null);
      setError(null);

      // Notify other components about Discord unlink
      window.dispatchEvent(new Event('discordUserUpdated'));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card-glow p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">
              Link <span className="text-gradient">Discord</span>
            </h1>
            <p className="text-gray-400">
              Connect your Discord account to receive order updates
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-400">Error</h3>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Linked state */}
          {isLinked && userData ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-green-400">Account Linked</h3>
                  <p className="text-sm text-green-300">
                    Your Discord account is connected
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-black-lighter rounded-lg">
                {userData.discordAvatar && userData.discordId && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.discordAvatar}.png`}
                    alt="Discord avatar"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{userData.discordUsername}</h3>
                  <p className="text-sm text-gray-400">ID: {userData.discordId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/shop" className="block w-full btn-gold text-center">
                  Continue Shopping
                </Link>

                <button
                  onClick={handleUnlink}
                  className="w-full px-6 py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Unlink Account
                </button>
              </div>
            </div>
          ) : (
            /* Not linked state */
            <div className="space-y-6">
              <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Why link Discord?</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-2">•</span>
                    <span>Receive instant order notifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-2">•</span>
                    <span>Get a private ticket channel for each order</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-2">•</span>
                    <span>Direct communication with our team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-2">•</span>
                    <span>Faster support and delivery</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleLink}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-60 text-white font-bold px-6 py-4 rounded-lg transition-colors"
              >
                <span>{loading ? 'Redirecting...' : 'Link Discord Account'}</span>
              </button>

              <Link
                href="/shop"
                className="block w-full text-center px-6 py-3 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/10 transition-colors"
              >
                Skip for Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
