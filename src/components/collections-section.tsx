'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNavigationStore } from '@/lib/store';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  heroText: string | null;
  sortOrder: number;
}

export default function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const { navigate } = useNavigationStore();

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then(setCollections)
      .catch(console.error);
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] mb-4">
            Nos Collections
          </h2>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto" />
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.15,
              }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() =>
                navigate('shop', { collectionSlug: collection.slug })
              }
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#E8E0D5]">
                {collection.imageUrl && (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h3 className="font-serif text-xl sm:text-2xl text-white mb-2">
                    {collection.name}
                  </h3>
                  <p className="font-sans text-sm text-white/80 line-clamp-2 mb-4">
                    {collection.description}
                  </p>
                  <span className="inline-block font-sans text-xs tracking-widest uppercase text-[#D4AF37] border-b border-[#D4AF37] pb-0.5">
                    Explorer
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
