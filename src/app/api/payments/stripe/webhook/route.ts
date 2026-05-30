import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import React from 'react';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' as any }) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Robust central helper to confirm orders across Stripe & PayTech
export async function confirmOrder(orderId: string, provider: string, reference: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!order) {
      console.error(`[Webhook] Order #${orderId} not found`);
      return false;
    }

    if (order.status !== 'pending') {
      console.log(`[Webhook] Order #${orderId} is already in status: ${order.status}`);
      return true;
    }

    // Process stock decrement and status updates atomically
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: { status: 'confirmed' },
      }),
      db.payment.upsert({
        where: { orderId: orderId },
        update: { status: 'completed', provider, reference },
        create: { orderId: orderId, status: 'completed', provider, reference },
      }),
      ...order.items.map((item) =>
        db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ]);

    console.log(`[Webhook] Order #${orderId} confirmed successfully via ${provider}`);

    // Send customer confirmation e-mail (asynchronously in background)
    const emailTo = order.guestEmail;
    if (emailTo) {
      const itemsList = order.items.map((item) => 
        `<li>${item.variant.product.name} (${item.variant.size}) x ${item.quantity} - ${(item.unitPrice * item.quantity).toLocaleString()} FCFA</li>`
      ).join('');

      sendEmail({
        to: emailTo,
        subject: `Confirmation de votre commande #${order.id}`,
        react: React.createElement('div', { 
          style: { fontFamily: 'sans-serif', padding: '24px', backgroundColor: '#f8f7f5', color: '#1a1a1a' } 
        }, [
          React.createElement('div', { 
            style: { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', border: '1px solid #e8e0d5' } 
          }, [
            React.createElement('img', { 
              src: 'https://hb-service.com/logo-gold.jpg', 
              alt: 'HB_Service Logo', 
              style: { width: '80px', height: '80px', borderRadius: '50%', display: 'block', margin: '0 auto 20px auto' } 
            }),
            React.createElement('h1', { style: { textAlign: 'center', fontFamily: 'serif', color: '#c9a84c', fontSize: '24px', margin: '0 0 20px 0' } }, 'Merci pour votre commande !'),
            React.createElement('p', null, `Bonjour,`),
            React.createElement('p', null, `Nous avons le plaisir de vous informer que votre paiement a été validé avec succès. Votre commande est désormais confirmée.`),
            React.createElement('div', { style: { borderTop: '1px solid #e8e0d5', borderBottom: '1px solid #e8e0d5', padding: '15px 0', margin: '20px 0' } }, [
              React.createElement('p', { style: { margin: '0 0 10px 0', fontWeight: 'bold' } }, `Résumé de la commande #${order.id}`),
              React.createElement('ul', { style: { paddingLeft: '20px', margin: '0 0 15px 0' }, dangerouslySetInnerHTML: { __html: itemsList } }),
              React.createElement('p', { style: { margin: '0', fontWeight: 'bold', color: '#c9a84c' } }, `Total réglé : ${order.totalAmount.toLocaleString()} FCFA (${provider === 'stripe' ? 'Carte Bancaire' : 'Mobile Money'})`),
            ]),
            React.createElement('p', null, `Nous préparons votre colis avec le plus grand soin. Vous recevrez un e-mail dès qu'il sera expédié.`),
            React.createElement('p', { style: { marginTop: '30px', fontSize: '12px', color: '#8c8c8c', textAlign: 'center' } }, `HB_Service — Parfums & Soins Naturels Premium`),
          ])
        ]),
      }).catch(err => console.error('[Webhook] Failed to send email:', err));
    }

    return true;
  } catch (error) {
    console.error(`[Webhook] Error confirming order #${orderId}:`, error);
    return false;
  }
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig && webhookSecret) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // In development / testing without webhook secret verification
      const parsed = JSON.parse(rawBody) as { type: string; data: { object: any } };
      event = parsed as any;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

    if (orderId) {
      const ok = await confirmOrder(orderId, 'stripe', paymentIntentId);
      if (!ok) {
        return NextResponse.json({ error: 'Failed to process order confirmation' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
