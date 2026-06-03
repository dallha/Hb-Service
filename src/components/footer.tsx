'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram, Facebook, Mail, MapPin, Phone, X, CheckCircle2 } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import type { SiteSettingsMap } from '@/lib/settings';

export default function Footer({ settings = {} }: { settings?: SiteSettingsMap }) {
  const [designerModalOpen, setDesignerModalOpen] = useState(false);
  const { navigate } = useNavigationStore();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname?.includes('/admin')) return null;

  const logoUrl = settings.logo_url || '/logo-gold.jpg';
  const tagline = settings.brand_tagline || "Parfums & Soins Naturels Premium. Des créations olfactives d'exception, nées du savoir-faire africain.";
  const whatsappNumber = settings.whatsapp_number || '221778757474';
  const phonePrimary = settings.phone_primary || '+221 77 875 74 74 (WhatsApp)';
  const phoneBackup = settings.phone_backup || '+212 601 13 45 45';
  const email = settings.email || 'contact@hb-service.com';
  const address = settings.address || 'Dakar, Sénégal';
  const instagramUrl = settings.instagram_url || '#';
  const facebookUrl = settings.facebook_url || '#';
  const copyright = 'Graphiste de la Hadara. Tous droits réservés.';
  const catalogueLabel = settings.collections_section_title || 'Sélections du catalogue';
  const locale = pathname?.split('/')[1] || 'fr';

  return (
    <footer className="bg-card text-card-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src={logoUrl}
              alt="HB Service"
              className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-full mb-6"
            />
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {tagline}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors rounded-none"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', view: 'home' as const },
                { label: 'Boutique', view: 'shop' as const },
                { label: 'Sélection Parfum', view: 'catalogue' as const },
                { label: 'Formations', view: 'formations' as const },
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
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">{catalogueLabel}</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sélection complète', preset: 'all' as const },
                { label: 'Nouveautés', preset: 'new' as const },
                { label: 'Parfums Homme', preset: 'men' as const },
                { label: 'Parfums Femme', preset: 'women' as const },
                { label: 'Parfums Unisexes', preset: 'unisex' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate('catalogue', { cataloguePreset: item.preset })}
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
            <h4 className="font-sans text-xs tracking-widest uppercase text-accent mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                {address}
              </li>
              <li className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  {phonePrimary}
                </div>
                {phoneBackup && (
                  <div className="pl-7 text-xs opacity-80">Secours: {phoneBackup}</div>
                )}
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                {email}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-2 items-center sm:items-start text-xs text-muted-foreground text-center sm:text-left">
            <p>
              &copy; {new Date().getFullYear()} {copyright}
            </p>
            <p className="opacity-80">
              Identité visuelle par{' '}
              <button 
                onClick={() => setDesignerModalOpen(true)}
                className="hover:text-accent transition-colors font-medium underline underline-offset-2"
              >
                El Hadji Abdoulaye Niass (Graphiste de la Hadara)
              </button>
            </p>
          </div>
          <button
            onClick={() => router.push(`/${locale}/catalogue-maison`)}
            className="text-xs uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
          >
            Ouvrir le catalogue maison
          </button>
        </div>
      </div>

      <AnimatePresence>
        {designerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setDesignerModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background text-foreground w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-none border border-border p-6 sm:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDesignerModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <h3 className="font-serif text-3xl sm:text-4xl mb-2">El Hadji Abdoulaye Niass</h3>
                <p className="font-sans text-sm tracking-widest uppercase text-accent mb-4">Graphiste de la Hadara</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  En tant que designer graphique, je combine une approche esthétique moderne avec la richesse de notre héritage culturel pour créer des identités visuelles fortes et mémorables pour les entreprises, les institutions et les particuliers.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-sans text-sm tracking-widest uppercase border-b border-border pb-2 mb-4">1. Identité Visuelle & Logo</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Recherche & Concepts :</strong> 3 propositions de logo initiales.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Révisions :</strong> Jusqu'à 3 cycles de modifications.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Fichiers finaux :</strong> Livraison en différents formats (PNG, JPG, SVG, PDF).</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Tarif :</strong> À partir de 60 000 FCFA.</span></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-sans text-sm tracking-widest uppercase border-b border-border pb-2 mb-4">2. Communication Visuelle</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Affiches & Flyers :</strong> Événementiel (30 000 FCFA) ou Business (50 000 FCFA).</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Bâches & Bannières :</strong> À partir de 45 000 FCFA.</span></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-sans text-sm tracking-widest uppercase border-b border-border pb-2 mb-4">3. Packages "Booster"</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Starter Pack :</strong> Logo + Charte graphique simple + Carte de visite.</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> <span><strong>Event Pack :</strong> Affiche ou flyer + Badge + Kakemono.</span></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-sans text-sm tracking-widest uppercase border-b border-border pb-2 mb-4">Contact & Portfolio</h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <a href="https://wa.me/221776232741" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-border hover:border-accent transition-colors group">
                      <MessageCircle className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                      <span>+221 77 623 27 41<br/>+221 76 375 63 63</span>
                    </a>
                    <a href="https://www.behance.net/mrniasse" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border border-border hover:border-accent transition-colors group">
                      <div className="w-5 h-5 bg-accent text-background font-bold flex items-center justify-center text-xs group-hover:scale-110 transition-transform">Bê</div>
                      <span>Portfolio Behance<br/>mrniasse</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
