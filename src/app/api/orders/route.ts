import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-admin';

// Valid order statuses
const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
// Valid payment statuses
const VALID_PAYMENT_STATUSES = ['pending', 'processing', 'completed', 'failed', 'refunded'] as const;
// Valid payment providers
const VALID_PAYMENT_PROVIDERS = ['stripe', 'wave', 'orange_money', 'cash', 'pending'] as const;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestEmail, guestPhone, items, note, paymentProvider, promoCode } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Au moins un article est requis' }, { status: 400 });
    }

    // Validate email or phone
    if (!guestEmail && !guestPhone) {
      return NextResponse.json({ error: 'Email ou téléphone requis' }, { status: 400 });
    }

    // Validate email format if provided
    if (guestEmail && typeof guestEmail === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return NextResponse.json({ error: 'Format d\'email invalide' }, { status: 400 });
      }
    }

    // Validate items structure
    for (const item of items) {
      if (!item.variantId || typeof item.variantId !== 'string') {
        return NextResponse.json({ error: 'Chaque article doit avoir un variantId' }, { status: 400 });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: 'La quantité doit être comprise entre 1 et 100' }, { status: 400 });
      }
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: Array<{ variantId: string; quantity: number; unitPrice: number }> = [];

    for (const item of items) {
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 });
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${variant.product.name} (${variant.size})` }, { status: 400 });
      }

      totalAmount += variant.price * item.quantity;
      orderItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price,
      });
    }

    // Handle promo code
    let finalNote = note || '';
    if (promoCode && typeof promoCode === 'string') {
      const dbPromo = await db.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } });
      if (dbPromo && dbPromo.isActive) {
        let isValid = true;
        if (dbPromo.expiresAt && new Date() > dbPromo.expiresAt) isValid = false;
        if (dbPromo.usageLimit !== null && dbPromo.usageCount >= dbPromo.usageLimit) isValid = false;

        if (isValid) {
          let discount = 0;
          if (dbPromo.discountType === 'percentage') {
            discount = totalAmount * (dbPromo.discountValue / 100);
          } else {
            discount = dbPromo.discountValue;
          }
          totalAmount = Math.max(0, totalAmount - discount);
          finalNote += `\nCode Promo appliqué : ${dbPromo.code} (-${discount} FCFA)`;

          // Increment usage count
          await db.promoCode.update({
            where: { id: dbPromo.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        totalAmount,
        note: finalNote || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });

    // Decrement stock
    for (const item of orderItems) {
      await db.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Create pending payment
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: paymentProvider || 'pending',
        status: 'pending',
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, paymentStatus, paymentProvider, paymentReference, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    // Validate status against whitelist
    if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate payment status against whitelist
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus as typeof VALID_PAYMENT_STATUSES[number])) {
      return NextResponse.json(
        { error: `Statut de paiement invalide. Valeurs acceptées : ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate payment provider against whitelist
    if (paymentProvider && !VALID_PAYMENT_PROVIDERS.includes(paymentProvider as typeof VALID_PAYMENT_PROVIDERS[number])) {
      return NextResponse.json(
        { error: `Moyen de paiement invalide. Valeurs acceptées : ${VALID_PAYMENT_PROVIDERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate payment reference length
    if (paymentReference && typeof paymentReference === 'string' && paymentReference.length > 100) {
      return NextResponse.json({ error: 'La référence de paiement est trop longue (max 100 caractères)' }, { status: 400 });
    }

    // Update order status
    if (status) {
      await db.order.update({
        where: { id },
        data: { status, note: note || undefined },
      });
    }

    // Update payment status
    if (paymentStatus || paymentProvider || paymentReference) {
      const paymentData: Record<string, string> = {};
      if (paymentStatus) paymentData.status = paymentStatus;
      if (paymentProvider) paymentData.provider = paymentProvider;
      if (paymentReference) paymentData.reference = paymentReference;

      await db.payment.updateMany({
        where: { orderId: id },
        data: paymentData,
      });
    }

    const updatedOrder = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
        payment: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Validate id format
    if (typeof id !== 'string' || id.length < 10) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    await db.orderItem.deleteMany({ where: { orderId: id } });
    await db.payment.deleteMany({ where: { orderId: id } });
    await db.order.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
