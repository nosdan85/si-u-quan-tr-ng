'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { getAllProducts, searchProducts } from '@/lib/shopData';

const categories = ['Bundles', 'Best Seller', 'Permanent Fruits', 'Gamepass'];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(getAllProducts());
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let result = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-[#050B1E]">
      {/* Hero Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4DA3FF]/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#4DA3FF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            Blox Fruits Shop
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Get the best deals on Permanent Fruits, Gamepasses, and Exclusive Bundles!
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-[#0A1026] rounded-lg border border-[#4DA3FF]/20">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-lg">No products found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing <span className="text-white font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.name}
                  name={product.name}
                  price={product.price}
                  img={product.img}
                  desc={product.desc}
                  category={product.category}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}