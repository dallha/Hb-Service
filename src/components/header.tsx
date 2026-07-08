'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, MessageCircle, Search, Home, Store } from 'lucide-react';
import { useCartStore, useNavigationStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { label: 'Accueil', view: 'home' as const },
  { label: 'Boutique', view: 'shop' as const },
  { label: 'Sélection Parfum', view: 'catalogue' as const },
  { label: 'Catalogue Maison', view: 'catalogue-maison' as const },
  { label: 'Formations', view: 'formations' as const },
  { label: 'Collections', view: 'shop' as const, params: {} },
  { label: 'Notre Histoire', view: 'storytelling' as const },
  { label: 'Journal', view: 'journal' as const },
];

import type { SiteSettingsMap } from '@/lib/settings';

export default function Header({ settings = {} }: { settings?: SiteSettingsMap }) {
  const logoUrl = settings.logo_url || '/logo-gold.jpg';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const { getTotalItems, openCart } = useCartStore();
  const { navigate } = useNavigationStore();
  const totalItems = getTotalItems();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';
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

    if (view === 'catalogue-maison') {
      router.push(`/${locale}/catalogue-maison`);
      setMobileMenuOpen(false);
      return;
    }
    
    navigate(view as any);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (isSubpage) {
      navigate('home');
      router.push('/fr');
      return;
    }

    navigate('home');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchOpen(false);
      navigate('catalogue', { searchQuery: localSearchQuery.trim() });
      setLocalSearchQuery('');
    }
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
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0"
            >
              <img
                src={logoUrl}
                alt="HB Service"
                className="h-10 w-10 sm:h-12 sm:w-12 min-w-[40px] sm:min-w-[48px] aspect-square object-cover rounded-full flex-shrink-0"
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
              {/* WhatsApp - Hidden on mobile because bottom nav is cleaner */}
              <a
                href="https://wa.me/212601134545?text=Bonjour%20HB_Service%2C%20j%27aimerais%20en%20savoir%20plus%20sur%20vos%20produits."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-none text-[#4A7C59] hover:bg-[#4A7C59]/10 transition-colors"
                aria-label="Contacter via WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {/* Dark/Light Mode Toggle — Premium (Visible on mobile top) */}
              <ThemeToggle />

              {/* Search Toggle (Hidden on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex relative rounded-none hover:bg-accent/10 w-10 h-10"
                aria-label="Recherche"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart (Hidden on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={openCart}
                className="hidden md:flex relative rounded-none hover:bg-accent/10 w-10 h-10"
                aria-label="Ouvrir le panier"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center rounded-full"
                  >
                    {totalItems}
                  </motion.span>
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
              className="fixed top-0 right-0 bottom-16 w-[280px] sm:w-72 bg-background z-50 md:hidden flex flex-col pt-16 sm:pt-20 px-5 sm:px-6"
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

      {/* Public Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border z-50 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <button
          onClick={() => { handleLogoClick(); setMobileMenuOpen(false); }}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-sans tracking-widest uppercase">Accueil</span>
        </button>

        <button
          onClick={() => { handleNav('shop'); setMobileMenuOpen(false); }}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-sans tracking-widest uppercase">Boutique</span>
        </button>

        <button
          onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-sans tracking-widest uppercase">Recherche</span>
        </button>

        <button
          onClick={() => { openCart(); setMobileMenuOpen(false); }}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans tracking-widest uppercase">Panier</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] font-sans tracking-widest uppercase">Menu</span>
        </button>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col items-center pt-24 px-4 sm:px-6"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 sm:top-8 sm:right-8 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl mb-6 text-center text-foreground">Que recherchez-vous ?</h2>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Ex: Oud, Rose, Marque..."
                  className="w-full bg-transparent border-b-2 border-muted-foreground/30 focus:border-accent text-xl sm:text-2xl py-4 pl-14 pr-4 outline-none transition-colors text-foreground"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
