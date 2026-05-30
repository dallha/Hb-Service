import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await db.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post) {
    return { title: 'Article non trouvé' };
  }

  return {
    title: `${post.title} | Journal HB Service`,
    description: post.excerpt || `Lisez notre article : ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const resolvedParams = await params;
  const post = await db.post.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || (!post.published && process.env.NODE_ENV !== 'development')) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#D4AF37] selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href={`/${resolvedParams.locale}/journal`}
            className="inline-flex items-center text-sm font-sans tracking-widest uppercase text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors mb-12"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au journal
          </Link>

          <header className="mb-16 text-center">
            <time className="font-sans text-sm tracking-widest text-[#D4AF37] uppercase mb-6 block">
              {new Date(post.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', day: 'numeric' })}
            </time>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight mb-8">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-sans text-xl text-[#8C8C8C] max-w-2xl mx-auto leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {post.coverImage && (
            <div className="aspect-[21/9] w-full relative mb-16 bg-[#F8F7F5]">
              <img
                src={post.coverImage}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="prose prose-lg prose-neutral max-w-3xl mx-auto font-sans text-[#1A1A1A] prose-headings:font-serif prose-headings:font-normal prose-a:text-[#D4AF37] hover:prose-a:text-[#1A1A1A] prose-a:transition-colors prose-img:rounded-md">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
