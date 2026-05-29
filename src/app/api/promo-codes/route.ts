import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

// GET all promo codes (Admin only)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error('PromoCodes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST create a new promo code (Admin only)
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { code, discountType, discountValue, usageLimit, expiresAt } = body;

    if (!code || !discountType || typeof discountValue !== 'number') {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const existing = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Ce code promo existe déjà' }, { status: 400 });
    }

    const promoCode = await db.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        usageLimit: usageLimit || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error('PromoCode POST error:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

// DELETE a promo code (Admin only)
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PromoCode DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}

// PUT to toggle active status (Admin only)
export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
    }

    const promoCode = await db.promoCode.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('PromoCode PUT error:', error);
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 });
  }
}
