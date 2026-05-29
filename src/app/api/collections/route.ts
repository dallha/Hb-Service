import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const collections = await db.collection.findMany({
      include: {
        products: {
          where: { isActive: true },
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
