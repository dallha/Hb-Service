'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, MessageCircle, Moon, Sun } from 'lucide-react';
import { useCartStore, useNavigationStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Accueil', view: 'home' as const },
  { label: 'Boutique', view: 'shop' as const },
  { label: 'Collections', view: 'shop' as const, params: {} },
  { label: 'Notre Histoire', view: 'storytelling' as const },
  { label: 'Journal', view: 'journal' as const },
];

import type { SiteSettingsMap } from '@/lib/settings';

export default function Header({ settings = {} }: { settings?: SiteSettingsMap }) {
  const logoUrl = settings.logo_url || '/logo-gold.jpg';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const { getTotalItems, openCart } = useCartStore();
  const { navigate } = useNavigationStore();
  const { isDark, toggle, mounted } = useTheme();
  const totalItems = getTotalItems();
  const router = useRouter();
  const pathname = usePathname();
  const isRootPath = pathname === '/' || pathname === '/fr' || pathname === '/en';
  const isSubpage = !isRootPath;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.includes('/admin')) return null;

  const handleNav = (view: string) => {
    if (view === 'journal') {
      router.push('/fr/journal');
      setMobileMenuOpen(false);
      return;
    }
    
    navigate(view as any);
    if (isSubpage) {
      router.push('/fr');
    }
    setMobileMenuOpen(false);
  };

  // Secret access: double-click on logo to open admin
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 2) {
      setClickCount(0);
      router.push('/admin');
    } else if (isSubpage && newCount === 1) {
      navigate('home');
      router.push('/fr');
    } else if (!isSubpage && newCount === 1) {
      navigate('home');
    }
    setTimeout(() => setClickCount(0), 500);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40'
            : 'bg-background/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo - double-click to access admin */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-1.5 sm:gap-2 group"
            >
              <img
                src={logoUrl}
                alt="HB Service"
                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full"
              />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.view)}
                  className="font-sans text-sm tracking-widest uppercase text-foreground hover:text-accent transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* WhatsApp - visible on mobile too */}
              <a
                href="https://wa.me/212601134545?text=Bonjour%20HB_Service%2C%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20produits."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-none text-[#4A7C59] hover:bg-[#4A7C59]/10 transition-colors"
                aria-label="Contacter via WhatsApp"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>

              {/* Dark/Light Mode Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className="rounded-none hover:bg-accent/10 w-9 h-9 sm:w-10 sm:h-10"
                  aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="relative rounded-none hover:bg-accent/10 w-9 h-9 sm:w-10 sm:h-10"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center rounded-full"
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
                className="md:hidden rounded-none w-9 h-9"
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
              className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-72 bg-background z-50 md:hidden flex flex-col pt-16 sm:pt-20 px-5 sm:px-6"
            >
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleNav(link.view)}
                  className="py-3.5 sm:py-4 text-left font-serif text-base sm:text-lg text-foreground border-b border-border hover:text-accent transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <a
                href="https://wa.me/212601134545?text=Bonjour%20HB_Service%2C%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20produits."
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
