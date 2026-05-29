import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || (!adminPassword && !adminPasswordHash)) {
      return NextResponse.json(
        { error: 'Administration non configurée. Veuillez définir ADMIN_EMAIL et ADMIN_PASSWORD.' },
        { status: 500 }
      );
    }

    // Verify email
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Verify password: either plain text or SHA-256 hash
    let isValid = false;
    if (adminPassword) {
      isValid = password === adminPassword;
    } else if (adminPasswordHash) {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      isValid = hash === adminPasswordHash;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Generate a secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Create the response with a secure HTTP-only cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4, // 4 hours
    });

    // Store the valid session token in memory (via env for this simple setup)
    // In production, use Redis or a database
    process.env.__ADMIN_SESSION_TOKEN = sessionToken;

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
