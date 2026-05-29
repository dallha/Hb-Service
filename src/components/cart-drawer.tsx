'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCartStore, useNavigationStore } from '@/lib/store';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();
  const { navigate } = useNavigationStore();

  const total = getTotalPrice();
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    closeCart();
    navigate('checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
    navigate('shop');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[#F8F7F5] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E0D5]">
              <h2 className="font-serif text-xl text-[#1A1A1A]">
                Votre Panier
              </h2>
              <button
                onClick={closeCart}
                className="w-9 h-9 flex items-center justify-center text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-[#E8E0D5] mb-4" />
                  <p className="font-serif text-lg text-[#1A1A1A] mb-2">
                    Votre panier est vide
                  </p>
                  <p className="font-sans text-sm text-[#8C8C8C] mb-6">
                    Découvrez nos créations d&apos;exception
                  </p>
                  <Button
                    onClick={handleContinueShopping}
                    className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs tracking-widest uppercase rounded-none border-none"
                  >
                    Découvrir nos produits
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-24 shrink-0 overflow-hidden rounded-sm bg-[#E8E0D5]">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm text-[#1A1A1A] line-clamp-1">
                          {item.productName}
                        </h4>
                        <p className="font-sans text-xs text-[#8C8C8C] mt-0.5">
                          {item.variantSize}
                        </p>
                        <p className="font-sans text-sm text-[#1A1A1A] font-medium mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center border border-[#E8E0D5] text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors rounded-none"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-xs w-6 text-center text-[#1A1A1A]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center border border-[#E8E0D5] text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors rounded-none"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="ml-auto font-sans text-[10px] tracking-wider uppercase text-[#C44536] hover:underline"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E8E0D5] px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-sm text-[#8C8C8C]">
                    Sous-total ({totalItems} article{totalItems !== 1 ? 's' : ''})
                  </span>
                  <span className="font-serif text-xl text-[#1A1A1A]">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-sm tracking-widest uppercase py-4 h-auto rounded-none border-none mb-3"
                >
                  Passer la commande
                </Button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full text-center font-sans text-xs tracking-wider uppercase text-[#8C8C8C] hover:text-[#D4AF37] transition-colors py-2"
                >
                  Continuer les achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
