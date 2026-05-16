import { createClient, SupabaseClient, AuthUser } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Global singleton key to survive Next.js chunk bundary
const GLOBAL_KEY = '__ez_mystic_supabase_client'

// Client-side (browser) — uses anon key, for auth flows
export function getSupabaseClient(): SupabaseClient {
  // Use globalThis to share instance across Next.js chunk boundaries
  // (module-level singletons get duplicated per chunk during code-splitting)
  if (typeof globalThis !== 'undefined' && (globalThis as any)[GLOBAL_KEY]) {
    return (globalThis as any)[GLOBAL_KEY]
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase config missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.production'
    )
  }
  const client = createClient(supabaseUrl, supabaseAnonKey)
  if (typeof globalThis !== 'undefined') {
    (globalThis as any)[GLOBAL_KEY] = client
  }
  return client
}

// Server-side (API routes) — uses service role key, bypasses RLS
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase config missing: set SUPABASE_SERVICE_ROLE_KEY in .env.local'
    )
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}

// Auth helpers for server-side
// Note: auth.admin APIs (getUser, getUserByToken) are not available in @supabase/supabase-js v2
// For server-side user lookup, use the service role key with direct REST API calls
// or use the `auth.getUser()` method which works with the service role key

/**
 * Check if a subscription has expired and update it to 'expired' status.
 * Also resets the user's plan to 'free' in the users table.
 * Uses the Supabase Management API (PAT) to update the subscription.
 */
export async function checkAndExpireSubscription(
  supabase: SupabaseClient,
  subscription: any,
): Promise<void> {
  if (!subscription?.expires_at) return

  const now = new Date()
  const expires = new Date(subscription.expires_at)

  if (expires >= now) return

  // Subscription has expired — update via Management API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?id=eq.${subscription.id}&select=plan,status`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          status: 'expired',
          plan: 'free',
        }),
      },
    )

    if (!res.ok) {
      console.error('Failed to expire subscription:', res.status, await res.text())
      return
    }

    // Also reset user plan in users table
    const userId = subscription.user_id
    if (!userId) return

    const userRes = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=plan`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          plan: 'free',
        }),
      },
    )

    if (!userRes.ok) {
      console.error('Failed to reset user plan:', userRes.status, await userRes.text())
    }
  } catch (err) {
    console.error('Error in checkAndExpireSubscription:', err)
  }
}
