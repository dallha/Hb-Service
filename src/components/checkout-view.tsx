'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useCartStore, useNavigationStore } from '@/lib/store';
import { formatPrice, getWhatsAppLink } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PaymentMethod = 'card' | 'wave' | 'orange_money' | 'cash';

export default function CheckoutView() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { navigate } = useNavigationStore();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  } | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  // Fetch addresses on mount
  useEffect(() => {
    fetch('/api/account/addresses')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setSavedAddresses(data);
          // Auto-fill form if default address exists
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          if (defaultAddr) {
            setForm(prev => ({
              ...prev,
              firstName: defaultAddr.firstName || prev.firstName,
              lastName: defaultAddr.lastName || prev.lastName,
              address: defaultAddr.street || prev.address,
              city: defaultAddr.city || prev.city,
              phone: defaultAddr.phone || prev.phone,
            }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setFetchingAddresses(false));
  }, []);

  const [form, setForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    paymentMethod: 'cash' as PaymentMethod,
  });

  const total = getTotalPrice();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliedPromo({
        code: promoInput.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      setPromoInput('');
      toast.success('Code promo appliqué !');
    } catch (error: any) {
      toast.error(error.message || 'Code invalide');
    } finally {
      setApplyingPromo(false);
    }
  };

  const discountAmount = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? total * (appliedPromo.discountValue / 100)
      : appliedPromo.discountValue
    : 0;

  const finalTotal = Math.max(0, total - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: form.email,
          guestPhone: form.phone,
          note: `${form.firstName} ${form.lastName} — ${form.address}, ${form.city} — Paiement: ${form.paymentMethod}`,
          promoCode: appliedPromo?.code || undefined,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la commande');
      }

      const order = await res.json();

      // If online payment selected (card/wave/orange_money) → redirect to Stripe or PayTech
      if (form.paymentMethod === 'card' || form.paymentMethod === 'wave' || form.paymentMethod === 'orange_money') {
        const paymentMethod = form.paymentMethod === 'card' ? 'stripe' : 'paytech';
        
        const payRes = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            method: paymentMethod,
          }),
        });

        if (!payRes.ok) {
          const payErr = await payRes.json();
          throw new Error(payErr.error || 'Erreur lors de l\'initialisation du paiement');
        }

        const payData = await payRes.json() as { url: string };
        clearCart();
        window.location.href = payData.url;
        return;
      }

      setOrderId(order.id);
      setOrderSuccess(true);
      clearCart();
      toast.success('Commande confirmée !');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    const waMessage = `Bonjour HB_Service, j'ai passé la commande #${orderId.slice(-8)} d'un montant de ${formatPrice(finalTotal)}. Je souhaite confirmer mon achat.`;
    const waLink = getWhatsAppLink(waMessage);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen pt-24 pb-16 bg-[#F8F7F5] flex items-center justify-center"
      >
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-4">
            Commande Confirmée !
          </h1>
          <p className="font-sans text-sm text-[#8C8C8C] mb-2">
            Merci pour votre commande. Votre numéro de commande est :
          </p>
          <p className="font-sans text-lg font-medium text-[#1A1A1A] mb-6">
            #{orderId.slice(-8).toUpperCase()}
          </p>
          <p className="font-sans text-sm text-[#8C8C8C] mb-8">
            Vous recevrez une confirmation par email et WhatsApp.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#4A7C59] text-white font-sans text-sm tracking-widest uppercase px-6 py-3 rounded-none hover:bg-[#3d6b4b] transition-colors mb-4"
          >
            <MessageCircle className="w-4 h-4" />
            Valider via WhatsApp
          </a>
          <br />
          <Button
            onClick={() => navigate('home')}
            variant="outline"
            className="mt-4 rounded-none border-[#1A1A1A] text-[#1A1A1A]"
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen pt-24 pb-16 bg-[#F8F7F5] flex items-center justify-center"
      >
        <div className="text-center">
          <p className="font-serif text-2xl text-[#1A1A1A] mb-4">
            Votre panier est vide
          </p>
          <Button
            onClick={() => navigate('shop')}
            className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-sm tracking-widest uppercase rounded-none border-none"
          >
            Découvrir nos produits
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pt-24 pb-16 bg-[#F8F7F5]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-[#8C8C8C] mb-8">
          <button
            onClick={() => navigate('home')}
            className="hover:text-[#D4AF37] transition-colors"
          >
            Accueil
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1A1A1A]">Commande</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] mb-8">
          Passer la Commande
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-8"
          >
            {/* Contact */}
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">
                Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Téléphone
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                    placeholder="+221 77 000 00 00"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-[#1A1A1A]">Livraison</h2>
                {savedAddresses.length > 0 && (
                  <select 
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => a.id === e.target.value);
                      if (addr) {
                        setForm(prev => ({
                          ...prev,
                          firstName: addr.firstName,
                          lastName: addr.lastName,
                          address: addr.street,
                          city: addr.city,
                          phone: addr.phone || prev.phone,
                        }));
                        toast.success('Adresse appliquée');
                      }
                    }}
                    className="font-sans text-xs border border-[#E8E0D5] p-2 bg-transparent focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">Sélectionner une adresse sauvée...</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Prénom
                  </label>
                  <Input
                    name="firstName"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Nom
                  </label>
                  <Input
                    name="lastName"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Adresse
                  </label>
                  <Input
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs tracking-wider uppercase text-[#8C8C8C] block mb-2">
                    Ville
                  </label>
                  <Input
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="rounded-none border-[#E8E0D5] focus:border-[#D4AF37] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A] mb-4">
                Paiement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'cash' as PaymentMethod, label: 'Paiement à la livraison', desc: 'Payez en main propre' },
                  { id: 'wave' as PaymentMethod, label: 'Wave', desc: 'Paiement mobile' },
                  { id: 'orange_money' as PaymentMethod, label: 'Orange Money', desc: 'Paiement mobile' },
                  { id: 'card' as PaymentMethod, label: 'Carte bancaire', desc: 'Visa, Mastercard' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, paymentMethod: method.id })
                    }
                    className={`text-left p-4 border rounded-sm transition-all ${
                      form.paymentMethod === method.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-[#E8E0D5] hover:border-[#8C8C8C]'
                    }`}
                  >
                    <p className="font-sans text-sm text-[#1A1A1A] font-medium">
                      {method.label}
                    </p>
                    <p className="font-sans text-xs text-[#8C8C8C] mt-0.5">
                      {method.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#1A1A1A] font-sans text-xs sm:text-sm tracking-widest uppercase py-3.5 sm:py-4 h-auto rounded-none border-none min-h-[44px] sm:min-h-0"
              >
                {submitting ? 'Traitement...' : 'Confirmer la commande'}
              </Button>
              <button
                type="button"
                onClick={() => navigate('shop')}
                className="flex items-center justify-center sm:justify-start gap-1 font-sans text-xs text-[#8C8C8C] hover:text-[#D4AF37] transition-colors py-2"
              >
                <ChevronLeft className="w-3 h-3" />
                Continuer les achats
              </button>
            </div>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#F5F0E8] p-4 sm:p-6 rounded-sm lg:sticky lg:top-24">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-4">
                Récapitulatif
              </h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="relative w-14 h-16 shrink-0 bg-[#E8E0D5] rounded-sm overflow-hidden">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-[#1A1A1A] line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="font-sans text-xs text-[#8C8C8C]">
                        {item.variantSize} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-sans text-sm text-[#1A1A1A] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E8E0D5] pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-[#8C8C8C]">
                    Sous-total
                  </span>
                  <span className="font-sans text-sm text-[#1A1A1A]">
                    {formatPrice(total)}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-sans text-sm text-[#4A7C59] flex items-center gap-2">
                      Code {appliedPromo.code}
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-[#C44536] hover:underline text-xs"
                      >
                        Retirer
                      </button>
                    </span>
                    <span className="font-sans text-sm text-[#4A7C59]">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-sans text-sm text-[#8C8C8C]">
                    Livraison
                  </span>
                  <span className="font-sans text-sm text-[#4A7C59]">
                    Gratuite
                  </span>
                </div>
                
                {/* Promo Input */}
                {!appliedPromo && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Code promo"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="rounded-none border-[#E8E0D5] bg-white text-sm h-10"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo || !promoInput.trim()}
                      className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-none h-10 px-4 text-xs tracking-widest uppercase shrink-0"
                    >
                      {applyingPromo ? '...' : 'Appliquer'}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E0D5]">
                  <span className="font-serif text-lg text-[#1A1A1A]">
                    Total
                  </span>
                  <span className="font-serif text-xl text-[#1A1A1A]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
