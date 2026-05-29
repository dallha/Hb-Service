import { createClient } from './supabase/server';
import { db } from './db';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the user from our Prisma DB
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  return dbUser;
}
