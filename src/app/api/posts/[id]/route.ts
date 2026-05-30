import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const params = await props.params;
    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, published } = body;

    const post = await db.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Failed to update post:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const params = await props.params;
    await db.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
