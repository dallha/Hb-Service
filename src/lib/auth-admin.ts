import { createClient } from './supabase/server';
import { db } from './db';


export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the user from our Prisma DB to check their role
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return null;
  }

  return dbUser;
}
