'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, Leaf, Gem, Heart, Sparkles } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';

export default function StorytellingView() {
  const { navigate } = useNavigationStore();

  const sections = [
    {
      icon: Gem,
      title: 'Notre Histoire',
      text: "Née de la passion d'un créateur africain, HB_Service puise son inspiration dans les paysages et les traditions du continent. Chaque fragrance raconte une histoire — celle des couchers de soleil sur le Sahel, des marchés d'épices de la Médina, des roses sauvages après la pluie. Fondée avec la conviction que l'Afrique mérite une parfumerie d'excellence, la maison s'est imposée comme une référence du luxe olfactif sur le continent.",
      image: '/images/brand/savoir-faire.png',
    },
    {
      icon: Sparkles,
      title: 'Notre Savoir-Faire',
      text: "Nos parfumeurs artisanaux combinent des siècles de tradition olfactive avec une expertise contemporaine. Chaque flacon est le fruit d'un travail minutieux, où les ingrédients les plus nobles sont sélectionnés avec soin pour créer des compositions d'une élégance intemporelle. De la récolte des matières premières à la mise en flacon, chaque étape est réalisée avec une attention obsessionnelle au détail.",
      image: '/images/brand/savoir-faire.png',
    },
    {
      icon: Heart,
      title: 'Nos Engagements',
      text: "Nous croyons en une beauté responsable. Nos ingrédients sont sourcés éthiquement auprès de communautés locales, nos formulations sont libres de parabènes et de sulfates, et nos packagings sont pensés pour minimiser notre impact environnemental. Le luxe peut être conscient, et nous le prouvons chaque jour à travers nos choix.",
      image: '/images/brand/savoir-faire.png',
    },
    {
      icon: Leaf,
      title: 'Nos Ingrédients',
      text: "De l'oud du Cambodge à la rose de Damas, du beurre de karité du Sahel à l'huile d'argan du Maroc, nos ingrédients voyagent des terres les plus fertiles jusqu'à nos ateliers. Chaque matière première est sélectionnée pour sa qualité exceptionnelle et son histoire unique, garantissant des creations d'une authenticité rare.",
      image: '/images/brand/savoir-faire.png',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ChevronLeft className="w-3 h-3" />
          Retour à l&apos;accueil
        </button>

        {/* Hero */}
        <div className="text-center mb-16 lg:mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] mb-6"
          >
            Notre Histoire,
            <br />
            <span className="text-[#D4AF37]">Notre Passion</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-20 h-[1px] bg-[#D4AF37] mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-base text-[#8C8C8C] max-w-2xl mx-auto leading-relaxed"
          >
            Depuis sa création, HB_Service incarne l&apos;excellence du parfum et du
            soin naturel, puisant dans l&apos;héritage africain pour créer des
            expériences sensorielles d&apos;exception.
          </motion.p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`mb-20 lg:mb-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
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
                src={section.image}
                alt={section.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">
                  {section.title}
                </h2>
              </div>
              <div className="w-12 h-[1px] bg-[#D4AF37] mb-6" />
              <p className="font-sans text-base text-[#8C8C8C] leading-relaxed">
                {section.text}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-16 bg-[#F5F0E8] rounded-sm px-8"
        >
          <h2 className="font-serif text-3xl text-[#1A1A1A] mb-4">
            Nos Valeurs
          </h2>
          <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {['Qualité', 'Authenticité', 'Élégance', 'Confiance'].map(
              (value) => (
                <div key={value} className="py-2">
                  <p className="font-serif text-base sm:text-xl text-[#1A1A1A]">{value}</p>
                  <div className="w-6 h-[1px] bg-[#D4AF37] mx-auto mt-2" />
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('home')}
            className="font-sans text-sm tracking-widest uppercase text-[#D4AF37] border-b border-[#D4AF37] pb-1 hover:text-[#B8962E] hover:border-[#B8962E] transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </motion.div>
  );
}
