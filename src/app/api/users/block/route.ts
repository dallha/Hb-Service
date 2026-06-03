import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { userId, isBlocked } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Mettre à jour Prisma
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked }
    });

    // Mettre à jour Supabase Auth si besoin (Bloquer le compte pour empêcher la connexion)
    // On cherche l'utilisateur Supabase avec le même email
    const { data: { users }, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (users) {
      const supaUser = users.find(u => u.email === user.email);
      if (supaUser) {
        if (isBlocked) {
          // Banni l'utilisateur sur Supabase
          await supabaseAdmin.auth.admin.updateUserById(supaUser.id, { ban_duration: '87600h' }); // 10 ans
        } else {
          // Débanni l'utilisateur
          await supabaseAdmin.auth.admin.updateUserById(supaUser.id, { ban_duration: 'none' });
        }
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('[USER_BLOCK]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
