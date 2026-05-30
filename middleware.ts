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
const OPEN_PATHS = [
  '/',
  '/login',
  '/signup',
  '/api/',
  '/privacy',
  '/terms',
  '/refund',
  '/contact',
  '/pricing',
  '/blog',
  '/bazi',
  '/bagua',
  '/zh',
  '/zh/blog',
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
    // Use p directly (not p + '/') so '/api/' matches '/api/bazi'
    if (pathname === p || pathname.startsWith(p)) {
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

  // Redirect logged-in users away from login/signup
  if (pathname === '/login' || pathname === '/signup') {
    if (hasAuthCookie(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.css$|.*\\.js$).*)'],
};
