import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Upsert the user into Prisma DB
    // This ensures that even if the SQL trigger was not run on Supabase, the user exists in Prisma.
    await db.user.upsert({
      where: { email: user.email },
      update: {
        id: user.id, // Update ID to match Supabase UUID just in case
      },
      create: {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name || '',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
