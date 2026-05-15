import { createClient, SupabaseClient, AuthUser } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side (browser) — uses anon key, for auth flows
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase config missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.production'
    )
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side (API routes) — uses service role key, bypasses RLS
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })
}

// Auth helpers for server-side
// Note: auth.admin APIs (getUser, getUserByToken) are not available in @supabase/supabase-js v2
// For server-side user lookup, use the service role key with direct REST API calls
// or use the `auth.getUser()` method which works with the service role key
