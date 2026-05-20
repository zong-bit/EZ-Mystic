/**
 * POST /api/referral/code
 * Get or create a referral code for the current user.
 * Requires authentication via Supabase JWT.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getOrCreateReferralCode } from '@/lib/referral';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authenticate the user via Supabase JWT
    const supabase = getSupabaseAdmin();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify session and get user
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const result = await getOrCreateReferralCode(userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/referral/code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
