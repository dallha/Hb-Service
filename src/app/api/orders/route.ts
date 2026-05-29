import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
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
    const { guestEmail, guestPhone, items, note, paymentProvider } = body;

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantId} not found` }, { status: 400 });
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${variant.product.name} (${variant.size})` }, { status: 400 });
      }

      totalAmount += variant.price * item.quantity;
      orderItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price,
      });
    }

    // Create order
    const order = await db.order.create({
      data: {
        guestEmail,
        guestPhone,
        totalAmount,
        note,
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
  try {
    const body = await request.json();
    const { id, status, paymentStatus, paymentProvider, paymentReference, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
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
