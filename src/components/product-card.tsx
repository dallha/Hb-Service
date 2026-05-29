'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, ShoppingBag } from 'lucide-react';
import { useNavigationStore, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    collection: { name: string; slug: string };
    variants: { id: string; size: string; price: number; stock: number }[];
    averageRating: number;
    reviewCount: number;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate } = useNavigationStore();
  const { addItem, openCart } = useCartStore();
  const firstVariant = product.variants[0];
  const minPrice = Math.min(...product.variants.map((v) => v.price));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firstVariant) return;
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
    toast.success(`${product.name} ajouté au panier`);
    openCart();
  };

  return (
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
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#E8E0D5] mb-4">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}
        {/* Quick Add */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleAddToCart}
          className="absolute bottom-4 left-4 right-4 bg-[#1A1A1A] text-[#F8F7F5] font-sans text-xs tracking-widest uppercase py-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-none hover:bg-[#D4AF37] hover:text-[#1A1A1A]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Ajouter au panier
        </motion.button>
      </div>

      {/* Info */}
      <div>
        <p className="font-sans text-[10px] tracking-widest uppercase text-[#D4AF37] mb-1">
          {product.collection.name}
        </p>
        <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] mb-1 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-1">
          {product.averageRating > 0 && (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i <= Math.round(product.averageRating)
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-[#E8E0D5]'
                  }`}
                />
              ))}
              <span className="font-sans text-xs text-[#8C8C8C] ml-1">
                ({product.reviewCount})
              </span>
            </>
          )}
        </div>
        <p className="font-sans text-sm text-[#1A1A1A] font-medium">
          À partir de {formatPrice(minPrice)}
        </p>
      </div>
    </motion.div>
  );
}
