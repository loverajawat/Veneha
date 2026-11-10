import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = [
  '/practice',
  '/wat',
  '/history',
  '/result',
  '/upload',
  '/transcribe',
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const sessionCookie = req.cookies.get('veneha_session')?.value;
  const guestCookie = req.cookies.get('veneha_guest')?.value;
  const hasAuth = !!sessionCookie || !!guestCookie;

  // 1. If signed-in / active guest visits /sign-in, redirect to Home
  if (pathname === '/sign-in' && hasAuth) {
    const nextUrl = req.nextUrl.searchParams.get('next');
    if (nextUrl && nextUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(nextUrl, req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 2. If visitor with no session visits protected routes, redirect to /sign-in?next=<path>
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasAuth) {
    const fullPath = `${pathname}${search}`;
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('next', fullPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, pictures, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|pictures|.*\\..*).*)',
  ],
};

