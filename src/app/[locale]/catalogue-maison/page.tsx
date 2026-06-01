import { getSettings } from '@/lib/settings';
import { ArrowRight, FlaskConical, Sparkles } from 'lucide-react';
import Link from 'next/link';

const publicSections = [
  {
    title: 'Parfums',
    description: 'Les créations olfactives principales de la maison, visibles sur le site public.',
    icon: Sparkles,
  },
  {
    title: 'Extraits',
    description: 'Les extraits et concentrations fortes proposés dans la sélection publique.',
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
  const subtitle = settings.storytelling_hero_subtitle || 'Une sélection publique des parfums et extraits de la maison.';

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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

    </div>
  );
}
