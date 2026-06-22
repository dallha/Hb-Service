import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductSchema } from '@/components/ProductSchema';
import Image from 'next/image';

export const revalidate = 3600; // 1 hour for ISR

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await db.product.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!product) {
    return { title: 'Produit introuvable' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbservice.store';

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: product.imageUrl ? [{ url: product.imageUrl, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    alternates: {
      canonical: `${siteUrl}/${resolvedParams.locale}/products/${resolvedParams.slug}`,
      languages: {
        fr: `${siteUrl}/fr/products/${resolvedParams.slug}`,
        en: `${siteUrl}/en/products/${resolvedParams.slug}`,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const product = await db.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: { variants: true }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <ProductSchema product={{
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.variants?.[0]?.price || 0,
        slug: product.slug
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
            {product.imageUrl ? (
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                Pas d'image
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="font-serif text-4xl sm:text-5xl mb-4">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-8">
              {product.variants?.[0]?.price ? `${product.variants[0].price} XOF` : 'Prix sur demande'}
            </p>
            {product.description && (
              <p className="font-sans text-base leading-relaxed mb-8">
                {product.description}
              </p>
            )}
            
            <button className="bg-foreground text-background py-4 px-8 tracking-widest uppercase text-sm hover:bg-foreground/90 transition-colors">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
