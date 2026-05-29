import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AccountClient from '@/components/account-client';

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's details
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
  });

  // Fetch orders (both linked by userId or by guestEmail)
  const orders = await db.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { guestEmail: user.email },
      ],
    },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch addresses
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: 'desc' }
  });

  const userData = {
    id: user.id,
    email: user.email,
    fullName: dbUser?.fullName || '',
    phone: dbUser?.phone || '',
  };

  return (
    <AccountClient 
      user={userData} 
      initialOrders={orders} 
      initialAddresses={addresses} 
    />
  );
}
