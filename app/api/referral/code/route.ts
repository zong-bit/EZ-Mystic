// app/api/referral/code/route.ts
// Get or create the current user's referral code (requires session auth)

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrCreateReferralCode } from '@/lib/referral'

export async function GET(request: NextRequest) {
  try {
    // Auth check via cookie/session
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

    const result = await getOrCreateReferralCode(user.id)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Referral Code API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
