'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNavigationStore } from '@/lib/store';
import type { SiteSettingsMap } from '@/lib/settings';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  gender: string | null;
  isNew: boolean;
  imageUrl: string | null;
  sourcePage: number | null;
  collection: { name: string; slug: string };
  variants: { id: string; size: string; price: number; stock: number }[];
}

type SegmentKey = 'all' | 'new' | 'men' | 'women' | 'unisex';

const segmentConfig: Record<SegmentKey, { title: string; subtitle: string; preset: SegmentKey; fallback: string }> = {
  all: {
    title: 'Sélection complète',
    subtitle: 'L’ensemble du catalogue Mars 2026 dans une présentation élégante.',
    preset: 'all',
    fallback: '/images/products/perfume-amber.png',
  },
  new: {
    title: 'Nouveautés',
    subtitle: 'Les références marquées New dans la sélection.',
    preset: 'new',
    fallback: '/images/products/perfume-amber.png',
  },
  men: {
    title: 'Parfums Homme',
    subtitle: 'Les références H du catalogue, présentées avec clarté.',
    preset: 'men',
    fallback: '/images/products/perfume-oud.png',
  },
  women: {
    title: 'Parfums Femme',
    subtitle: 'Les références F du catalogue, mises en avant avec élégance.',
    preset: 'women',
    fallback: '/images/products/perfume-rose.png',
  },
  unisex: {
    title: 'Parfums Unisexes',
    subtitle: 'Les références U, pensées pour une lecture moderne et équilibrée.',
    preset: 'unisex',
    fallback: '/images/products/perfume-amber.png',
  },
};

function pickRepresentative(products: Product[], key: SegmentKey) {
  const filtered =
    key === 'new'
      ? products.filter((p) => p.isNew)
      : key === 'men'
        ? products.filter((p) => p.gender === 'H')
        : key === 'women'
          ? products.filter((p) => p.gender === 'F')
          : key === 'unisex'
            ? products.filter((p) => p.gender === 'U')
            : products;

  return [...filtered].sort((a, b) => (a.sourcePage ?? 0) - (b.sourcePage ?? 0) || a.name.localeCompare(b.name))[0] ?? null;
}

export default function CollectionsSection({ settings = {} }: { settings?: SiteSettingsMap }) {
  const [products, setProducts] = useState<Product[]>([]);
  const { navigate } = useNavigationStore();
  const sectionTitle = settings.collections_section_title || 'Sélections du catalogue';
  const ctaLabel = settings.collections_cta_label || 'Explorer la sélection';

  useEffect(() => {
    fetch('/api/products?collection=catalogue-2026')
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const segments = useMemo(
    () =>
      (Object.keys(segmentConfig) as SegmentKey[])
        .map((key) => {
          const representative = pickRepresentative(products, key);
          const count =
            key === 'new'
              ? products.filter((p) => p.isNew).length
              : key === 'men'
                ? products.filter((p) => p.gender === 'H').length
                : key === 'women'
                  ? products.filter((p) => p.gender === 'F').length
                  : key === 'unisex'
                    ? products.filter((p) => p.gender === 'U').length
                    : products.length;

          return {
            key,
            count,
            ...segmentConfig[key],
            imageUrl: representative?.imageUrl || segmentConfig[key].fallback,
            badge: representative?.brand || 'HB Service',
          };
        })
        .filter((segment) => segment.count > 0),
    [products]
  );

  if (segments.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
            {sectionTitle}
          </h2>
          <p className="font-sans text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Des sélections claires pour parcourir le catalogue par univers, sans surcharge visuelle.
          </p>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {segments.map((segment, index) => (
            <motion.button
              key={segment.key}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.12,
              }}
              whileHover={{ y: -4 }}
              onClick={() => navigate('catalogue', { cataloguePreset: segment.preset })}
              className="group cursor-pointer text-left"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                <Image
                  src={segment.imageUrl}
                  alt={segment.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/70 mb-2">
                    {segment.badge}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl text-white mb-2">
                    {segment.title}
                  </h3>
                  <p className="font-sans text-sm text-white/80 line-clamp-2 mb-4">
                    {segment.subtitle}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-block font-sans text-[10px] tracking-widest uppercase text-[#D4AF37] border-b border-[#D4AF37] pb-0.5">
                      {ctaLabel}
                    </span>
                    <span className="font-sans text-xs text-white/75">
                      {segment.count} références
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
