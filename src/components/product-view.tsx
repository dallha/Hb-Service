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
  reviews: { userName: string; rating: number; comment: string | null; createdAt: string }[];
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

  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

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
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="animate-pulse aspect-square bg-muted rounded-sm" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
        <p className="font-serif text-2xl text-foreground">Produit non trouvé</p>
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.userName.trim()) return toast.error('Votre nom est requis');
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewForm.userName,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Votre avis a été soumis et est en attente de modération');
      setReviewForm({ userName: '', rating: 5, comment: '' });
    } catch {
      toast.error('Erreur lors de la soumission de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-24 pb-16 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-muted-foreground mb-8 flex-wrap">
          <button
            onClick={() => navigate('home')}
            className="hover:text-accent transition-colors"
          >
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => navigate('shop')}
            className="hover:text-accent transition-colors"
          >
            Boutique
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() =>
              navigate('shop', { collectionSlug: product.collection.slug })
            }
            className="hover:text-accent transition-colors"
          >
            {product.collection.name}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Main Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm bg-muted mb-3 sm:mb-4 group">
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
              <div className="flex gap-2 sm:gap-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-sm border-2 transition-colors ${
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
            <p className="font-sans text-[10px] tracking-widest uppercase text-accent mb-2">
              {product.collection.name}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
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
              <span className="font-sans text-sm text-muted-foreground">
                ({product.reviewCount} avis)
              </span>
            </div>

            {/* Variant Selector */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">
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
              <p className="font-serif text-2xl text-foreground mb-1">
                {formatPrice(variant?.price || 0)}
              </p>
              <p className={`font-sans text-xs ${stockColor}`}>{stockText}</p>
            </div>

            {/* Description */}
            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center border border-border rounded-none">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors min-h-[44px] sm:min-h-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-sans text-sm text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors min-h-[44px] sm:min-h-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs sm:text-sm tracking-widest uppercase py-3.5 sm:py-4 h-auto rounded-none border-none min-h-[44px] sm:min-h-0"
              >
                <ShoppingBag className="w-4 h-4 mr-1.5 sm:mr-2" />
                Ajouter au panier
              </Button>
            </div>

            {/* Quick Buy & WhatsApp */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 border-foreground text-foreground hover:bg-foreground hover:text-background font-sans text-[10px] sm:text-xs tracking-widest uppercase rounded-none min-h-[44px] sm:min-h-0"
              >
                Achat rapide
              </Button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 border border-[#4A7C59] text-[#4A7C59] hover:bg-[#4A7C59] hover:text-white font-sans text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 rounded-none transition-colors min-h-[44px] sm:min-h-0"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                WhatsApp
              </a>
            </div>

            {/* Back */}
            <button
              onClick={() => navigate('shop')}
              className="mt-6 flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Retour à la boutique
            </button>
          </div>
        </div>

        {/* Notes Olfactives */}
        {notes && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
              Notes Olfactives
            </h2>
            <div className="w-12 h-[1px] bg-accent mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Notes de Tête', items: notes.head, icon: '✦' },
                { label: 'Notes de Cœur', items: notes.heart, icon: '◆' },
                { label: 'Notes de Fond', items: notes.base, icon: '●' },
              ].map((section) => (
                <div
                  key={section.label}
                  className="p-6 bg-muted rounded-sm border border-border"
                >
                  <p className="font-sans text-[10px] tracking-widest uppercase text-accent mb-3">
                    {section.icon} {section.label}
                  </p>
                  <ul className="space-y-1.5">
                    {section.items?.map((item: string) => (
                      <li
                        key={item}
                        className="font-serif text-base text-foreground"
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
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
              Inspiration
            </h2>
            <div className="w-12 h-[1px] bg-accent mb-6" />
            <p className="font-serif text-lg text-muted-foreground leading-relaxed max-w-3xl italic">
              &ldquo;{product.inspiration}&rdquo;
            </p>
          </div>
        )}

        {/* Related Ritual Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">
              Complétez votre Rituel
            </h2>
            <div className="w-12 h-[1px] bg-accent mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rp, index) => (
                <ProductCard key={rp.id} product={rp} index={index} />
              ))}
            </div>
          </div>
        )}
        {/* Reviews Section */}
        <div className="mt-16 lg:mt-24 border-t border-border pt-16">
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2">Avis Clients</h2>
          <div className="w-12 h-[1px] bg-accent mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Reviews List */}
            <div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-8">
                  {product.reviews.map((r, i) => (
                    <div key={i} className="border-b border-border pb-8 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-serif text-lg text-foreground">{r.userName}</p>
                        <p className="font-sans text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex text-[#D4AF37] mb-3">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`w-4 h-4 ${idx < r.rating ? 'fill-current' : 'text-[#E8E0D5]'}`} />
                        ))}
                      </div>
                      {r.comment && (
                        <p className="font-sans text-sm text-muted-foreground leading-relaxed italic">
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-muted-foreground italic">Aucun avis pour l'instant. Soyez le premier à donner votre avis !</p>
              )}
            </div>

            {/* Write a Review */}
            <div className="bg-muted p-6 sm:p-8 rounded-sm">
              <h3 className="font-serif text-xl text-foreground mb-6">Laisser un avis</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">Votre note</label>
                  <div className="flex gap-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className={`w-6 h-6 transition-colors ${star <= reviewForm.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">Votre nom</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.userName}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full bg-background border border-border p-3 font-sans text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">Votre avis (optionnel)</label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full bg-background border border-border p-3 font-sans text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white font-sans text-xs tracking-widest uppercase py-4 rounded-none border-none mt-2"
                >
                  {submittingReview ? 'Envoi en cours...' : 'Envoyer mon avis'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
