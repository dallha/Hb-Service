import { getSettings } from '@/lib/settings';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/product-card';

export const dynamic = 'force-dynamic';

export default async function CatalogueMaisonPublicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSettings();
  const title = 'Catalogue Maison';
  const subtitle = "Découvrez nos bougies et parfums d'intérieur pour une ambiance unique.";

  const products = await db.product.findMany({
    where: {
      collection: { slug: 'catalogue-maison' },
      isActive: true,
    },
    include: {
      collection: true,
      variants: true,
      reviews: {
        where: { isVerified: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedProducts = products.map((p) => ({
    ...p,
    averageRating: p.reviews.length > 0
      ? p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / p.reviews.length
      : 0,
    reviewCount: p.reviews.length,
  }));

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
              Retour à la boutique
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {formattedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {formattedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product as any} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-sans">
              Aucun produit disponible pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
