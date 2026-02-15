'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageSquare } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const order = searchParams.get('orderNumber');
    setOrderNumber(order);
  }, [searchParams]);

  // ✅ Discord invite URL (PHẢI là URL đầy đủ)
  const discordInviteUrl =
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
    'https://discord.com';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="card-glow p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle2 className="text-green-400" size={48} />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">
            Order <span className="text-gradient">Placed!</span>
          </h1>

          {/* Order Number */}
          {orderNumber && (
            <div className="inline-block bg-black-lighter px-6 py-3 rounded-lg mb-6">
              <p className="text-sm text-gray-400 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-gold">{orderNumber}</p>
            </div>
          )}

          <p className="text-lg text-gray-300 mb-8">
            Your order has been successfully placed!
          </p>

          {/* Discord Info */}
          <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg p-6 mb-8 text-left">
            <div className="flex items-start space-x-3 mb-4">
              <MessageSquare
                className="text-[#5865F2] flex-shrink-0 mt-1"
                size={24}
              />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Check Your Discord!
                </h3>
                <p className="text-gray-300 mb-4">
                  A private ticket has been created for your order in our Discord
                  server.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Go to our Discord server</p>
              <p>
                2. Find your ticket channel (
                <strong>ticket-{orderNumber?.toLowerCase()}</strong>)
              </p>
              <p>3. Select your preferred payment method</p>
              <p>4. Complete the payment and upload proof</p>
              <p>5. Our team will verify and deliver your items</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* ✅ FIXED DISCORD LINK */}
            <a
              href={discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-6 py-4 rounded-lg transition-colors"
            >
              Open Discord Server
            </a>

            <Link href="/shop" className="block w-full btn-gold-outline">
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="block text-gray-400 hover:text-gold transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Need help? Contact us in your Discord ticket or reach out to our
            support team.
          </p>
        </div>
      </div>
    </div>
  );
}
