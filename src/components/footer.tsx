'use client';

import { MessageCircle, Instagram, Facebook, Mail, MapPin, Phone, Settings } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';

export default function Footer() {
  const { navigate } = useNavigationStore();

  return (
    <footer className="bg-[#1A1A1A] text-[#F8F7F5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-2xl font-bold mb-4">
              HB<span className="text-[#D4AF37]">_</span>Service
            </h3>
            <p className="text-[#8C8C8C] text-sm leading-relaxed mb-4">
              Parfums & Soins Naturels Premium. Des créations olfactives
              d&apos;exception, nées du savoir-faire africain.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/221770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-[#8C8C8C]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-none"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-[#8C8C8C]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-none"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-[#8C8C8C]/30 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors rounded-none"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-[#D4AF37] mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', view: 'home' as const },
                { label: 'Boutique', view: 'shop' as const },
                { label: 'Notre Histoire', view: 'storytelling' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.view)}
                    className="text-sm text-[#8C8C8C] hover:text-[#D4AF37] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-[#D4AF37] mb-6">
              Collections
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Collection Signature', slug: 'signature' },
                { label: 'Collection Héritage', slug: 'heritage' },
                { label: 'Collection Botanique', slug: 'botanique' },
              ].map((item) => (
                <li key={item.slug}>
                  <button
                    onClick={() => navigate('shop', { collectionSlug: item.slug })}
                    className="text-sm text-[#8C8C8C] hover:text-[#D4AF37] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-[#D4AF37] mb-6">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-[#8C8C8C]">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                Dakar, Sénégal
              </li>
              <li className="flex items-center gap-3 text-sm text-[#8C8C8C]">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                +221 77 000 00 00
              </li>
              <li className="flex items-center gap-3 text-sm text-[#8C8C8C]">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                contact@hb-service.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#8C8C8C]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8C8C8C]">
            &copy; {new Date().getFullYear()} HB_Service. Tous droits réservés.
          </p>
          <button
            onClick={() => navigate('dashboard')}
            className="text-[#8C8C8C]/40 hover:text-[#8C8C8C] transition-colors"
            aria-label="Administration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
