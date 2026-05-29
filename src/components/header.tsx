'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { useCartStore, useNavigationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Accueil', view: 'home' as const },
  { label: 'Boutique', view: 'shop' as const },
  { label: 'Collections', view: 'shop' as const, params: {} },
  { label: 'Notre Histoire', view: 'storytelling' as const },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const { navigate } = useNavigationStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: 'home' | 'shop' | 'storytelling') => {
    navigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#F8F7F5]/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 group"
            >
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A]">
                HB<span className="text-[#D4AF37]">_</span>Service
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.view)}
                  className="font-sans text-sm tracking-widest uppercase text-[#1A1A1A] hover:text-[#D4AF37] transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/221770000000?text=Bonjour%20HB_Service%2C%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20produits."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-none text-[#4A7C59] hover:bg-[#4A7C59]/10 transition-colors"
                aria-label="Contacter via WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative rounded-none hover:bg-[#D4AF37]/10"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#1A1A1A] text-xs font-bold flex items-center justify-center rounded-full"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden rounded-none"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#F8F7F5] z-50 md:hidden flex flex-col pt-20 px-6"
            >
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleNav(link.view)}
                  className="py-4 text-left font-serif text-lg text-[#1A1A1A] border-b border-[#E8E0D5] hover:text-[#D4AF37] transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <a
                href="https://wa.me/221770000000?text=Bonjour%20HB_Service%2C%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20produits."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-3 py-4 text-[#4A7C59] font-sans text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Support WhatsApp
              </a>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
