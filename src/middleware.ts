import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { updateSession } from './lib/supabase/middleware';

// next-intl middleware for internationalization
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always'
});

const publicRoutes = [
  '/api/products',
  '/api/collections',
  '/api/analytics',
  '/api/orders',
  '/api/auth',
  '/api/seed',
];
const publicMethods = ['GET'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // --- API Routes ---
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/seed')) {
      return NextResponse.next();
    }
    if (publicRoutes.includes(pathname) && publicMethods.includes(method)) {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // --- Pages / Frontend ---
  let response = intlMiddleware(request);

  // Apply Supabase session cookies
  const { user } = await updateSession(request, response);

  // Protect routes
  const isProtectedRoute = /^\/([a-z]{2}\/)?(account|admin)(\/.*)?$/.test(pathname);

  if (isProtectedRoute && !user) {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'fr';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    // Pass the original URL to redirect back after login
    redirectUrl.searchParams.set('redirect_to', pathname);
    
    response = NextResponse.redirect(redirectUrl);
    await updateSession(request, response); // Apply cookies to the new redirect response
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
