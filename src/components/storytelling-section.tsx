'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNavigationStore } from '@/lib/store';

export default function StorytellingSection() {
  const { navigate } = useNavigationStore();

  const sections = [
    {
      title: 'Notre Histoire',
      text: "Née de la passion d'un créateur africain, HB_Service puise son inspiration dans les paysages et les traditions du continent. Chaque fragrance raconte une histoire — celle des couchers de soleil sur le Sahel, des marchés d'épices de la Médina, des roses sauvages après la pluie.",
    },
    {
      title: 'Notre Savoir-Faire',
      text: "Nos parfumeurs artisanaux combinent des siècles de tradition olfactive avec une expertise contemporaine. Chaque flacon est le fruit d'un travail minutieux, où les ingrédients les plus nobles sont sélectionnés avec soin pour créer des compositions d'une élégance intemporelle.",
    },
    {
      title: 'Nos Engagements',
      text: "Nous croyons en une beauté responsable. Nos ingrédients sont sourcés éthiquement, nos formulations sont libres de parabènes et de sulfates, et nos packagings sont pensés pour minimiser notre impact environnemental. Le luxe peut être conscient.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.1,
            }}
            className={`mb-16 lg:mb-24 last:mb-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
              index % 2 === 1 ? 'lg:direction-rtl' : ''
            }`}
          >
            {/* Image */}
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-[#E8E0D5] ${
                index % 2 === 1 ? 'lg:order-2' : ''
              }`}
            >
              <Image
                src="/images/brand/savoir-faire.png"
                alt={section.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1A1A1A] mb-4">
                {section.title}
              </h3>
              <div className="w-12 h-[1px] bg-[#D4AF37] mb-6" />
              <p className="font-sans text-base text-[#8C8C8C] leading-relaxed">
                {section.text}
              </p>
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
            En savoir plus
          </button>
        </motion.div>
      </div>
    </section>
  );
}
