'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import type { SiteSettingsMap } from '@/lib/settings';

export default function HeroSection({ settings = {} }: { settings?: SiteSettingsMap }) {
  const { navigate } = useNavigationStore();

  const heroImage = settings.hero_image_url || '/images/hero/hero-main.png';
  const title = settings.hero_title || "L'Art du Parfum,";
  const titleAccent = settings.hero_title_accent || "l'Essence du Naturel";
  const subtitle = settings.hero_subtitle || "Découvrez des créations olfactives d'exception, nées du savoir-faire africain et de la pureté des ingrédients naturels.";
  const ctaPrimary = settings.hero_cta_primary || 'Acheter maintenant';
  const ctaSecondary = settings.hero_cta_secondary || 'Découvrir la collection';

  return (
    <section className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[1000px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src={heroImage}
        alt="HB_Service — Parfums & Soins Naturels Premium"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-4 sm:mb-6"
        >
          {title}
          <br />
          <span className="text-[#D4AF37]">{titleAccent}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="font-sans text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Button
            onClick={() => navigate('shop')}
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs sm:text-sm tracking-widest uppercase px-6 sm:px-8 py-3.5 sm:py-4 h-auto rounded-none border-none"
          >
            {ctaPrimary}
          </Button>
          <Button
            onClick={() => navigate('shop', { collectionSlug: 'signature' })}
            variant="outline"
            className="w-full sm:w-auto border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] font-sans text-xs sm:text-sm tracking-widest uppercase px-6 sm:px-8 py-3.5 sm:py-4 h-auto rounded-none bg-transparent"
          >
            {ctaSecondary}
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
