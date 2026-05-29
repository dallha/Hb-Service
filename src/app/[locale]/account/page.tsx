import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { LogOut, Package, User as UserIcon, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';

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
    <div className="min-h-screen bg-[#F8F7F5] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8E0D5] pb-6 gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#1A1A1A] mb-3">
              Mon Espace Privé
            </h1>
            <p className="font-sans text-sm tracking-wider uppercase text-[#8C8C8C]">
              Bienvenue, {dbUser?.fullName || user.email}
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="group inline-flex items-center text-xs font-sans tracking-widest uppercase transition-colors text-[#8C8C8C] hover:text-[#C44536]"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 border border-[#E8E0D5] sticky top-28">
              <div className="flex items-center mb-8 border-b border-[#E8E0D5] pb-4">
                <UserIcon className="h-5 w-5 text-[#D4AF37] mr-3" />
                <h3 className="font-serif text-xl text-[#1A1A1A]">Informations</h3>
              </div>
              <div className="space-y-6 font-sans text-sm">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">E-mail</p>
                  <p className="text-[#1A1A1A]">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">Nom Complet</p>
                  <p className="text-[#1A1A1A]">{dbUser?.fullName || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">Téléphone</p>
                  <p className="text-[#1A1A1A]">{dbUser?.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E8E0D5] overflow-hidden">
              <div className="p-8 border-b border-[#E8E0D5] flex items-center bg-[#FDFCFB]">
                <Package className="h-5 w-5 text-[#D4AF37] mr-3" />
                <h3 className="font-serif text-xl text-[#1A1A1A]">Historique de Commandes</h3>
              </div>
              
              {dbUser?.orders && dbUser.orders.length > 0 ? (
                <div className="divide-y divide-[#E8E0D5]">
                  {dbUser.orders.map((order) => (
                    <div key={order.id} className="p-8 hover:bg-[#FDFCFB] transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">
                            Commande passée le
                          </p>
                          <p className="font-serif text-lg text-[#1A1A1A]">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-1">
                            Montant Total
                          </p>
                          <p className="font-serif text-xl text-[#D4AF37]">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6 flex items-center gap-3">
                        <span className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C]">Statut :</span>
                        <span className={`px-3 py-1 font-sans text-[10px] tracking-widest uppercase border ${
                          order.status === 'delivered' ? 'border-[#4A7C59] text-[#4A7C59] bg-[#4A7C59]/5' :
                          order.status === 'pending' ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5' :
                          'border-[#1A1A1A] text-[#1A1A1A] bg-[#1A1A1A]/5'
                        }`}>
                          {order.status === 'pending' ? 'En attente' :
                           order.status === 'processing' ? 'En préparation' :
                           order.status === 'shipped' ? 'Expédiée' :
                           order.status === 'delivered' ? 'Livrée' :
                           order.status === 'cancelled' ? 'Annulée' : order.status}
                        </span>
                      </div>

                      <div className="border-t border-dashed border-[#E8E0D5] pt-6">
                        <p className="font-sans text-[10px] tracking-widest uppercase text-[#8C8C8C] mb-4">Articles</p>
                        <ul className="space-y-4">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center gap-4">
                              <div className="h-16 w-16 bg-[#F5F0E8] border border-[#E8E0D5] shrink-0 overflow-hidden relative">
                                {item.variant.product.imageUrl && (
                                  <img 
                                    src={item.variant.product.imageUrl} 
                                    alt={item.variant.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-[#1A1A1A] truncate">{item.variant.product.name}</p>
                                <p className="font-sans text-[11px] text-[#8C8C8C] mt-1 uppercase tracking-wider">
                                  {item.variant.size} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-sans text-sm text-[#1A1A1A]">{formatPrice(item.unitPrice * item.quantity)}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <Package className="h-12 w-12 text-[#E8E0D5] mx-auto mb-4" />
                  <p className="font-serif text-xl text-[#1A1A1A] mb-2">Aucune commande</p>
                  <p className="font-sans text-sm text-[#8C8C8C]">
                    Vous n'avez pas encore passé de commande chez nous.
                  </p>
                  <a href="/shop" className="inline-flex items-center mt-8 text-xs font-sans tracking-widest uppercase text-[#D4AF37] hover:text-[#B8962E] transition-colors group">
                    Découvrir nos créations
                    <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
