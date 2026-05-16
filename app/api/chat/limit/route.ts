import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const today = new Date().toISOString().split('T')[0]

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  })

  // Check if user is logged in and has Pro
  const authHeader = request.headers.get('authorization')
  let isPro = false
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .eq('source', 'ez-mystic')
        .eq('status', 'active')
        .single()
      isPro = sub?.plan === 'pro'
    }
  }

  if (isPro) {
    return NextResponse.json({ allowed: true, remaining: 999, isPro: true })
  }

  // Check IP daily limit
  const { data } = await supabase
    .from('chat_usage')
    .select('count')
    .eq('ip_address', ip)
    .eq('date', today)
    .single()

  const count = data?.count || 0
  return NextResponse.json({
    allowed: count < 1,
    remaining: Math.max(0, 1 - count),
    isPro: false
  })
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const today = new Date().toISOString().split('T')[0]

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  })

  // Upsert: increment count
  await supabase.rpc('increment_chat_usage', {
    p_ip: ip,
    p_date: today
  })

  return NextResponse.json({ success: true })
}
