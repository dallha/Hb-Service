import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const collections = await db.collection.findMany({
      include: {
        products: {
          where: { isActive: true },
          include: {
            variants: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, imageUrl, sortOrder } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom de la collection est requis' }, { status: 400 });
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Le slug de la collection est requis' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.collection.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Une collection avec ce slug existe déjà' }, { status: 400 });
    }

    const collection = await db.collection.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description || null,
        imageUrl: imageUrl || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Collection creation error:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, description, imageUrl, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de collection invalide' }, { status: 400 });
    }

    // Validate slug format if provided
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets' },
        { status: 400 }
      );
    }

    const collection = await db.collection.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(slug ? { slug: slug.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Collection update error:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de collection invalide' }, { status: 400 });
    }

    await db.collection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Collection deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
