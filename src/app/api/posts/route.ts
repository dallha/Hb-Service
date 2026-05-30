import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const posts = await db.post.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Titre, slug et contenu requis' }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        published: published || false,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create post:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
