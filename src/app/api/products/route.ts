import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collection');
    const search = searchParams.get('search');

    const products = await db.product.findMany({
      where: {
        isActive: true,
        ...(collectionSlug && {
          collection: { slug: collectionSlug },
        }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      },
      include: {
        collection: true,
        variants: true,
        reviews: {
          where: { isVerified: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute average rating
    const productsWithRating = products.map((p) => ({
      ...p,
      averageRating: p.reviews.length > 0 
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length 
        : 0,
      reviewCount: p.reviews.length,
    }));

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
