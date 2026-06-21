import { createClient } from '@supabase/supabase-js'

// CRITICAL: This module MUST ONLY be used in server-side code (API routes).
// The service role key should NEVER reach the browser.
const isServer = typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'nodejs'

if (!isServer) {
  throw new Error(
    'usage-tracker must only be imported in server-side code (API routes). '
    + 'Importing it in a client component exposes the Supabase Service Role Key.'
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

let supabase: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return supabase
}

export async function trackUsage(params: {
  source: 'paper-summarizer' | 'fatewise'
  endpoint: string
  ip?: string
  userId?: string
  isPro?: boolean
}) {
  if (!supabaseUrl || !supabaseServiceRoleKey) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getClient().from('api_usage') as any).insert({
      source: params.source,
      endpoint: params.endpoint,
      ip: params.ip || null,
      user_id: params.userId || null,
      is_pro: params.isPro || false,
    })
  } catch (e) {
    // Silent fail — don't block the API
    console.error('trackUsage error (silent):', e)
  }
}

export async function getUsageStats(source: 'paper-summarizer' | 'fatewise') {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { today: 0, total: 0, uniqueIps: 0 }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getClient().from('api_usage') as any
    const today = new Date().toISOString().split('T')[0]

    // Today's count
    const { count: todayCount } = await db
      .select('*', { count: 'exact', head: true })
      .eq('source', source)
      .gte('created_at', today)

    // Total count
    const { count: totalCount } = await db
      .select('*', { count: 'exact', head: true })
      .eq('source', source)

    // Unique IPs this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: weeklyData } = await db
      .select('ip')
      .eq('source', source)
      .gte('created_at', weekAgo)

    const uniqueIps = new Set((weeklyData as Array<{ ip: string | null }> | null)?.map(r => r.ip).filter(Boolean) || []).size

    return {
      today: todayCount || 0,
      total: totalCount || 0,
      uniqueIps,
    }
  } catch (e) {
    console.error('getUsageStats error (silent):', e)
    return { today: 0, total: 0, uniqueIps: 0 }
  }
}
