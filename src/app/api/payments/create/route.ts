import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' as any }) : null;

// Helper to retrieve PayPal Access Token
async function getPayPalAccessToken(clientId: string, clientSecret: string, baseUrl: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve PayPal Access Token');
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { orderId, method } = await request.json() as { orderId: string; method: 'stripe' | 'paytech' | 'paypal' };

    if (!orderId || !method) {
      return NextResponse.json({ error: 'orderId et method sont requis' }, { status: 400 });
    }

    // Fetch the order with its details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Cette commande ne peut plus être payée' }, { status: 400 });
    }

    // Determine absolute origin for callbacks
    const { origin } = new URL(request.url);

    // ─── Stripe Option ───────────────────────────────────────────
    if (method === 'stripe') {
      if (!stripe) {
        console.warn('⚠️ STRIPE_SECRET_KEY non définie. Utilisation du mode simulation.');
        // Return a mock URL for development / testing
        const mockUrl = `${origin}/fr?view=home&payment=success&orderId=${order.id}&simulated=stripe`;
        return NextResponse.json({ url: mockUrl });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'xof',
              product_data: {
                name: `Commande #${order.id}`,
                description: 'Achat sur HB_Service',
              },
              unit_amount: Math.round(order.totalAmount),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/fr?view=home&payment=success&orderId=${order.id}`,
        cancel_url: `${origin}/fr?view=checkout&payment=cancel&orderId=${order.id}`,
        metadata: {
          orderId: order.id,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ─── PayTech Option ──────────────────────────────────────────
    if (method === 'paytech') {
      const apiKey = process.env.PAYTECH_API_KEY;
      const apiSecret = process.env.PAYTECH_API_SECRET;

      if (!apiKey || !apiSecret) {
        console.warn('⚠️ PAYTECH_API_KEY/SECRET non définies. Utilisation du mode simulation.');
        const mockUrl = `${origin}/fr?view=home&payment=success&orderId=${order.id}&simulated=paytech`;
        return NextResponse.json({ url: mockUrl });
      }

      const paytechRes = await fetch('https://paytech.sn/api/payment/request-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': apiKey,
          'API_SECRET': apiSecret,
        },
        body: JSON.stringify({
          item_name: `Commande #${order.id}`,
          item_price: Math.round(order.totalAmount),
          currency: 'XOF',
          ref_command: order.id,
          command_name: 'Achat sur HB_Service',
          env: process.env.PAYTECH_ENV || 'test',
          success_url: `${origin}/fr?view=home&payment=success&orderId=${order.id}`,
          cancel_url: `${origin}/fr?view=checkout&payment=cancel&orderId=${order.id}`,
          ipn_url: `${origin}/api/payments/paytech/webhook`,
        }),
      });

      const paytechData = await paytechRes.json() as { success: number; redirect_url?: string; error?: string[] };

      if (paytechData.success === 1 && paytechData.redirect_url) {
        return NextResponse.json({ url: paytechData.redirect_url });
      } else {
        console.error('PayTech Session Error:', paytechData.error);
        return NextResponse.json({ error: 'Erreur lors de la création de la session PayTech' }, { status: 500 });
      }
    }

    // ─── PayPal Option ───────────────────────────────────────────
    if (method === 'paypal') {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const env = process.env.PAYPAL_ENV || 'sandbox';
      const baseUrl = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

      if (!clientId || !clientSecret) {
        console.warn('⚠️ PAYPAL_CLIENT_ID/SECRET non définies. Utilisation du mode simulation.');
        const mockUrl = `${origin}/fr?view=home&payment=success&orderId=${order.id}&simulated=paypal`;
        return NextResponse.json({ url: mockUrl });
      }

      try {
        const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl);

        // Convert XOF to EUR using the fixed peg (1 EUR = 655.957 XOF)
        const eurAmount = (order.totalAmount / 655.957).toFixed(2);

        const paypalRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                reference_id: order.id,
                amount: {
                  currency_code: 'EUR',
                  value: eurAmount,
                },
              },
            ],
            application_context: {
              return_url: `${origin}/api/payments/paypal/return?orderId=${order.id}`,
              cancel_url: `${origin}/fr?view=checkout&payment=cancel&orderId=${order.id}`,
              brand_name: 'HB_Service',
              user_action: 'PAY_NOW',
            },
          }),
        });

        if (!paypalRes.ok) {
          const payError = await paypalRes.json() as Record<string, unknown>;
          console.error('PayPal Order Error:', payError);
          return NextResponse.json({ error: 'Erreur lors de la création de la commande PayPal' }, { status: 500 });
        }

        const paypalData = await paypalRes.json() as { links: { href: string; rel: string }[] };
        const approveLink = paypalData.links.find((l) => l.rel === 'approve');

        if (approveLink) {
          return NextResponse.json({ url: approveLink.href });
        } else {
          return NextResponse.json({ error: 'Approve link not found in PayPal response' }, { status: 500 });
        }
      } catch (err: any) {
        console.error('PayPal initiation failed:', err.message);
        return NextResponse.json({ error: 'PayPal service unavailable' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Méthode de paiement non supportée' }, { status: 400 });

  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
