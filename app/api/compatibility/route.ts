// app/api/compatibility/route.ts
// Compatibility (合盘) calculation endpoint

import { NextRequest, NextResponse } from 'next/server';
import { calculateCompatibility, type CompatibilityInput } from '@/bazi/compatibility';

export async function POST(request: NextRequest) {
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
