import { NextResponse } from 'next/server';
import { confirmOrder } from '../../stripe/webhook/route';

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token'); // PayPal Order ID
  const orderId = searchParams.get('orderId'); // Our internal order ID

  if (!token || !orderId) {
    console.error('[PayPal Return] Missing token or orderId');
    return NextResponse.redirect(`${origin}/fr?view=checkout&payment=error`);
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = process.env.PAYPAL_ENV || 'sandbox';
  const baseUrl = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    console.warn('[PayPal Return] PayPal credentials missing, simulating success');
    await confirmOrder(orderId, 'PayPal (Simulé)', token);
    return NextResponse.redirect(`${origin}/fr?view=home&payment=success&orderId=${orderId}`);
  }

  try {
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl);

    // Call PayPal to capture the payment
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': token, // Idempotency
      },
    });

    if (!captureRes.ok) {
      const captureError = await captureRes.json() as Record<string, unknown>;
      console.error('[PayPal Return] Capture API Failed:', captureError);
      return NextResponse.redirect(`${origin}/fr?view=checkout&payment=error&orderId=${orderId}`);
    }

    const captureData = await captureRes.json() as { status: string };

    if (captureData.status === 'COMPLETED') {
      const ok = await confirmOrder(orderId, 'PayPal', token);
      if (ok) {
        return NextResponse.redirect(`${origin}/fr?view=home&payment=success&orderId=${orderId}`);
      }
    }

    console.error('[PayPal Return] Order capture status is not COMPLETED:', captureData.status);
    return NextResponse.redirect(`${origin}/fr?view=checkout&payment=error&orderId=${orderId}`);

  } catch (error: any) {
    console.error('[PayPal Return] Error capturing PayPal order:', error.message);
    return NextResponse.redirect(`${origin}/fr?view=checkout&payment=error&orderId=${orderId}`);
  }
}
