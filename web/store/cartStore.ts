import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  name: string;
  price: string;
  priceNum: number;
  img: string;
  category: string;
  game: string;
  desc: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemName: string) => void;
  updateQuantity: (itemName: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.name === item.name);
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.name === item.name
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (itemName) => {
        set((state) => ({
          items: state.items.filter((item) => item.name !== itemName),
        }));
      },

      updateQuantity: (itemName, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemName);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.name === itemName ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.priceNum * item.quantity,
          0
        );
      },
    }),
    {
      name: 'bloxfruits-cart-storage',
    }
  )
);