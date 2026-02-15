import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Game Shop - Premium Gaming Items',
  description: 'Shop for premium gaming items and in-game currency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-black-light py-8 mt-16" style={{ boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            <p>&copy; 2026 Game Shop. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}