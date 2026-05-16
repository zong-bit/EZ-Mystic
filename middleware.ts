import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supabase stores auth cookies with pattern: sb-{projectRef}-auth-token
const SUPABASE_PROJECT_REF = 'xgaxejeaxfhlupguqteu';

function hasAuthCookie(request: NextRequest): boolean {
  const cookieNames = [
    `sb-${SUPABASE_PROJECT_REF}-auth-token`,
    'sb-auth-token',
    'sb-auth-token0',
    'sb-auth-token1',
    'auth-token',
    'token',
  ];
  for (const name of cookieNames) {
    if (request.cookies.get(name)?.value) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  if (pathname.startsWith('/dashboard')) {
    if (!hasAuthCookie(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users away from login/signup
  if (pathname === '/login' || pathname === '/signup') {
    if (hasAuthCookie(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
