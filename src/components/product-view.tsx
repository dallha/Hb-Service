'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Star,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
  Minus,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { useNavigationStore, useCartStore } from '@/lib/store';
import { formatPrice, getWhatsAppLink } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProductCard from './product-card';

interface Variant {
  id: string;
  size: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  notesOlfactives: string | null;
  inspiration: string | null;
  imageUrl: string | null;
  galleryUrls: string | null;
  relatedRitualIds: string | null;
  collection: { name: string; slug: string };
  variants: Variant[];
  averageRating: number;
  reviewCount: number;
  reviews: { userName: string; rating: number; comment: string }[];
}

export default function ProductView() {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { navigate, selectedProductId } = useNavigationStore();
  const { addItem, openCart } = useCartStore();

  const loading = selectedProductId !== fetchedId;

  useEffect(() => {
    if (!selectedProductId) return;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.id === selectedProductId);
        setProduct(found || null);
        setAllProducts(data);
        setFetchedId(selectedProductId);
      })
      .catch(() => setFetchedId(selectedProductId));
  }, [selectedProductId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="animate-pulse aspect-square bg-[#E8E0D5] rounded-sm" />
            <div className="space-y-4">
              <div className="h-4 bg-[#E8E0D5] rounded w-1/4" />
              <div className="h-8 bg-[#E8E0D5] rounded w-3/4" />
              <div className="h-4 bg-[#E8E0D5] rounded w-1/3" />
              <div className="h-20 bg-[#E8E0D5] rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#F8F7F5] flex items-center justify-center">
        <p className="font-serif text-2xl text-[#1A1A1A]">Produit non trouvé</p>
      </div>
    );
  }

  const variant = product.variants[selectedVariantIndex];
  const galleryImages: string[] = product.galleryUrls
    ? JSON.parse(product.galleryUrls)
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const notes = product.notesOlfactives
    ? JSON.parse(product.notesOlfactives)
    : null;

  const relatedProducts = product.relatedRitualIds
    ? allProducts.filter((p) =>
        JSON.parse(product.relatedRitualIds!).includes(p.id)
      )
    : [];

  const stockColor =
    variant && variant.stock > 10
      ? 'text-[#4A7C59]'
      : variant && variant.stock > 0
      ? 'text-[#D4A037]'
      : 'text-[#C44536]';

  const stockText =
    variant && variant.stock > 10
      ? 'En stock'
      : variant && variant.stock > 0
      ? `Plus que ${variant.stock} en stock`
      : 'Rupture de stock';

  const handleAddToCart = () => {
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSize: variant.size,
      price: variant.price,
      quantity,
      imageUrl: product.imageUrl || undefined,
    });
    toast.success(`${product.name} (${variant.size}) ajouté au panier`);
    openCart();
  };

  const waMessage = `Bonjour HB_Service, je suis intéressé(e) par le produit ${product.name} (${variant?.size}) — ${formatPrice(variant?.price || 0)}. Pouvez-vous m'en dire plus ?`;
  const waLink = getWhatsAppLink(waMessage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] mb-8 flex-wrap">
          <button
            onClick={() => navigate('home')}
            className="hover:text-[#D4AF37] transition-colors"
          >
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => navigate('shop')}
            className="hover:text-[#D4AF37] transition-colors"
          >
            Boutique
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() =>
              navigate('shop', { collectionSlug: product.collection.slug })
            }
            className="hover:text-[#D4AF37] transition-colors"
          >
            {product.collection.name}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1A1A1A]">{product.name}</span>
        </nav>

        {/* Main Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm bg-[#E8E0D5] mb-4 group">
              {galleryImages[selectedImageIndex] && (
                <Image
                  src={galleryImages[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex gap-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-20 h-20 overflow-hidden rounded-sm border-2 transition-colors ${
                      i === selectedImageIndex
                        ? 'border-[#D4AF37]'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} vue ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="font-sans text-[10px] tracking-widest uppercase text-[#D4AF37] mb-2">
              {product.collection.name}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(product.averageRating)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-[#E8E0D5]'
                    }`}
                  />
                ))}
              </div>
              <span className="font-sans text-sm text-[#8C8C8C]">
                ({product.reviewCount} avis)
              </span>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <p className="font-sans text-xs tracking-widest uppercase text-[#8C8C8C] mb-3">
                  Contenance
                </p>
                <div className="flex gap-3">
                  {product.variants.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantIndex(i);
                        setQuantity(1);
                      }}
                      className={`font-sans text-sm px-5 py-2.5 rounded-none border transition-all ${
                        i === selectedVariantIndex
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F8F7F5]'
                          : 'border-[#E8E0D5] text-[#8C8C8C] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="mb-6">
              <p className="font-serif text-2xl text-[#1A1A1A] mb-1">
                {formatPrice(variant?.price || 0)}
              </p>
              <p className={`font-sans text-xs ${stockColor}`}>{stockText}</p>
            </div>

            {/* Description */}
            <p className="font-sans text-sm text-[#8C8C8C] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-[#E8E0D5] rounded-none">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-sans text-sm text-[#1A1A1A]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-sm tracking-widest uppercase py-4 h-auto rounded-none border-none"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ajouter au panier
              </Button>
            </div>

            {/* Quick Buy & WhatsApp */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F7F5] font-sans text-xs tracking-widest uppercase rounded-none"
              >
                Achat rapide
              </Button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 flex-1 border border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white font-sans text-xs tracking-widest uppercase py-3 rounded-none transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            {/* Back */}
            <button
              onClick={() => navigate('shop')}
              className="mt-6 flex items-center gap-2 font-sans text-xs text-[#8C8C8C] hover:text-[#D4AF37] transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Retour à la boutique
            </button>
          </div>
        </div>

        {/* Notes Olfactives */}
        {notes && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mb-2">
              Notes Olfactives
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Notes de Tête', items: notes.head, icon: '✦' },
                { label: 'Notes de Cœur', items: notes.heart, icon: '◆' },
                { label: 'Notes de Fond', items: notes.base, icon: '●' },
              ].map((section) => (
                <div
                  key={section.label}
                  className="p-6 bg-[#F5F0E8] rounded-sm border border-[#E8E0D5]"
                >
                  <p className="font-sans text-[10px] tracking-widest uppercase text-[#D4AF37] mb-3">
                    {section.icon} {section.label}
                  </p>
                  <ul className="space-y-1.5">
                    {section.items?.map((item: string) => (
                      <li
                        key={item}
                        className="font-serif text-base text-[#1A1A1A]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspiration */}
        {product.inspiration && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mb-2">
              Inspiration
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mb-6" />
            <p className="font-serif text-lg text-[#8C8C8C] leading-relaxed max-w-3xl italic">
              &ldquo;{product.inspiration}&rdquo;
            </p>
          </div>
        )}

        {/* Related Ritual Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mb-2">
              Complétez votre Rituel
            </h2>
            <div className="w-12 h-[1px] bg-[#D4AF37] mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp, index) => (
                <ProductCard key={rp.id} product={rp} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
