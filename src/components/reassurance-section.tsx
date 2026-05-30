'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, MessageCircle, Star } from 'lucide-react';

import type { SiteSettingsMap } from '@/lib/settings';

export default function ReassuranceSection({ settings = {} }: { settings?: SiteSettingsMap }) {
  const headline = settings.reassurance_headline || '2 500+ Clients Satisfaits';
  const rating = settings.reassurance_rating || 'Note moyenne de 4.8/5 basée sur les avis clients';
  const reassuranceItems = [
    { icon: Truck, label: settings.reassurance_1_label || 'Livraison Rapide', desc: settings.reassurance_1_desc || 'Sous 48h à Dakar' },
    { icon: Shield, label: settings.reassurance_2_label || 'Paiement à la Livraison', desc: settings.reassurance_2_desc || 'Zéro risque' },
    { icon: MessageCircle, label: settings.reassurance_3_label || 'Support WhatsApp', desc: settings.reassurance_3_desc || 'Conseil personnalisé' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <p className="font-serif text-3xl sm:text-4xl text-foreground mb-2">
            {headline}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]"
              />
            ))}
          </div>
          <p className="font-sans text-sm text-muted-foreground mt-2">
            {rating}
          </p>
        </motion.div>

        {/* Reassurance Bandeau */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {reassuranceItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.1,
              }}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-muted rounded-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h4 className="font-serif text-lg text-foreground mb-1">
                {item.label}
              </h4>
              <p className="font-sans text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
