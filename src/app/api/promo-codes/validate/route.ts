import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code promo requis' }, { status: 400 });
    }

    const promoCode = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promoCode) {
      return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 });
    }

    if (!promoCode.isActive) {
      return NextResponse.json({ error: 'Ce code promo n\'est plus actif' }, { status: 400 });
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json({ error: 'Ce code promo a expiré' }, { status: 400 });
    }

    if (promoCode.usageLimit !== null && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json({ error: 'Ce code promo a atteint sa limite d\'utilisation' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
    });
  } catch (error) {
    console.error('PromoCode validate error:', error);
    return NextResponse.json({ error: 'Erreur lors de la validation du code promo' }, { status: 500 });
  }
}
