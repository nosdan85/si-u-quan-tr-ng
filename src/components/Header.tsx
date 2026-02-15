'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isLinked, setIsLinked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user has linked Discord
    const checkDiscordStatus = () => {
      const linkedUser = localStorage.getItem('discord_user');
      setIsLinked(!!linkedUser);
    };

    checkDiscordStatus();

    // Get cart count
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(updatedCart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    // Listen for Discord user updates (custom event)
    const handleDiscordUpdate = () => {
      checkDiscordStatus();
    };

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'discord_user') {
        checkDiscordStatus();
      }
      if (e.key === 'cart') {
        const updatedCart = JSON.parse(e.newValue || '[]');
        setCartCount(updatedCart.reduce((sum: number, item: any) => sum + item.quantity, 0));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('discordUserUpdated', handleDiscordUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('discordUserUpdated', handleDiscordUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black-light backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-purple rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold text-gradient">Game Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/shop"
              className="text-gray-300 hover:text-neon-blue transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="text-gray-300 hover:text-neon-blue transition-colors"
            >
              Cart
            </Link>
          </nav>

          {/* Right side actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Discord Link Status */}
            <Link
              href="/link-discord"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isLinked
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 hover:bg-[#5865F2]/30'
                }`}
            >
              <User size={18} />
              <span className="text-sm">
                {isLinked ? 'Discord Linked' : 'Link Discord'}
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple/10 text-purple border border-purple/30 hover:bg-purple/20 transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-neon-blue to-purple text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gold/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} className="text-purple" /> : <Menu size={24} className="text-purple" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            <Link
              href="/shop"
              className="block px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="block px-4 py-2 text-gray-300 hover:text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart
            </Link>
            <Link
              href="/link-discord"
              className={`block px-4 py-2 rounded-lg transition-colors ${isLinked
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span className="text-sm">
                  {isLinked ? 'Discord Linked' : 'Link Discord'}
                </span>
              </div>
            </Link>
            <div className="px-4 py-2 text-gray-400 text-sm">
              Cart Items: {cartCount}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}