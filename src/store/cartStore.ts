import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string; // variantId
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
}

interface CartState {
  cartToken: string;
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartToken: uuidv4(),
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          
          if (existingItem) {
            // Check stock limit
            const newQuantity = Math.min(
              existingItem.quantity + newItem.quantity,
              existingItem.stock
            );
            
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isOpen: true, // Open cart when item is added
            };
          }

          return {
            items: [...state.items, newItem],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'hb-cart-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ items: state.items, cartToken: state.cartToken }), // Persist items & token
    }
  )
);
