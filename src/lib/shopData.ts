import fs from 'fs';
import path from 'path';
import { ShopData, Product } from '@/types';

/**
 * Load shop data from the generated JSON file
 */
export function loadShopData(): ShopData {
  const dataPath = path.join(process.cwd(), 'data', 'shop-data.json');
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      'Shop data not found! Please run: npm run extract-data'
    );
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Get all products as a flat array with category info
 */
export function getAllProducts(): (Product & { category: string })[] {
  const shopData = loadShopData();
  const products: (Product & { category: string })[] = [];

  Object.entries(shopData).forEach(([category, items]) => {
    if (Array.isArray(items)) {
      items.forEach(item => {
        products.push({
          ...item,
          category,
        });
      });
    }
  });

  return products;
}

/**
 * Get unique categories
 */
export function getCategories(): string[] {
  const shopData = loadShopData();
  return Object.keys(shopData);
}

/**
 * Get unique games (from product.game field)
 */
export function getGames(): string[] {
  const products = getAllProducts();
  const games = new Set<string>();
  
  products.forEach(product => {
    if (product.game) {
      games.add(product.game);
    }
  });

  return Array.from(games);
}

/**
 * Search products by query
 */
export function searchProducts(query: string): (Product & { category: string })[] {
  const allProducts = getAllProducts();
  const lowerQuery = query.toLowerCase();

  return allProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.game?.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Filter products by category and/or game
 */
export function filterProducts(
  category?: string,
  game?: string
): (Product & { category: string })[] {
  const allProducts = getAllProducts();

  return allProducts.filter(product => {
    const categoryMatch = !category || product.category === category;
    const gameMatch = !game || product.game === game;
    return categoryMatch && gameMatch;
  });
}