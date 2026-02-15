'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ProductGrid from '@/components/ProductGrid';
import { SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<(Product & { category: string })[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<(Product & { category: string })[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load shop data on mount
  useEffect(() => {
    loadShopData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, selectedGame, searchQuery]);

async function loadShopData() {
  try {
    const response = await fetch('/data/shop-data.json');
    const data = await response.json();

    // Flat list for grid
    const allProducts: (Product & { category: string })[] = [];
    const categorySet = new Set<string>(); // dùng cho filter "category" (vd: Bundles, Gamepass...)
    const gameSet = new Set<string>();     // dùng cho filter "game" (vd: Blox Fruits)

    // data: { [gameName]: { [categoryName]: ProductLike[] } }
    Object.entries(data).forEach(([gameName, categoryMap]) => {
      gameSet.add(gameName);

      if (categoryMap && typeof categoryMap === 'object') {
        Object.entries(categoryMap as Record<string, any>).forEach(([categoryName, items]) => {
          categorySet.add(categoryName);

          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              // Chuẩn hoá field theo types của bạn
              const normalized: Product & { category: string } = {
                // nếu Product của bạn có id, tạo tạm id ổn định
                id: item.id ?? `${gameName}-${categoryName}-${item.name}`,

                name: item.name,
                // price bạn đang để string "3.5$" -> chuyển về number nếu code cần number
                // nếu hệ thống bạn đang chấp nhận string thì giữ nguyên, còn nếu cần number:
                price:
                  typeof item.price === 'string'
                    ? Number(item.price.replace('$', '').trim())
                    : item.price,

                image: item.image ?? item.img, // nhiều project dùng "image"
                img: item.img,                 // giữ lại nếu component dùng img
                description: item.description ?? item.desc ?? '',

                // field thêm để filter
                category: categoryName,
                game: gameName,
              };

              allProducts.push(normalized);
            });
          }
        });
      }
    });

    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setCategories(Array.from(categorySet));
    setGames(Array.from(gameSet));
    setLoading(false);
  } catch (error) {
    console.error('Error loading shop data:', error);
    setLoading(false);
  }
}


  function applyFilters() {
    let filtered = [...products];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Game filter
    if (selectedGame) {
      filtered = filtered.filter(p => p.game === selectedGame);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.game?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }

  function handleAddToCart(product: Product & { category: string }) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item: any) => item.name === product.name && item.category === product.category
    );

    if (existingIndex !== -1) {
      // Increase quantity
      cart[existingIndex].quantity += 1;
    } else {
      // Add new item
      cart.push({
        ...product,
        quantity: 1,
        cartId: `${product.category}-${product.name}-${Date.now()}`,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch event to update cart count
    window.dispatchEvent(new Event('cartUpdated'));

    // Show feedback
    alert(`Added ${product.name} to cart!`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Shop</span>
          </h1>
          <p className="text-gray-400">Browse our collection of premium gaming items</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {/* Filters Toggle (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-2 mb-4 px-4 py-2 bg-black-lighter rounded-lg text-gold"
        >
          <SlidersHorizontal size={20} />
          <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              games={games}
              selectedCategory={selectedCategory}
              selectedGame={selectedGame}
              onCategoryChange={setSelectedCategory}
              onGameChange={setSelectedGame}
            />
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Products */}
        <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}