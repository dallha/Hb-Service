import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal | HB Service',
  description: 'Découvrez notre journal, nos inspirations et notre expertise sur les parfums de luxe et le bois de oud.',
};

export const revalidate = 60; // Revalidate every minute

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'common' });

  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5] selection:bg-[#D4AF37] selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-6 tracking-tight">
            Le Journal
          </h1>
          <p className="font-sans text-[#8C8C8C] max-w-2xl mx-auto text-lg">
            Inspirations, découvertes et expertise autour de la haute parfumerie et des rituels de beauté.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E8E0D5]">
            <BookOpen className="w-12 h-12 mx-auto text-[#E8E0D5] mb-4" />
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">Bientôt disponible</h3>
            <p className="font-sans text-[#8C8C8C]">Nos articles sont en cours de rédaction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {posts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <Link href={`/${resolvedParams.locale}/journal/${post.slug}`}>
                  <div className="aspect-[4/3] relative overflow-hidden bg-[#E8E0D5] mb-6">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#8C8C8C]/30" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <time className="font-sans text-xs tracking-widest text-[#8C8C8C] uppercase">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', day: 'numeric' })}
                      </time>
                    </div>
                    <h2 className="font-serif text-2xl text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors leading-tight">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="font-sans text-[#8C8C8C] line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="inline-flex items-center text-[#1A1A1A] font-sans text-xs tracking-widest uppercase pb-1 border-b border-[#1A1A1A] group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-colors">
                      Lire l'article
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
