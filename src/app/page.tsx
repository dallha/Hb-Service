'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationStore } from '@/lib/store';
import Header from '@/components/header';
import Footer from '@/components/footer';
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
import DashboardView from '@/components/dashboard-view';

export default function Home() {
  const { currentView } = useNavigationStore();

  // Seed database on first load
  useEffect(() => {
    fetch('/api/seed').catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroSection />
              <CollectionsSection />
              <StorytellingSection />
              <ReassuranceSection />
              <FeaturedProducts />
            </motion.div>
          )}
          {currentView === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ShopView />
            </motion.div>
          )}
          {currentView === 'product' && (
            <motion.div
              key="product"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductView />
            </motion.div>
          )}
          {currentView === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <CheckoutView />
            </motion.div>
          )}
          {currentView === 'storytelling' && (
            <motion.div
              key="storytelling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <StorytellingView />
            </motion.div>
          )}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <DashboardView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
