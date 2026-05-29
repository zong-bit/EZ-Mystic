import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase
      .from('gumroad_sales')
      .select('token, plan, expires_at, refunded')
      .eq('token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Invalid activation code' })
    }

    if (data.refunded) {
      return NextResponse.json({ success: false, error: 'This activation code has been refunded' })
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'This activation code has expired' })
    }

    return NextResponse.json({
      success: true,
      plan: data.plan,
      token: data.token,
    })
  } catch (err) {
    console.error('Activation error:', err)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
