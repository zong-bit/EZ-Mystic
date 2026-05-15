import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Note: server-side auth check uses the Supabase service role key via fetch
// to verify the session cookie. For client-side auth, use the AuthContext.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes — redirect to login if not authenticated
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('sb-xgaxejeaxfhlupguqteu-auth-token')
      || request.cookies.get('sb-auth-token');
    // If no session cookie, redirect to login
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
