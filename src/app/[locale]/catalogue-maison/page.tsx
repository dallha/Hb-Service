import { getSettings } from '@/lib/settings';
import { ArrowRight, Flame, Droplets, Sparkles, FlaskConical } from 'lucide-react';
import Link from 'next/link';

const publicSections = [
  {
    title: 'Parfums',
    description: 'Les créations olfactives de la maison, pensées pour la lecture simple côté client.',
    icon: Sparkles,
  },
  {
    title: 'Bougies',
    description: 'Les références d’ambiance et de décoration parfumée accessibles au public.',
    icon: Flame,
  },
  {
    title: 'Huiles',
    description: 'Les huiles et formats de soin proposés dans la gamme publique.',
    icon: Droplets,
  },
  {
    title: 'Autres produits',
    description: 'Les autres références visibles sur le site public quand elles sont activées.',
    icon: FlaskConical,
  },
];

export default async function CatalogueMaisonPublicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSettings();
  const title = settings.story_1_title || 'Catalogue Maison';
  const subtitle = settings.storytelling_hero_subtitle || 'Une sélection publique des créations de la maison, présentée sans outils d’administration.';

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
            Surface publique
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight max-w-4xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-base sm:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 bg-foreground text-background font-sans text-xs tracking-widest uppercase px-5 py-3 rounded-none"
            >
              Voir la boutique
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {publicSections.map((section) => {
              const Icon = section.icon;
              return (
                <article key={section.title} className="border border-border bg-background p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-[#D4AF37]">
                      Public
                    </span>
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="font-serif text-2xl text-foreground mb-3">{section.title}</h2>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-24 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div>
            <p className="font-sans text-[11px] tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
              Organisation
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">
              Le contenu public reste séparé de l’administration
            </h2>
            <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
              Les modifications du catalogue, les imports Excel et les ajustements de doublons se font dans l’espace administrateur.
              Cette page ne montre que les éléments publics visibles par les visiteurs.
            </p>
          </div>

          <div className="border border-border bg-background p-6 sm:p-8">
            <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-4">
              Ce qui est public
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Les familles de produits visibles sur le site</li>
              <li>Les collections et sélections publiques</li>
              <li>Les fiches produits publiées et actives</li>
              <li>Les liens de navigation vers la boutique</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
