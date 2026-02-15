'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  function updateQuantity(cartId: string, delta: number) {
    const updatedCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  function removeItem(cartId: string) {
    const updatedCart = cart.filter(item => item.cartId !== cartId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  function getTotalAmount(): number {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function handleCheckout() {
    // Check if user has linked Discord
    const linkedUser = localStorage.getItem('discord_user');
    
    if (!linkedUser) {
      if (confirm('You need to link your Discord account before checkout. Link now?')) {
        router.push('/link-discord?redirect=/checkout');
      }
      return;
    }

    router.push('/checkout');
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-4 text-gray-600" size={64} />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some items to get started</p>
          <Link href="/shop" className="btn-gold inline-block">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Shopping <span className="text-gradient">Cart</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.cartId} className="card-glow p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={`/pictures/products/${item.img}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg bg-black-lighter"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%231a1a1a" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.game && (
                          <span className="inline-block px-2 py-1 bg-gold/20 text-gold text-xs rounded-full mt-1">
                            {item.game}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-black-lighter rounded hover:bg-gold hover:text-black transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-black-lighter rounded hover:bg-gold hover:text-black transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          {formatCurrency(item.price)} each
                        </div>
                        <div className="text-lg font-bold text-gold">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card-glow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>{formatCurrency(getTotalAmount())}</span>
                </div>
              </div>

              <div className="border-t border-black-lighter pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-gold">{formatCurrency(getTotalAmount())}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-gold"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/shop"
                className="block w-full text-center mt-4 px-6 py-3 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}