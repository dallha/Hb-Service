'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/lib/store';
import HeroSection from '@/components/hero-section';
import CollectionsSection from '@/components/collections-section';
import StorytellingSection from '@/components/storytelling-section';
import ReassuranceSection from '@/components/reassurance-section';
import FeaturedProducts from '@/components/featured-products';
import ShopView from '@/components/shop-view';
import ProductView from '@/components/product-view';
import CartDrawer from '@/components/cart-drawer';
import CheckoutView from '@/components/checkout-view';
import StorytellingView from '@/components/storytelling-view';
import type { SiteSettingsMap } from '@/lib/settings';

export default function HomeClient({ settings }: { settings: SiteSettingsMap }) {
  const { currentView } = useNavigationStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CartDrawer />
      <main className="flex-1 pt-14 sm:pt-0">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <HeroSection settings={settings} />
              <CollectionsSection settings={settings} />
              <StorytellingSection settings={settings} />
              <ReassuranceSection settings={settings} />
              <FeaturedProducts />
            </motion.div>
          )}
          {currentView === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <ShopView />
            </motion.div>
          )}
          {currentView === 'product' && (
            <motion.div key="product" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <ProductView />
            </motion.div>
          )}
          {currentView === 'checkout' && (
            <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <CheckoutView />
            </motion.div>
          )}
          {currentView === 'storytelling' && (
            <motion.div key="storytelling" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <StorytellingView settings={settings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
