/**
 * Zustand Cart Store — HB_Service Luxury E-commerce
 * 
 * Client-side state management with localStorage persistence.
 * Syncs with database only at checkout time.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantSize: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'hb-service-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Navigation Store ──────────────────────────────────────────
// Manages SPA navigation state (since we're building within / route)

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'checkout' 
  | 'dashboard'
  | 'storytelling';

interface NavigationState {
  currentView: AppView;
  selectedProductId: string | null;
  selectedCollectionSlug: string | null;
  navigate: (view: AppView, params?: { productId?: string; collectionSlug?: string }) => void;
  goBack: () => void;
  history: AppView[];
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentView: 'home',
  selectedProductId: null,
  selectedCollectionSlug: null,
  history: [],

  navigate: (view, params) => {
    set((state) => ({
      history: [...state.history, state.currentView],
      currentView: view,
      selectedProductId: params?.productId ?? null,
      selectedCollectionSlug: params?.collectionSlug ?? null,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goBack: () => {
    set((state) => {
      const prev = state.history[state.history.length - 1] || 'home';
      return {
        currentView: prev,
        history: state.history.slice(0, -1),
        selectedProductId: null,
        selectedCollectionSlug: null,
      };
    });
  },
}));
