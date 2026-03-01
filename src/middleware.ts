import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/invoices',
  '/clients',
  '/expenses',
  '/proposals',
  '/contracts',
  '/payments',
  '/portfolio',
  '/settings',
  '/ai-pricing',
  '/subscription',
  '/onboarding',
];

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

/** OAuth callback must never be redirected — tokens are in the URL. */
const PUBLIC_CALLBACK = '/auth/callback';

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get('novba_access_token')?.value;

  if (pathname === PUBLIC_CALLBACK) {
    return NextResponse.next();
  }

  if (isProtected(pathname) && !accessToken) {
    const login = new URL('/login', request.url);
    return NextResponse.redirect(login);
  }

  if (isAuthRoute(pathname) && accessToken) {
    const dashboard = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboard);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
