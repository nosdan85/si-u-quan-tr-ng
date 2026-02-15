import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (VND or USD)
 */
export function formatCurrency(price: number) {
  const n = Number.isFinite(price) ? price : 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}


/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Get image path for products
 */
export function getProductImagePath(imageName: string): string {
  // Assumes images are in /pictures/products/
  return `/pictures/products/${imageName}`;
}

/**
 * Get payment image path
 */
export function getPaymentImagePath(method: 'paypal' | 'ltc' | 'applepay'): string {
  const envKey = `PAYMENT_${method.toUpperCase()}_IMAGE`;
  const imagePath = process.env[envKey];
  
  if (!imagePath) {
    return `/pictures/payments/${method}.png`;
  }
  
  return `/pictures/${imagePath}`;
}

/**
 * Delay function for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}