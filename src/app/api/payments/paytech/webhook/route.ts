import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { confirmOrder } from '../../stripe/webhook/route';

export async function POST(request: Request) {
  try {
    let refCommand = '';
    let token = '';
    let apiKeySha256 = '';
    let apiSecretSha256 = '';
    let paymentMethod = 'paytech';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      refCommand = (formData.get('ref_command') as string) || '';
      token = (formData.get('token') as string) || '';
      apiKeySha256 = (formData.get('api_key_sha256') as string) || '';
      apiSecretSha256 = (formData.get('api_secret_sha256') as string) || '';
      paymentMethod = (formData.get('payment_method') as string) || 'paytech';
    } else {
      const body = await request.json() as Record<string, string>;
      refCommand = body.ref_command || '';
      token = body.token || '';
      apiKeySha256 = body.api_key_sha256 || '';
      apiSecretSha256 = body.api_secret_sha256 || '';
      paymentMethod = body.payment_method || 'paytech';
    }

    if (!refCommand || !token) {
      return NextResponse.json({ error: 'Missing ref_command or token' }, { status: 400 });
    }

    // Secure Signature Verification from the integration guide
    const apiKey = process.env.PAYTECH_API_KEY;
    const apiSecret = process.env.PAYTECH_API_SECRET;

    if (apiKey && apiSecret) {
      const localKeyHash = createHash('sha256').update(apiKey).digest('hex');
      const localSecretHash = createHash('sha256').update(apiSecret).digest('hex');

      if (apiKeySha256 !== localKeyHash || apiSecretSha256 !== localSecretHash) {
        console.error('[PayTech Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
      }
    } else {
      console.warn('[PayTech Webhook] PAYTECH_API_KEY or PAYTECH_API_SECRET is not set. Skipping signature verification.');
    }

    // Confirm the order in the database and send the email
    const providerName = paymentMethod === 'paytech' ? 'Wave/Orange Money' : `PayTech (${paymentMethod})`;
    const ok = await confirmOrder(refCommand, providerName, token);

    if (!ok) {
      return NextResponse.json({ error: 'Order confirmation failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('PayTech Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
