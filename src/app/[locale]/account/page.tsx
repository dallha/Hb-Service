import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, Package, User } from 'lucide-react';

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's details and orders from Prisma
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 dark:text-white sm:text-3xl sm:truncate">
            Mon Espace Client
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Bienvenue, {dbUser?.fullName || user.email}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-amber-600 mr-2" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Mes informations</h3>
          </div>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <p><span className="font-medium text-neutral-900 dark:text-white">E-mail :</span> {user.email}</p>
            <p><span className="font-medium text-neutral-900 dark:text-white">Nom :</span> {dbUser?.fullName || 'Non renseigné'}</p>
            <p><span className="font-medium text-neutral-900 dark:text-white">Téléphone :</span> {dbUser?.phone || 'Non renseigné'}</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 shadow rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center">
            <Package className="h-6 w-6 text-amber-600 mr-2" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Historique de commandes</h3>
          </div>
          
          {dbUser?.orders && dbUser.orders.length > 0 ? (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {dbUser.orders.map((order) => (
                <li key={order.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        Commande du {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Statut : <span className="font-medium capitalize text-amber-600">{order.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">
                        {order.totalAmount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-neutral-500 mb-2">Articles :</p>
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-sm text-neutral-700 dark:text-neutral-300">
                          {item.quantity}x {item.variant.product.name} ({item.variant.size})
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-neutral-500">
              Vous n'avez passé aucune commande pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
