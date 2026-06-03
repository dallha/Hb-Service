import { requireAdmin } from '@/lib/auth-admin';
import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import InvoiceActions from '@/components/invoice-actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LabelPage(props: {
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

  return (
    <>
      <style>{`
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
            margin: 0;
            size: 100mm 150mm; /* Standard shipping label size */
          }
        }
      `}</style>

      <div className="bg-white text-black p-4 print:p-4 max-w-[100mm] min-h-[150mm] mx-auto font-sans border border-gray-200 shadow-sm print:border-none print:shadow-none print:mx-0">
        <div className="mb-4 print:hidden">
          <InvoiceActions />
        </div>

        <div className="print:m-0 border-2 border-black p-4">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
            <div>
              <h1 className="font-serif text-xl font-bold uppercase">HB Service</h1>
              <p className="text-[10px] text-gray-600">contact@hb-service.com</p>
              <p className="text-[10px] text-gray-600">+221 77 875 74 74</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Expédition</p>
              <p className="text-xs font-bold mt-1">
                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Destinataire */}
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-500 border-b border-gray-300 pb-1">Destinataire</h2>
            <div className="text-sm font-bold uppercase leading-relaxed">
              <p>{order.guestEmail || 'Client Inconnu'}</p>
              {order.guestPhone && <p className="text-lg mt-1">{order.guestPhone}</p>}
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-gray-500 border-b border-gray-300 pb-1">Détails Commande</h2>
            <div className="text-xs mb-2">
              <span className="font-bold">ID:</span> #{order.id.slice(-8).toUpperCase()}
            </div>
            
            <div className="text-[10px] space-y-1 mt-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate pr-2">- {item.variant?.product?.name} ({item.variant?.size})</span>
                  <span className="font-bold">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Barcode placeholder */}
          <div className="mt-8 pt-4 border-t-2 border-black text-center">
            <div className="font-mono text-2xl tracking-widest mb-1">* {order.id.slice(-8).toUpperCase()} *</div>
            <p className="text-[8px] text-gray-400">Scanner pour suivre</p>
          </div>

        </div>
      </div>
    </>
  );
}
