// FateWise — Token storage & plan definitions
// Reuses the shared Supabase tokens table (same project as paper-summarizer)
// Tokens use 'fw-' prefix to distinguish from paper-summarizer tokens

import { getSupabaseAdmin } from './supabase'

interface TokenRow {
  id: string
  token: string
  user_id: string | null
  plan: string
  max_requests: number
  used_requests: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface FatewiseTokenEntry {
  token: string
  plan: 'pro' | 'premium'
  maxRequests: number
  expiresAt?: string
  createdAt?: string
}

/**
 * Plan definitions for FateWise Gumroad purchases.
 */
export const FATEWISE_PLANS = {
  'pro-monthly': {
    name: 'Destiny Book Pro',
    price: 9.99,
    maxRequests: 500,
    expiryDays: 30,
    plan: 'pro' as const,
  },
  'pro-yearly': {
    name: 'Destiny Book Pro Yearly',
    price: 79.99,
    maxRequests: 500,
    expiryDays: 365,
    plan: 'pro' as const,
  },
  'premium-lifetime': {
    name: 'Ultimate Destiny Toolkit',
    price: 29.99,
    maxRequests: 999999,
    expiryDays: 0, // 0 means no expiry (lifetime)
    plan: 'premium' as const,
  },
} as const

export type FatewisePlanId = keyof typeof FATEWISE_PLANS

/**
 * Generate a unique FateWise token string.
 */
function generateFatewiseToken(): string {
  const random = Math.random().toString(36).slice(2, 10)
  const hash = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64url').slice(0, 20)
  return `fw-${hash}-${random}`
}

/**
 * Create a FateWise token in the shared Supabase tokens table.
 */
export async function createFatewiseToken(
  planId: FatewisePlanId,
  userEmail?: string,
): Promise<FatewiseTokenEntry> {
  const plan = FATEWISE_PLANS[planId]
  if (!plan) {
    throw new Error(`Unknown FateWise plan: ${planId}`)
  }

  const expiresAt =
    plan.expiryDays > 0
      ? new Date(Date.now() + plan.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null // null = lifetime

  const token = generateFatewiseToken()

  const supabase = getSupabaseAdmin()
  const result = await supabase
    .from('tokens')
    .insert({
      token,
      user_id: null, // will be linked when user claims
      plan: plan.plan,
      max_requests: plan.maxRequests,
      used_requests: 0,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (result.error) {
    console.error('[fatewise-tokens] createFatewiseToken error:', result.error)
    throw result.error
  }

  const data = result.data
  console.log(`[FateWise] Token created: ${token} (plan: ${planId})`)
  return {
    token: data.token,
    plan: data.plan as 'pro' | 'premium',
    maxRequests: data.max_requests,
    expiresAt: data.expires_at || undefined,
    createdAt: data.created_at,
  }
}

/**
 * Find a FateWise token by its token string.
 */
export async function findFatewiseToken(
  tokenStr: string,
): Promise<FatewiseTokenEntry | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('token', tokenStr)
    .single()

  if (error || !data) return null

  return {
    token: data.token,
    plan: data.plan as 'pro' | 'premium',
    maxRequests: data.max_requests,
    expiresAt: data.expires_at || undefined,
    createdAt: data.created_at,
  }
}

/**
 * Link a FateWise token to a user account.
 */
export async function linkFatewiseTokenToUser(
  tokenStr: string,
  userId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const result = await supabase
    .from('tokens')
    .update({
      user_id: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('token', tokenStr)

  if (result.error) {
    console.error('[fatewise-tokens] linkFatewiseTokenToUser error:', result.error)
    return false
  }
  return true
}

/**
 * Create an ez-mystic subscription (or update existing) linked to a Gumroad purchase.
 */
export async function createFatewiseSubscription(
  userId: string,
  plan: 'pro' | 'premium',
  saleId: string,
  expiresAt?: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  // Check if user already has a subscription record
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'ez-mystic')
    .limit(1)
    .maybeSingle()

  if (existingSub) {
    const result = await supabase
      .from('subscriptions')
      .update({
        plan,
        status: 'active',
        source: 'ez-mystic',
        gumroad_order_id: saleId,
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('source', 'ez-mystic')

    if (result.error) {
      console.error('[fatewise-tokens] update subscription error:', result.error)
      return false
    }
  } else {
    const result = await supabase.from('subscriptions').insert({
      user_id: userId,
      plan,
      status: 'active',
      source: 'ez-mystic',
      gumroad_order_id: saleId,
      expires_at: expiresAt || null,
    })

    if (result.error) {
      console.error('[fatewise-tokens] insert subscription error:', result.error)
      return false
    }
  }

  return true
}
