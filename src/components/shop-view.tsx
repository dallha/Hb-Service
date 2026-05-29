'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import ProductCard from './product-card';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  collection: { name: string; slug: string };
  variants: { id: string; size: string; price: number; stock: number }[];
  averageRating: number;
  reviewCount: number;
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

const collectionFilters = [
  { slug: '', label: 'Toutes' },
  { slug: 'signature', label: 'Signature' },
  { slug: 'heritage', label: 'Héritage' },
  { slug: 'botanique', label: 'Botanique' },
];

export default function ShopView() {
  const { navigate, selectedCollectionSlug } = useNavigationStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(selectedCollectionSlug || '');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilter) params.set('collection', activeFilter);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeFilter]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort(
          (a, b) =>
            Math.min(...a.variants.map((v) => v.price)) -
            Math.min(...b.variants.map((v) => v.price))
        );
      case 'price-desc':
        return sorted.sort(
          (a, b) =>
            Math.min(...b.variants.map((v) => v.price)) -
            Math.min(...a.variants.map((v) => v.price))
        );
      case 'newest':
        return sorted;
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const activeCollection = collectionFilters.find(
    (c) => c.slug === activeFilter
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] mb-8">
          <button
            onClick={() => navigate('home')}
            className="hover:text-[#D4AF37] transition-colors"
          >
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1A1A1A]">Boutique</span>
          {activeCollection && activeCollection.slug && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#1A1A1A]">
                {activeCollection.label}
              </span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] mb-2">
            {activeCollection && activeCollection.slug
              ? `Collection ${activeCollection.label}`
              : 'Boutique'}
          </h1>
          <p className="font-sans text-sm text-[#8C8C8C]">
            {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E8E0D5]">
          {/* Collection Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {collectionFilters.map((filter) => (
              <button
                key={filter.slug}
                onClick={() => setActiveFilter(filter.slug)}
                className={`font-sans text-xs tracking-wider uppercase px-4 py-2 rounded-none transition-all duration-200 ${
                  activeFilter === filter.slug
                    ? 'bg-[#1A1A1A] text-[#F8F7F5]'
                    : 'bg-[#F5F0E8] text-[#8C8C8C] hover:text-[#1A1A1A]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8C8C8C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="font-sans text-xs text-[#8C8C8C] bg-transparent border border-[#E8E0D5] rounded-none px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="relevance">Pertinence</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="newest">Nouveautés</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#E8E0D5] rounded-sm mb-4" />
                <div className="h-3 bg-[#E8E0D5] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[#E8E0D5] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {sortedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {sortedProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-[#1A1A1A] mb-4">
              Aucun produit trouvé
            </p>
            <Button
              onClick={() => setActiveFilter('')}
              variant="outline"
              className="rounded-none border-[#D4AF37] text-[#D4AF37]"
            >
              Voir tous les produits
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
