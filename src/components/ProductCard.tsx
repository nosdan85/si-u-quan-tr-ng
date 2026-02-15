'use client';

import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product & { category: string };
  onAddToCart: (product: Product & { category: string }) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imagePath = `/pictures/products/${product.img}`;

  const priceNumber =
    typeof product.price === 'number'
      ? product.price
      : Number(String(product.price).replace(/[^0-9.]/g, ''));

  return (
    <div className="card-glow p-5 group animate-fade-in">
      {/* Image */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-black/20">
        <img
          src={imagePath}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23102222" width="300" height="300"/%3E%3Ctext fill="%23D1E8E2" opacity="0.55" font-family="sans-serif" font-size="22" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />

        {/* Futuristic overlay (teal glow) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute -inset-12 bg-[radial-gradient(circle,rgba(17,100,102,0.35),transparent_55%)]" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Game badge */}
        {product.game && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs tracking-wide"
               style={{
                 background: 'rgba(17,100,102,0.18)',
                 boxShadow: 'inset 0 0 0 1px rgba(44,53,49,0.65)',
                 color: 'rgba(209,232,226,0.85)',
               }}>
            {product.game}
          </div>
        )}

        {/* Product name */}
        <h3 className="text-lg font-semibold tracking-wide text-[#D1E8E2] group-hover:text-neon transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[rgba(209,232,226,0.65)] line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3">
          <span className="text-xl font-semibold text-neon">
            {formatCurrency(priceNumber)}
          </span>

          <button
            onClick={() => onAddToCart(product)}
            className="btn-gold flex items-center gap-2 px-5 py-2.5"
          >
            <ShoppingCart size={18} />
            <span className="tracking-wide">ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
}
