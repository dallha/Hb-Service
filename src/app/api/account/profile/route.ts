import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { fullName, phone } = await request.json();

    // Update in Prisma
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        fullName,
        phone,
      },
    });

    // Optionally update Supabase user metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
