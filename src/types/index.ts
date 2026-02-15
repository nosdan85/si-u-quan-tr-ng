// Type definitions for the project

export interface Product {
  name: string;
  price: number;
  img: string;
  description?: string;
  game?: string;
  category?: string;
}

export interface ShopData {
  [category: string]: Product[];
}

export interface CartItem extends Product {
  quantity: number;
  cartId: string; // unique ID for this cart item
}

export interface User {
  id: number;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string | null;
  linkedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  items: string; // JSON string
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  discordTicketId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name?: string | null;
}

export interface CheckoutData {
  items: CartItem[];
  totalAmount: number;
  discordId: string;
}

export type PaymentMethod = 'paypal' | 'ltc' | 'applepay';