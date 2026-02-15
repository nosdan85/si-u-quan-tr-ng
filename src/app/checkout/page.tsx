'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cart
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(savedCart);

    // Check Discord link
    const savedUser = localStorage.getItem('discord_user');
    if (!savedUser) {
      router.push('/link-discord?redirect=/checkout');
      return;
    }
    setUserData(JSON.parse(savedUser));
  }, [router]);

  function getTotalAmount(): number {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async function handlePlaceOrder() {
    if (!userData) {
      router.push('/link-discord?redirect=/checkout');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: userData.discordId,
          items: cart,
          totalAmount: getTotalAmount(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));

      // Redirect to success page
      router.push(`/success?orderNumber=${data.order.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
      setLoading(false);
    }
  }

  if (!cart.length || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          <span className="text-gradient">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="card-glow p-6 space-y-4">
              {cart.map((item) => (
                <div key={item.cartId} className="flex items-center space-x-4">
                  <img
                    src={`/pictures/products/${item.img}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded bg-black-lighter"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%231a1a1a" width="64" height="64"/%3E%3C/svg%3E';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t border-black-lighter pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gold">{formatCurrency(getTotalAmount())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Information</h2>
            <div className="card-glow p-6 space-y-6">
              {/* Discord Account */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Discord Account
                </label>
                <div className="flex items-center space-x-3 p-4 bg-black-lighter rounded-lg">
                  {userData.discordAvatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${userData.discordId}/${userData.discordAvatar}.png`}
                      alt="Discord avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{userData.discordUsername}</p>
                    <p className="text-sm text-gray-400">Linked</p>
                  </div>
                  <CheckCircle2 className="text-green-400 ml-auto" size={20} />
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                <h3 className="font-semibold text-gold mb-2">📋 What happens next?</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• A private ticket will be created in Discord</li>
                  <li>• You'll receive order details in the ticket</li>
                  <li>• Select your payment method</li>
                  <li>• Complete payment and provide proof</li>
                  <li>• Our team will process your order</li>
                </ul>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full btn-gold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Place Order</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}