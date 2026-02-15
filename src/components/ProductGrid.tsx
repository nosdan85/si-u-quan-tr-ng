'use client';

import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: (Product & { category: string })[];
  onAddToCart: (product: Product & { category: string }) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-400">No products found</p>
        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={`${product.category}-${product.name}-${index}`}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}