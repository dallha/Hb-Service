import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

// UPDATE a review (Admin only - to approve/reject)
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
    const { isVerified } = body;

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json({ error: 'isVerified doit être un booléen' }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id: params.id },
      data: { isVerified },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review PUT error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE a review (Admin only)
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

    await db.review.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
