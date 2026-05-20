/**
 * POST /api/referral/verify
 * Validate a referral code. Public endpoint (no auth required).
 * Accepts: { code: "ABC12345" }
 * Returns: { valid: boolean, referrerId: string | null }
 */

import { NextResponse } from 'next/server';
import { validateReferralCode } from '@/lib/referral';

export const dynamic = 'force-dynamic';

// Simple rate limiting: track by IP in memory
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body?.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid code parameter' }, { status: 400 });
    }

    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const result = await validateReferralCode(code);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/referral/verify:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
