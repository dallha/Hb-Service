'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Flame, FlaskConical, Sparkles, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import type { SiteSettingsMap } from '@/lib/settings';

type CategoryCard = {
  title: string;
  description: string;
  icon: typeof Sparkles;
  accent: string;
};

const categories: CategoryCard[] = [
  {
    title: 'Parfums',
    description: 'La famille principale du propriétaire: eau de parfum, extrait, brumes et signatures olfactives.',
    icon: Sparkles,
    accent: 'Priorité',
  },
  {
    title: 'Bougies',
    description: 'Bougies parfumées et objets d’ambiance pour élargir le catalogue maison.',
    icon: Flame,
    accent: 'Maison',
  },
  {
    title: 'Huiles',
    description: 'Huiles parfumées, huiles de soin et déclinaisons flacon/roll-on.',
    icon: Droplets,
    accent: 'Soin',
  },
  {
    title: 'Autres produits',
    description: 'Soins, accessoires et futures familles produits à brancher plus tard si besoin.',
    icon: FlaskConical,
    accent: 'Suite',
  },
];

const importFields = [
  'Nom du produit',
  'Catégorie',
  'Marque / maison',
  'Genre',
  'Format / taille',
  'Prix',
  'Description courte',
  'Ordre d’affichage',
  'Image',
];

export default function OwnerCataloguePage({ settings = {} }: { settings?: SiteSettingsMap }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'fr';

  const headline = settings.story_1_title || 'Catalogue Maison HB_Service';
  const subtitle = settings.storytelling_hero_subtitle || 'Un espace dédié aux produits créés par le propriétaire: parfums, bougies, huiles et autres références de la maison.';

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(26,26,26,0.08),_transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <nav className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-muted-foreground mb-8 flex-wrap">
            <button onClick={() => router.push(`/${locale}`)} className="hover:text-accent transition-colors">
              Accueil
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Catalogue Maison</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Terrain préparé pour import futur
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-5">
                {headline}
              </h1>
              <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/${locale}/admin`)}
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none"
                >
                  Préparer l’import
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push(`/${locale}`)}
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none hover:border-accent hover:text-accent transition-colors"
                >
                  Retour accueil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Familles', value: '4' },
                { label: 'Prêt pour import', value: 'Oui' },
                { label: 'Produits existants', value: 'À créer' },
                { label: 'Statut', value: 'En préparation' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="border border-border bg-card/80 p-5 sm:p-6"
                >
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-3">
                    {item.label}
                  </p>
                  <p className="font-serif text-2xl text-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.article
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="p-6 border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37]">
                      {category.accent}
                    </span>
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="font-serif text-2xl text-foreground mb-3">
                    {category.title}
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
            <div>
              <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                Structure d’import
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
                Champs à préparer avant l’import
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                Quand la liste des noms est prête, on peut injecter le fichier sans recréer le modèle. Il suffit de remplir les champs de base ci-dessous.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {importFields.map((field) => (
                <div key={field} className="border border-border bg-background p-4">
                  <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                    {field}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              '1. Le propriétaire prépare la liste des noms.',
              '2. On mappe les familles et les champs d’import.',
              '3. On injecte le catalogue complet dans les produits du site.',
            ].map((step, index) => (
              <div key={step} className="p-6 border border-border bg-card">
                <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] mb-3">
                  Étape {index + 1}
                </p>
                <p className="font-serif text-xl text-foreground leading-snug">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
