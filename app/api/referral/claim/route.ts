/**
 * POST /api/referral/claim
 * Claim a referral reward after signup.
 * Requires authentication via Supabase JWT.
 * Accepts: { referralCode: "ABC12345" }
 * Returns: { success: boolean, trialExpiresAt: string | null, error: string | null }
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { claimReferralReward } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const supabase = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const referralCode = body?.referralCode;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
    }

    const result = await claimReferralReward(session.user.id, referralCode);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      trialExpiresAt: result.trialExpiresAt,
    });
  } catch (error: any) {
    console.error('Error in /api/referral/claim:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
