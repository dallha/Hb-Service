import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const collections = await db.collection.findMany({
      include: {
        products: {
          include: { variants: true },
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
    const { name, slug, description, imageUrl, heroText, sortOrder } = body;

    // Check slug uniqueness
    const existing = await db.collection.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Une collection avec ce slug existe déjà' }, { status: 400 });
    }

    const collection = await db.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        heroText: heroText || null,
        sortOrder: sortOrder || 0,
      },
      include: { products: true },
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    const collection = await db.collection.update({
      where: { id },
      data: {
        ...data,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        heroText: data.heroText || undefined,
      },
      include: { products: true },
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

    // Delete all products in collection first
    const products = await db.product.findMany({ where: { collectionId: id }, select: { id: true } });
    for (const p of products) {
      await db.productVariant.deleteMany({ where: { productId: p.id } });
      await db.review.deleteMany({ where: { productId: p.id } });
    }
    await db.product.deleteMany({ where: { collectionId: id } });
    await db.collection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Collection deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
