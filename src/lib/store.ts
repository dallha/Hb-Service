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
  cartToken: string | null;
  
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
      cartToken: null,

      addItem: (item) => {
        set((state) => {
          const newToken = state.cartToken || Math.random().toString(36).substring(2) + Date.now().toString(36);
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              cartToken: newToken,
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cartToken: newToken, items: [...state.items, item] };
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
      partialize: (state) => ({ items: state.items, cartToken: state.cartToken }),
    }
  )
);

// ─── Navigation Store ──────────────────────────────────────────
// Manages SPA navigation state (since we're building within / route)

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'catalogue'
  | 'product' 
  | 'checkout' 
  | 'dashboard'
  | 'storytelling'
  | 'formations';

export type CataloguePreset = 'all' | 'new' | 'men' | 'women' | 'unisex';

interface NavigationState {
  currentView: AppView;
  selectedProductSlug: string | null;
  selectedCollectionSlug: string | null;
  selectedCataloguePreset: CataloguePreset;
  searchQuery: string;
  navigate: (
    view: AppView,
    params?: {
      productSlug?: string;
      collectionSlug?: string;
      cataloguePreset?: CataloguePreset;
      searchQuery?: string;
    }
  ) => void;
  goBack: () => void;
  history: AppView[];
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentView: 'home',
  selectedProductSlug: null,
  selectedCollectionSlug: null,
  selectedCataloguePreset: 'all',
  searchQuery: '',
  history: [],

  navigate: (view, params) => {
    set((state) => ({
      history: [...state.history, state.currentView],
      currentView: view,
      selectedProductSlug: params?.productSlug ?? null,
      selectedCollectionSlug: params?.collectionSlug ?? null,
      selectedCataloguePreset: params?.cataloguePreset ?? 'all',
      searchQuery: params?.searchQuery ?? '',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isSubpage = !(path === '/' || path === '/fr' || path === '/en');
      if (isSubpage) {
        const queryParams = new URLSearchParams();
        queryParams.set('view', view);
        if (params?.productSlug) queryParams.set('product', params.productSlug);
        if (params?.cataloguePreset && params.cataloguePreset !== 'all') queryParams.set('preset', params.cataloguePreset);
        if (params?.searchQuery) queryParams.set('q', params.searchQuery);
        
        const localeMatch = path.match(/^\/([a-z]{2})(?:\/|$)/);
        const locale = localeMatch ? localeMatch[1] : 'fr';
        
        window.location.href = `/${locale}?${queryParams.toString()}`;
      }
    }
  },

  goBack: () => {
    set((state) => {
      const prev = state.history[state.history.length - 1] || 'home';
      return {
        currentView: prev,
        history: state.history.slice(0, -1),
        selectedProductSlug: null,
        selectedCollectionSlug: null,
        selectedCataloguePreset: 'all',
        searchQuery: '',
      };
    });
  },
}));
