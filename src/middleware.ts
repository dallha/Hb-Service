/**
 * API Authentication Middleware
 * Protects all /api/* routes with token-based authentication
 * Uses a simple API key mechanism (Bearer token) for now
 * Can be upgraded to next-auth or JWT later
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public API routes that don't require authentication
const publicRoutes = [
  '/api/products',
  '/api/collections',
  '/api/analytics',
  '/api/orders',
  '/api/auth',
];

// List of read-only methods allowed on public routes
const publicMethods = ['GET'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow all requests to auth routes (login, check, logout)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow public GET requests on products and collections
  if (publicRoutes.includes(pathname) && publicMethods.includes(method)) {
    return NextResponse.next();
  }

  // Check for API key in Authorization header
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    // If no API key is configured, block all protected routes
    if (!publicRoutes.includes(pathname) || !publicMethods.includes(method)) {
      return NextResponse.json(
        { error: 'API non configurée. Veuillez définir API_SECRET_KEY.' },
        { status: 500 }
      );
    }
    return NextResponse.next();
  }

  // Validate Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentification requise. Utilisez un token Bearer.' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove 'Bearer '

  if (token !== apiKey) {
    return NextResponse.json(
      { error: 'Token d\'authentification invalide.' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
