import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth-user';

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const addresses = await db.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Account Addresses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, street, city, state, zipCode, country, phone, type, isDefault } = body;

    if (!firstName || !lastName || !street || !city) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    if (isDefault) {
      // Unset previous default
      await db.address.updateMany({
        where: { userId: user.id, type: type || 'shipping' },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        userId: user.id,
        type: type || 'shipping',
        firstName,
        lastName,
        street,
        city,
        state: state || null,
        zipCode: zipCode || null,
        country: country || 'SN',
        phone: phone || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Account Addresses POST error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Ensure the address belongs to the user
    const address = await db.address.findUnique({ where: { id } });
    if (!address || address.userId !== user.id) {
      return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 });
    }

    await db.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account Addresses DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
