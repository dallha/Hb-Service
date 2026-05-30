'use client';

import { motion } from 'framer-motion';
import { useNavigationStore } from '@/lib/store';
import type { SiteSettingsMap } from '@/lib/settings';

export default function StorytellingSection({ settings = {} }: { settings?: SiteSettingsMap }) {
  const { navigate } = useNavigationStore();

  const sections = [
    {
      title: settings.story_1_title || 'Notre Histoire',
      text: settings.story_1_text || "Née de la passion d'un créateur africain, HB_Service puise son inspiration dans les paysages et les traditions du continent.",
      image: settings.story_1_image || '/images/brand/savoir-faire.png',
    },
    {
      title: settings.story_2_title || 'Notre Savoir-Faire',
      text: settings.story_2_text || "Nos parfumeurs artisanaux combinent des siècles de tradition olfactive avec une expertise contemporaine.",
      image: settings.story_2_image || '/images/brand/savoir-faire.png',
    },
    {
      title: settings.story_3_title || 'Nos Engagements',
      text: settings.story_3_text || "Nous croyons en une beauté responsable. Nos ingrédients sont sourcés éthiquement.",
      image: settings.story_3_image || '/images/brand/savoir-faire.png',
    },
  ];

  const ctaLabel = settings.story_cta_label || 'En savoir plus';

  return (
    <section className="py-16 sm:py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
            className={`mb-16 lg:mb-24 last:mb-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${index % 2 === 1 ? 'lg:direction-rtl' : ''}`}
          >
            {/* Image */}
            <div className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-muted ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
              <img
                src={section.image}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {/* Text */}
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground mb-4">{section.title}</h3>
              <div className="w-12 h-[1px] bg-[#D4AF37] mb-6" />
              <p className="font-sans text-base text-muted-foreground leading-relaxed">{section.text}</p>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('storytelling')}
            className="font-sans text-sm tracking-widest uppercase text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-[#B8962E] hover:border-[#B8962E] transition-colors"
          >
            {ctaLabel}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
