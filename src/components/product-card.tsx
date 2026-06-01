'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useNavigationStore, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { SoundEngine } from '@/components/SoundEngine';
import ParticleEffect from '@/components/ParticleEffect';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand?: string | null;
    gender?: string | null;
    isNew?: boolean;
    sourcePage?: number | null;
    imageUrl: string | null;
    collection: { name: string; slug: string };
    variants: { id: string; size: string; price: number; compareAtPrice?: number | null; stock: number }[];
    averageRating: number;
    reviewCount: number;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate } = useNavigationStore();
  const { addItem, openCart } = useCartStore();
  const [particleTrigger, setParticleTrigger] = useState(0);
  
  // Find variant with the minimum price
  const cheapestVariant = product.variants.reduce((prev, curr) => 
    (!prev || curr.price < prev.price) ? curr : prev
  , product.variants[0]);

  const minPrice = cheapestVariant ? cheapestVariant.price : 0;
  const compareAtPrice = cheapestVariant ? cheapestVariant.compareAtPrice : null;
  const firstVariant = product.variants[0];
  const canAddToCart = Boolean(firstVariant && firstVariant.price > 0);
  const fallbackImageUrl =
    product.collection.slug === 'catalogue-2026'
      ? product.gender === 'F'
        ? '/images/products/perfume-rose.png'
        : product.gender === 'H'
        ? '/images/products/perfume-oud.png'
        : '/images/products/perfume-amber.png'
      : null;
  const displayImageUrl = product.imageUrl || fallbackImageUrl;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant || !canAddToCart) {
      navigate('product', { productId: product.id });
      return;
    }
    addItem({
      variantId: firstVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSize: firstVariant.size,
      price: firstVariant.price,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
    });
    // Son premium d'ajout au panier
    SoundEngine.playAddToCart();
    // Particules dorées
    setParticleTrigger(prev => prev + 1);
    toast.success(`${product.name} ajouté au panier`);
    openCart();
  };

  return (
    <>
      <ParticleEffect trigger={particleTrigger} count={16} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          delay: index * 0.08,
        }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
        onClick={() => navigate('product', { productId: product.id })}
      >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3 sm:mb-4">
        {displayImageUrl && (
          <Image
            src={displayImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        {/* Quick Add - always visible on mobile, hover on desktop */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-foreground text-background font-sans text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-none hover:bg-accent hover:text-accent-foreground min-h-[40px] sm:min-h-0"
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {canAddToCart ? 'Ajouter' : 'Détails'}
        </motion.button>
      </div>

      {/* Info */}
      <div className="px-0.5">
        {product.brand && (
          <p className="font-sans text-[9px] sm:text-[10px] tracking-widest uppercase text-muted-foreground mb-0.5 sm:mb-1">
            {product.brand}
          </p>
        )}
        <p className="font-sans text-[9px] sm:text-[10px] tracking-widest uppercase text-accent mb-0.5 sm:mb-1">
          {product.collection.name}
        </p>
        <h3 className="font-serif text-sm sm:text-lg text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {product.collection.slug === 'catalogue-2026' && (
            <span className="inline-flex items-center rounded-none border border-[#D4AF37] px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[#D4AF37]">
              Sélection
            </span>
          )}
          {product.gender && (
            <span className="inline-flex items-center rounded-none border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              {product.gender}
            </span>
          )}
          {product.isNew && (
            <span className="inline-flex items-center rounded-none border border-foreground px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-foreground">
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mb-1">
          {product.averageRating > 0 && (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i <= Math.round(product.averageRating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-[#E8E0D5]'
                  }`}
                />
              ))}
              <span className="font-sans text-[10px] sm:text-xs text-muted-foreground ml-0.5">
                ({product.reviewCount})
              </span>
            </>
          )}
        </div>
        <p className="font-sans text-xs sm:text-sm text-foreground font-medium flex items-center gap-2">
          <span>
            {minPrice > 0 ? `À partir de ${formatPrice(minPrice)}` : formatPrice(minPrice)}
          </span>
          {compareAtPrice && compareAtPrice > minPrice && (
            <span className="text-muted-foreground line-through text-[10px] sm:text-xs font-normal">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </motion.div>
    </>
  );
}
