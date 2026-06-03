'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';

type SegmentKey = 'new' | 'men' | 'women' | 'unisex';

const segments: Array<{
  key: SegmentKey;
  title: string;
  description: string;
  preset: SegmentKey;
  accent: string;
}> = [
  {
    key: 'new',
    title: 'Nouveautés',
    description: 'Les premières références mises en avant dans le catalogue Mars 2026.',
    preset: 'new',
    accent: 'Nouveauté',
  },
  {
    key: 'men',
    title: 'Parfums Homme',
    description: 'Une entrée directe vers les références H du catalogue.',
    preset: 'men',
    accent: 'Homme',
  },
  {
    key: 'women',
    title: 'Parfums Femme',
    description: 'Une lecture raffinée des références F.',
    preset: 'women',
    accent: 'Femme',
  },
  {
    key: 'unisex',
    title: 'Parfums Unisexes',
    description: 'Les références U pour une sélection plus contemporaine.',
    preset: 'unisex',
    accent: 'Unisexe',
  },
  {
    key: 'maison',
    title: 'Catalogue Maison',
    description: 'Découvrez nos bougies et parfums d\\'intérieur pour une ambiance unique.',
    preset: 'maison' as any,
    accent: 'Maison',
  },
];

export default function CatalogueSegments() {
  const { navigate } = useNavigationStore();

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {segments.map((segment, index) => (
            <motion.button
              key={segment.key}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => {
                if (segment.preset === 'maison') {
                  window.location.href = '/fr/catalogue-maison'; // Or dynamic locale if available
                } else {
                  navigate('catalogue', { cataloguePreset: segment.preset });
                }
              }}
              className="group text-left p-6 sm:p-7 border border-border bg-card/40 backdrop-blur-sm hover:border-[#D4AF37]/60 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37]">
                  {segment.accent}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#D4AF37] transition-colors" />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3">
                {segment.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {segment.description}
              </p>
              <div className="mt-6 h-px w-full bg-border" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
