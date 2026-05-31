'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import ProductCard from './product-card';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  gender: string | null;
  isNew: boolean;
  sourcePage: number | null;
  arabicName: string | null;
  imageUrl: string | null;
  collection: { name: string; slug: string };
  variants: { id: string; size: string; price: number; compareAtPrice?: number | null; stock: number }[];
  averageRating: number;
  reviewCount: number;
  catalogOrder?: number | null;
}

type SortOption = 'relevance' | 'name-asc' | 'name-desc' | 'page-asc' | 'newest';

export default function CatalogueView() {
  const { navigate } = useNavigationStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'H' | 'F' | 'U'>('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [newOnly, setNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  useEffect(() => {
    fetch('/api/products?collection=catalogue-2026')
      .then((r) => r.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.brand?.trim())
            .filter((brand): brand is string => Boolean(brand))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    let next = [...products];

    if (lowerQuery) {
      next = next.filter((p) => {
        const haystack = [
          p.brand,
          p.name,
          p.arabicName,
          p.gender,
          p.sourcePage?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(lowerQuery);
      });
    }

    if (genderFilter !== 'all') {
      next = next.filter((p) => p.gender === genderFilter);
    }

    if (brandFilter !== 'all') {
      next = next.filter((p) => p.brand === brandFilter);
    }

    if (newOnly) {
      next = next.filter((p) => p.isNew);
    }

    switch (sortBy) {
      case 'name-asc':
        next.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        next.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'page-asc':
        next.sort((a, b) => (a.sourcePage ?? 0) - (b.sourcePage ?? 0) || a.name.localeCompare(b.name));
        break;
      case 'newest':
        next.sort((a, b) => Number(b.isNew) - Number(a.isNew) || (a.sourcePage ?? 0) - (b.sourcePage ?? 0));
        break;
      default:
        next.sort((a, b) => (a.catalogOrder ?? 0) - (b.catalogOrder ?? 0));
    }

    return next;
  }, [brandFilter, genderFilter, newOnly, products, query, sortBy]);

  const activeCount = filteredProducts.length;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 font-sans text-xs text-muted-foreground mb-8 flex-wrap">
          <button onClick={() => navigate('home')} className="hover:text-accent transition-colors">
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Catalogue 2026</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-end mb-10">
          <div>
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
              Collection catalogue
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground mb-4">
              Catalogue 2026
            </h1>
            <p className="font-sans text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Parcours filtrable de toutes les références du catalogue Mars 2026, pensé pour retrouver rapidement une marque, un genre, une nouveauté ou une page source.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-none border border-border p-4">
              <p className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Références</p>
              <p className="font-serif text-2xl text-foreground">{products.length}</p>
            </div>
            <div className="rounded-none border border-border p-4">
              <p className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Filtrées</p>
              <p className="font-serif text-2xl text-foreground">{activeCount}</p>
            </div>
            <div className="rounded-none border border-border p-4">
              <p className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Marques</p>
              <p className="font-serif text-2xl text-foreground">{brands.length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8 pb-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une marque, un parfum, un genre..."
              className="w-full rounded-none border border-border bg-background pl-11 pr-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setGenderFilter('all')}
                className={`font-sans text-[11px] tracking-widest uppercase px-4 py-2 rounded-none transition-all ${
                  genderFilter === 'all'
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Tous
              </button>
              {(['H', 'F', 'U'] as const).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`font-sans text-[11px] tracking-widest uppercase px-4 py-2 rounded-none transition-all ${
                    genderFilter === gender
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {gender}
                </button>
              ))}
              <button
                onClick={() => setNewOnly((v) => !v)}
                className={`font-sans text-[11px] tracking-widest uppercase px-4 py-2 rounded-none transition-all ${
                  newOnly
                    ? 'bg-[#D4AF37] text-[#1A1A1A]'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                New
              </button>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="font-sans text-xs text-muted-foreground bg-transparent border border-border rounded-none px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Toutes les marques</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="font-sans text-xs text-muted-foreground bg-transparent border border-border rounded-none px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="relevance">Ordre catalogue</option>
                <option value="page-asc">Page croissante</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="name-desc">Nom Z-A</option>
                <option value="newest">Nouveautés d’abord</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-sm mb-4" />
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${query}-${genderFilter}-${brandFilter}-${newOnly}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-foreground mb-4">
              Aucun parfum trouvé
            </p>
            <button
              onClick={() => {
                setQuery('');
                setGenderFilter('all');
                setBrandFilter('all');
                setNewOnly(false);
                setSortBy('relevance');
              }}
              className="font-sans text-xs tracking-widest uppercase px-5 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] transition-colors rounded-none"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
