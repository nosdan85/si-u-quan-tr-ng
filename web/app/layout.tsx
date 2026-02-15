import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blox Fruits Shop - Best Deals on Permanent Fruits & Gamepasses',
  description: 'Get the best deals on Permanent Fruits, Gamepasses, and Exclusive Bundles for Blox Fruits!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <CartDrawer />
      </body>
    </html>
  );
}