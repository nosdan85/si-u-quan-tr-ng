'use client';

import Image from 'next/image';
import { ShoppingCart, Info } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import { parsePrice } from '@/lib/shopData';

interface ProductCardProps {
  name: string;
  price: string;
  img: string;
  desc: string;
  category: string;
}

export default function ProductCard({ name, price, img, desc, category }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      name,
      price,
      priceNum: parsePrice(price),
      img,
      category,
      game: 'Blox Fruits',
      desc,
    });
    openCart();
  };

  return (
    <>
      <div className="group relative bg-gradient-to-br from-[#0F172A] to-[#050B1E] rounded-xl overflow-hidden border border-[#4DA3FF]/20 hover:border-[#8B5CF6]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#4DA3FF]/20 hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative aspect-square bg-[#0A1026] overflow-hidden">
          <Image
            src={`/pictures/products/${img}`}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#4DA3FF]/90 to-[#8B5CF6]/90 backdrop-blur-sm rounded text-xs font-semibold text-white">
            {category}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold mb-2 line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4DA3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
              {price}
            </span>
            
            {desc && (
              <button
                onClick={() => setShowDetails(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="View details"
              >
                <Info className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#3B82F6] to-[#9333EA] hover:from-[#2563EB] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDetails(false)}>
          <div className="bg-gradient-to-br from-[#0F172A] to-[#050B1E] border border-[#4DA3FF]/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
                  <span className="text-3xl font-bold bg-gradient-to-r from-[#4DA3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                    {price}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Image */}
              <div className="relative w-full h-64 bg-[#0A1026] rounded-lg mb-4">
                <Image
                  src={`/pictures/products/${img}`}
                  alt={name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Description */}
              {desc && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {desc}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleAddToCart();
                    setShowDetails(false);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#3B82F6] to-[#9333EA] hover:from-[#2563EB] hover:to-[#7C3AED] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-lg transition-colors border border-[#4DA3FF]/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}