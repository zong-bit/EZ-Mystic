// app/api/referral/stats/route.ts
// Get referral statistics for the current user (requires session auth)

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getReferralStats } from '@/lib/referral'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const supabase = getSupabaseAdmin()
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const stats = await getReferralStats(user.id)
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('[Referral Stats API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
