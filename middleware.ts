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

// Open routes that do NOT require authentication
// NOTE: /api/ is intentionally excluded — each API route handles its own auth.
const OPEN_PATHS = [
  '/',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
  '/refund',
  '/contact',
  '/pricing',
  '/blog',
  '/bazi',
  '/bagua',
  '/tools',
  '/chat',
  '/zh',
  '/zh/blog',
  '/zh/terms',
  '/zh/privacy',
  '/zh/refund',
  '/zh/chat',
];

// Public API paths — no auth required
const PUBLIC_API_PATHS = [
  '/api/gumroad-webhook',
  '/api/user-count',
  '/api/stats',       // public usage stats (no sensitive data)
];

// Open static file patterns
const OPEN_STATIC_PATTERNS = [
  '/_next/',
  '/favicon',
  '/og-image',
  '/manifest',
  '/.well-known/',
  '/images/',
  '/fonts/',
  '/icons/',
  '/og/',
  '/sitemap',
  '/robots.txt',
];

// Open file extension patterns (static assets)
const OPEN_FILE_EXTENSIONS = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.css',
  '.js',
  '.json',
  '.xml',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

function isPublicPath(pathname: string): boolean {
  // Check exact open paths
  for (const p of OPEN_PATHS) {
    if (pathname === p || pathname.startsWith(p + '/')) {
      return true;
    }
  }
  // Check public API paths
  for (const p of PUBLIC_API_PATHS) {
    if (pathname === p || pathname.startsWith(p + '/')) {
      return true;
    }
  }
  // Check static file patterns
  for (const p of OPEN_STATIC_PATTERNS) {
    if (pathname.startsWith(p)) {
      return true;
    }
  }
  // Check file extensions
  for (const ext of OPEN_FILE_EXTENSIONS) {
    if (pathname.endsWith(ext)) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!hasAuthCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Note: We no longer redirect logged-in users away from login/signup.
  // The login page itself handles the redirect via localStorage/cookie check,
  // and forcing a server-side redirect caused loops when cookies hadn't
  // propagated yet after a full-page reload (window.location.href).
  // The auth-context (client-side) is the authoritative source for "is logged in".

  return NextResponse.next();
}

// Exempt API routes from middleware auth (each route handles its own)
export const config = {
  matcher: ['/((?!api/.*|.*\\..*|_next|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.css$|.*\\.js$).*)'],
};
