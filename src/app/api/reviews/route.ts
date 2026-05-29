import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

// GET all reviews (Admin only - for moderation dashboard)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST a new review (Public - from product page)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, comment } = body;

    if (!productId || !userName || !rating) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId,
        userName,
        rating,
        comment,
        isVerified: false, // Default to false, needs admin approval
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
