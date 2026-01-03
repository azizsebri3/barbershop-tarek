import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  // Vérifier l'authentification admin pour les routes protégées
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/admin/login') &&
      request.nextUrl.pathname !== '/admin') {
    
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    } catch (error) {
      // Token invalide, rediriger vers login
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.set('admin_token', '', { maxAge: 0 });
      return response;
    }
  }

  // Appliquer le middleware d'internationalisation
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|fr)/:path*', '/admin/:path*']
};
