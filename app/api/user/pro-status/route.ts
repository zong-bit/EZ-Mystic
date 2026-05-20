// app/api/user/pro-status/route.ts
// Get current Pro status for the authenticated user

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getProStatus } from '@/lib/referral'

export async function GET(request: NextRequest) {
  try {
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

    const status = await getProStatus(user.id)
    return NextResponse.json(status)
  } catch (error: any) {
    console.error('[Pro Status API] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
