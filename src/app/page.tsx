import Link from 'next/link';
import { ArrowRight, ShoppingBag, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple/5 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple/15 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Premium{' '}
            <span className="text-gradient">Gaming Items</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Get the best deals on in-game items, currency, and accounts. Fast delivery, secure transactions.
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-neon-blue-dark to-purple text-white font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:shadow-gold-lg"
          >
            <ShoppingBag size={24} />
            <span>Browse Shop</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-glow p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-blue/20 rounded-full mb-4">
                <Zap className="text-neon-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
              <p className="text-gray-400">
                Get your items delivered instantly through our automated system
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-glow p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple/20 rounded-full mb-4">
                <Shield className="text-purple" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-gray-400">
                Multiple payment options with secure processing
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-glow p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink/20 rounded-full mb-4">
                <ShoppingBag className="text-pink" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-400">
                Thousands of items across all major games
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto card-glow p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">Level Up</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of gamers who trust us for their gaming needs
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 btn-gold"
          >
            <span>Start Shopping</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}