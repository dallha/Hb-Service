'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  imageUrl: string | null;
  collection: { name: string; slug: string };
  variants: { id: string; size: string; price: number; stock: number }[];
  averageRating: number;
  reviewCount: number;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const { navigate } = useNavigationStore();

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) =>
        setProducts(
          [...data]
            .filter((p) => p.isNew)
            .sort((a, b) => {
              const aIsHB = a.name.includes('HB_Service');
              const bIsHB = b.name.includes('HB_Service');
              if (aIsHB && !bIsHB) return -1;
              if (!aIsHB && bIsHB) return 1;
              return (
                (a.sourcePage ?? 0) - (b.sourcePage ?? 0) ||
                (a.brand || '').localeCompare(b.brand || '') ||
                a.name.localeCompare(b.name)
              );
            })
            .slice(0, 8)
        )
      )
      .catch(console.error);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            Créations de la Maison & Nouveautés
          </h2>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mb-4" />
          <p className="font-sans text-sm text-muted-foreground max-w-lg mx-auto">
            Découvrez en exclusivité nos propres créations artisanales HB_Service, accompagnées de notre sélection des dernières nouveautés.
          </p>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('catalogue', { cataloguePreset: 'new' })}
            className="font-sans text-sm tracking-widest uppercase text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-[#B8962E] hover:border-[#B8962E] transition-colors"
          >
            Voir la sélection
          </button>
        </motion.div>
      </div>
    </section>
  );
}
