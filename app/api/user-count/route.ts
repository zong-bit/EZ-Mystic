import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // cache 5 min

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // Count users from auth.users (real registered users)
    // We use the REST endpoint to count auth users
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json({ count: 0 })
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/auth/users?select=id&limit=1`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
        },
      }
    )

    if (!res.ok) {
      console.error('Failed to fetch user count:', res.status)
      return NextResponse.json({ count: 0 })
    }

    const users = await res.json()
    return NextResponse.json({ count: users.length })
  } catch (error) {
    console.error('User count API error:', error)
    return NextResponse.json({ count: 0 })
  }
}
