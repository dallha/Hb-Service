'use client';

import { MessageCircle, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { navigate } = useNavigationStore();
  const pathname = usePathname();

  if (pathname?.includes('/admin')) return null;

  return (
    <footer className="bg-card text-card-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/logo-gold.jpg"
              alt="HB Service"
              className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-full mb-6"
            />
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Parfums & Soins Naturels Premium. Des créations olfactives
              d&apos;exception, nées du savoir-faire africain.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://wa.me/212601134545"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">
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
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">
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
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                Dakar, Sénégal
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                +212 601 13 45 45
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                contact@hb-service.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HB_Service. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
