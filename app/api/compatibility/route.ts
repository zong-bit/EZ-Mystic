// app/api/compatibility/route.ts
// Compatibility (合盘) calculation endpoint
// Rate limited: max 10 requests per minute per IP

import { NextRequest, NextResponse } from 'next/server';
import { calculateCompatibility, type CompatibilityInput } from '@/bazi/compatibility';

// Simple in-memory rate limiter (for Vercel Hobby — upgrade to Upstash Redis on Pro)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // requests per window
const ipCounts = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  ipCounts.forEach((entry, ip) => {
    if (now > entry.resetAt) {
      ipCounts.delete(ip);
    }
  });
}, 5 * 60_1000);

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipCounts.set(ip, entry);
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function POST(request: NextRequest) {
  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input structure
    if (!body.person1 || !body.person2) {
      return NextResponse.json(
        { error: 'Missing birth data for one or both persons' },
        { status: 400 }
      );
    }

    const requiredFields = ['year', 'month', 'day', 'hour', 'minute', 'gender'];
    for (const personKey of ['person1', 'person2'] as const) {
      const p = body[personKey];
      for (const field of requiredFields) {
        if (p[field] == null && p[field] !== 0) {
          return NextResponse.json(
            { error: `Missing field "${field}" for ${personKey}` },
            { status: 400 }
          );
        }
      }

      if (p.year < 1900 || p.year > 2100) {
        return NextResponse.json(
          { error: `Year for ${personKey} must be between 1900 and 2100` },
          { status: 400 }
        );
      }

      if (!['male', 'female'].includes(p.gender)) {
        return NextResponse.json(
          { error: `Gender for ${personKey} must be "male" or "female"` },
          { status: 400 }
        );
      }

      if (p.month < 1 || p.month > 12) {
        return NextResponse.json(
          { error: `Month for ${personKey} must be between 1 and 12` },
          { status: 400 }
        );
      }

      if (p.day < 1 || p.day > 31) {
        return NextResponse.json(
          { error: `Day for ${personKey} must be between 1 and 31` },
          { status: 400 }
        );
      }

      if (p.hour < 0 || p.hour > 23) {
        return NextResponse.json(
          { error: `Hour for ${personKey} must be between 0 and 23` },
          { status: 400 }
        );
      }

      if (p.minute < 0 || p.minute > 59) {
        return NextResponse.json(
          { error: `Minute for ${personKey} must be between 0 and 59` },
          { status: 400 }
        );
      }
    }

    const input: CompatibilityInput = {
      person1: body.person1,
      person2: body.person2,
    };

    const result = calculateCompatibility(input);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Compatibility calculation error:', error);
    return NextResponse.json(
      { error: 'Compatibility calculation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Allow longer timeout for compatibility calculations (may need lunar-javascript API calls)
export const maxDuration = 30;
