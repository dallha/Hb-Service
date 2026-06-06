import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email, items, status } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Upsert the cart session
    const cartSession = await db.cartSession.upsert({
      where: { token },
      update: {
        ...(email && { email }),
        items: items || [],
        ...(status && { status }),
      },
      create: {
        token,
        email: email || null,
        items: items || [],
        status: status || 'active',
      },
    });

    return NextResponse.json(cartSession);
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
