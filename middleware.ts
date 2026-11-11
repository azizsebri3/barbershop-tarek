import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from './src/lib/admin-session';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr', 'nl'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.hostname.startsWith('www.')) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = canonicalUrl.hostname.slice(4);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // Vérifier l'authentification admin pour les routes protégées
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/admin/login') &&
      request.nextUrl.pathname !== '/admin/reset-password' &&
      request.nextUrl.pathname !== '/admin') {
    try {
      const session = await verifyAdminToken(request.cookies.get('admin_token')?.value);
      if (!session) {
        const response = NextResponse.redirect(new URL('/admin', request.url));
        response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
        return response;
      }
    } catch (error) {
      console.error('Admin session verification failed:', error);
      return new NextResponse('Admin authentication is unavailable', { status: 500 });
    }
  }

  // Appliquer le middleware d'internationalisation
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|fr|nl)/:path*', '/admin/:path*']
};
