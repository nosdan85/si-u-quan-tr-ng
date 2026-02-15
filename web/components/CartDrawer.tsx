'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    // Check if user has linked Discord account
    try {
      setIsCheckingOut(true);
      const response = await fetch('/api/discord/check-link');
      const data = await response.json();
      
      if (!data.isLinked) {
        // Show link Discord modal
        alert('Please link your Discord account first!');
        // Redirect to Discord OAuth
        window.location.href = '/api/discord/auth';
        return;
      }
      
      // Proceed to checkout
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      const checkoutData = await checkoutResponse.json();
      
      if (checkoutData.success) {
        // Redirect to Discord server
        window.open(checkoutData.discordServerLink, '_blank');
        closeCart();
      } else {
        alert(checkoutData.message || 'Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gradient-to-br from-[#0F172A] to-[#050B1E] shadow-2xl z-50 flex flex-col border-l border-[#4DA3FF]/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#4DA3FF]/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            Shopping Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-[#0A1026] flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">Add some items to get started!</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.name}
                className="flex gap-4 p-4 bg-[#0A1026] rounded-lg border border-[#4DA3FF]/10 hover:border-[#4DA3FF]/30 transition-colors"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-[#0F172A] rounded-lg overflow-hidden">
                  <Image
                    src={`/pictures/products/${item.img}`}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-[#4DA3FF] font-bold text-lg mb-2">
                    {item.price}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.name, item.quantity - 1)}
                      className="p-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold px-3">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.name, item.quantity + 1)}
                      className="p-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.name)}
                      className="ml-auto p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#4DA3FF]/20 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-bold">
              <span className="text-white">Total:</span>
              <span className="bg-gradient-to-r from-[#4DA3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3B82F6] to-[#9333EA] hover:from-[#2563EB] hover:to-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 text-lg"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>

            <p className="text-center text-gray-400 text-xs">
              You will be redirected to Discord to complete your order
            </p>
          </div>
        )}
      </div>
    </>
  );
}