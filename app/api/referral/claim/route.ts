// app/api/referral/claim/route.ts
// Claim a 7-day trial after signup (requires session auth)

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { claimReferralReward } from '@/lib/referral'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const code = body?.code as string
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const result = await claimReferralReward(user.id, code, ip)

    if (result.success) {
      return NextResponse.json({ success: true, trialExpiresAt: result.trialExpiresAt })
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 400 })
  } catch (error: any) {
    console.error('[Referral Claim API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
