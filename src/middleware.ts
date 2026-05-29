import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

// next-intl middleware for internationalization
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

// List of public API routes that don't require authentication
const publicRoutes = [
  '/api/products',
  '/api/collections',
  '/api/analytics',
  '/api/orders',
  '/api/auth',
];

const publicMethods = ['GET'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // If it's an API route, use our custom auth logic
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    if (publicRoutes.includes(pathname) && publicMethods.includes(method)) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.API_SECRET_KEY;

    if (!apiKey) {
      if (!publicRoutes.includes(pathname) || !publicMethods.includes(method)) {
        return NextResponse.json(
          { error: 'API non configurée. Veuillez définir API_SECRET_KEY.' },
          { status: 500 }
        );
      }
      return NextResponse.next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise. Utilisez un token Bearer.' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    if (token !== apiKey) {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide.' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For non-API routes, use next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/([\\w-]+)?/users/(.+)']
};
