import { requireAdmin } from '@/lib/auth-admin';
import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/format';
import InvoiceActions from '@/components/invoice-actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InvoicePage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  await requireAdmin();
  const params = await props.params;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      },
      payment: true
    }
  });

  if (!order) {
    notFound();
  }

  const paymentProviderLabels: Record<string, string> = {
    stripe: 'Carte bancaire',
    wave: 'Wave',
    orange_money: 'Orange Money',
    cash: 'Paiement à la livraison',
    pending: 'Non défini',
  };

  return (
    <>
      <style>{`
        /* Cache le header, footer et autres éléments parasites sur cette page */
        header, footer, [id^="whatsapp"], .whatsapp-button {
          display: none !important;
        }
        main {
          min-height: 0 !important;
          padding: 0 !important;
        }
        body {
          background-color: white !important;
        }
        @media print {
          html, body, main, #__next, .print\\:m-0 {
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div className="bg-white text-black p-4 sm:p-8 print:p-0 max-w-4xl mx-auto font-sans">
        {/* Actions Button */}
        <InvoiceActions />

        {/* Invoice Content */}
        <div className="print:m-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-0 mb-8 sm:mb-12 border-b border-gray-200 pb-8">
            <div>
              <img src="/logo-gold.jpg" alt="HB Service" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 object-cover" />
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-1">HB_Service</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Parfums de Luxe & Cosmétiques</p>
              <p className="text-gray-500 text-xs sm:text-sm">contact@hb-service.com</p>
              <p className="text-gray-500 text-xs sm:text-sm">+212 601 13 45 45</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="font-serif text-3xl sm:text-4xl text-gray-200 uppercase tracking-widest mb-4">Facture</h2>
              <p className="text-sm"><span className="font-bold text-gray-700">Facture N° :</span> {order.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm"><span className="font-bold text-gray-700">Date :</span> {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
              {order.payment && (
                <p className="text-sm"><span className="font-bold text-gray-700">Paiement :</span> {paymentProviderLabels[order.payment.provider] || order.payment.provider}</p>
              )}
            </div>
          </div>

          <div className="mb-12">
            <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider text-sm">Facturé à</h3>
            {order.guestEmail && <p className="text-gray-800">{order.guestEmail}</p>}
            {order.guestPhone && <p className="text-gray-800">{order.guestPhone}</p>}
            <p className="text-gray-500 mt-2 text-sm italic">
              Client en ligne
            </p>
          </div>

          <div className="overflow-x-auto mb-8 sm:mb-12">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="py-3 font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-800">Description</th>
                  <th className="py-3 font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-800 text-right">Qté</th>
                  <th className="py-3 font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-800 text-right">Prix Unitaire</th>
                  <th className="py-3 font-bold text-xs sm:text-sm uppercase tracking-wider text-gray-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4">
                      <p className="font-bold text-sm sm:text-base text-gray-800">{item.variant?.product?.name || 'Produit non disponible'}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Format: {item.variant?.size || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-sm sm:text-base text-right text-gray-800">{item.quantity}</td>
                    <td className="py-4 text-sm sm:text-base text-right text-gray-800">{formatPrice(item.unitPrice)}</td>
                    <td className="py-4 text-sm sm:text-base text-right text-gray-800 font-bold">{formatPrice(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm sm:text-base">Sous-total</span>
                <span className="text-gray-800 text-sm sm:text-base">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm sm:text-base">Livraison</span>
                <span className="text-gray-800 text-sm sm:text-base">Inclus</span>
              </div>
              <div className="flex justify-between py-4 mt-2">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">Total</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p className="mb-1">Merci pour votre confiance !</p>
            <p>Pour toute question concernant cette facture, veuillez contacter notre support sur WhatsApp au +212 601 13 45 45.</p>
          </div>
        </div>
      </div>
    </>
  );
}
