import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';
import { AbandonedCartEmail } from '@/emails/AbandonedCartEmail';

// Assurez-vous d'avoir configuré RESEND_API_KEY dans votre fichier .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  try {
    // Vérification du secret (utile si appelé par Vercel Cron ou un service tiers)
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trouver les paniers actifs, ayant un e-mail, inactifs depuis 24h, et non encore notifiés
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCarts = await db.cartSession.findMany({
      where: {
        status: 'active',
        email: { not: null },
        updatedAt: { lt: twentyFourHoursAgo },
        notifiedAt: null,
      },
    });

    const results: any[] = [];

    for (const cart of abandonedCarts) {
      if (!cart.email) continue;
      
      const items = cart.items as any[];
      if (!items || items.length === 0) continue;

      // Format des items pour l'email
      const emailItems = items.map((item: any) => ({
        name: item.productName || item.name || 'Produit',
        size: item.variantSize || item.size || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl,
      }));

      try {
        // Envoi de l'email
        // NOTE: L'adresse "from" doit être vérifiée sur votre compte Resend.
        // Si vous utilisez la version gratuite de Resend sans domaine vérifié, 
        // vous ne pourrez envoyer qu'à l'adresse email de votre propre compte.
        const data = await resend.emails.send({
          from: 'HB Service <onboarding@resend.dev>', // Modifiez avec votre domaine validé (ex: contact@hbservice.com)
          to: cart.email,
          subject: 'Votre panier vous attend chez HB Service 🌿',
          react: AbandonedCartEmail({
            email: cart.email,
            items: emailItems,
            checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
          }),
        });

        // Mise à jour de la session
        await db.cartSession.update({
          where: { id: cart.id },
          data: {
            status: 'abandoned',
            notifiedAt: new Date(),
          },
        });

        results.push({ email: cart.email, status: 'sent', id: data.data?.id });
      } catch (emailError) {
        console.error(`Erreur d'envoi d'email à ${cart.email}:`, emailError);
        results.push({ email: cart.email, status: 'error' });
      }
    }

    return NextResponse.json({ success: true, processedCount: results.length, results });
  } catch (error) {
    console.error('Erreur CRON paniers abandonnés:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
