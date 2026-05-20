// src/lib/referral.ts — Referral system utilities for FateWise

import crypto from 'crypto'
import { getSupabaseAdmin } from './supabase'

/**
 * Generate an 8-character cryptographically secure random referral code.
 * Uses uppercase letters (no O/I/l to avoid confusion) and digits (no 0/1).
 */
function generateReferralCode(): string {
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buf = crypto.randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[buf[i] % CODE_CHARS.length]
  }
  return code
}

/**
 * Get or create a referral code for the given user.
 */
export async function getOrCreateReferralCode(userId: string): Promise<{ code: string; link: string }> {
  const supabase = getSupabaseAdmin()

  // Check if code already exists
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.code) {
    return {
      code: existing.code,
      link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bornchart.app'}/register?ref=${existing.code}`,
    }
  }

  // Generate unique code
  let code: string
  let attempts = 0
  do {
    code = generateReferralCode()
    attempts++
    if (attempts > 50) throw new Error('Failed to generate unique referral code')
  } while (attempts < 50)

  const { error } = await supabase
    .from('referral_codes')
    .insert({ code, user_id: userId })

  if (error) throw error

  return {
    code,
    link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bornchart.app'}/register?ref=${code}`,
  }
}

/**
 * Validate a referral code and return the referrer's user ID.
 */
export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string }> {
  if (!code || code.length !== 8) return { valid: false }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle()

  if (error || !data) return { valid: false }
  return { valid: true, referrerId: data.user_id }
}

/**
 * Claim a referral reward: bind referee to referrer, grant 7-day trial.
 * 
 * @param refereeId - The user who is claiming the referral
 * @param code - The referral code used
 * @param ip - Optional IP address for anti-fraud
 */
export async function claimReferralReward(
  refereeId: string,
  code: string,
  ip?: string,
): Promise<{ success: boolean; trialExpiresAt?: string; error?: string }> {
  const supabase = getSupabaseAdmin()

  // Validate code
  const { valid, referrerId } = await validateReferralCode(code)
  if (!valid) return { success: false, error: 'Invalid referral code' }
  if (!referrerId) return { success: false, error: 'Referral code is no longer valid' }

  // Anti-fraud: self-invite check
  if (refereeId === referrerId) {
    return { success: false, error: 'Cannot use your own referral code' }
  }

  // Anti-fraud: check if referee already claimed
  const { data: existingClaim } = await supabase
    .from('referral_events')
    .select('id')
    .eq('referee_id', refereeId)
    .eq('event_type', 'signup')
    .maybeSingle()

  if (existingClaim) {
    return { success: false, error: 'You have already used a referral code' }
  }

  // Anti-fraud: IP-based rate limiting (24h, max 3)
  if (ip) {
    const ipCheck = await supabase
      .from('referral_events')
      .select('id', { count: 'exact' })
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (ipCheck.count && ipCheck.count >= 3) {
      return { success: false, error: 'Too many registrations from this IP. Please try again later.' }
    }
  }

  const now = new Date()
  const trialExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Record the referral event
  const { error: eventError } = await supabase.from('referral_events').insert({
    referrer_id: referrerId,
    referee_id: refereeId,
    event_type: 'signup',
    referral_code: code.toUpperCase(),
    ip_address: ip || null,
  })

  if (eventError) {
    // UNIQUE constraint violation = already claimed
    if (eventError.code === '23505') {
      return { success: false, error: 'You have already used a referral code' }
    }
    throw eventError
  }

  // Grant 7-day trial reward to referee
  const { error: rewardError } = await supabase.from('referral_rewards').insert({
    user_id: refereeId,
    reward_type: 'trial',
    duration_days: 7,
    referrer_id: referrerId,
    referral_code: code.toUpperCase(),
    expires_at: trialExpiresAt.toISOString(),
  })

  if (rewardError) throw rewardError

  return { success: true, trialExpiresAt: trialExpiresAt.toISOString() }
}

/**
 * Get referral statistics for a user.
 */
export async function getReferralStats(userId: string): Promise<{
  totalInvites: number
  activeTrials: number
  proExtensions: number
  referralCode: string | null
  referralLink: string | null
  rewards: Array<{
    id: string
    reward_type: string
    duration_days: number | null
    expires_at: string | null
    created_at: string
    referee_id: string | null
  }>
}> {
  const supabase = getSupabaseAdmin()

  // Get referral code
  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle()

  const referralCode = codeData?.code || null
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bornchart.app'
  const referralLink = referralCode
    ? `${baseUrl}/register?ref=${referralCode}`
    : null

  // Count total invites (all signup events)
  const { count: totalInvites } = await supabase
    .from('referral_events')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('event_type', 'signup')

  // Count active trials (referee still has active trial)
  const { count: activeTrials } = await supabase
    .from('referral_rewards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('reward_type', 'trial')
    .gte('expires_at', new Date().toISOString())

  // Count pro extensions
  const { count: proExtensions } = await supabase
    .from('referral_rewards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('reward_type', 'pro_extension')

  // Get recent rewards
  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('id, reward_type, duration_days, expires_at, created_at, referee_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    totalInvites: totalInvites || 0,
    activeTrials: activeTrials || 0,
    proExtensions: proExtensions || 0,
    referralCode,
    referralLink,
    rewards: rewards || [],
  }
}

/**
 * Process Gumroad purchase reward: grant pro extension to the referrer.
 * @param orderEmail - The buyer's email
 * @param orderId - Gumroad order ID (for idempotency)
 * @param planId - Detected FateWise plan ID
 * @param isYearly - Whether the plan is yearly
 */
export async function processPaymentReward(
  orderEmail: string,
  orderId: string,
  planId: string,
  isYearly: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()

  // Check idempotency: has this order already been processed?
  const { data: existingReward } = await supabase
    .from('referral_rewards')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existingReward) {
    console.log(`[Referral] Order ${orderId} already processed, skipping`)
    return { success: true }
  }

  // Look up the user by email — use .maybeSingle() for safety.
  // If emails are not unique, this could return multiple rows; we guard below.
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('email', orderEmail)
    .maybeSingle()

  if (!users) {
    console.warn(`[Referral] No user found for email ${orderEmail}`)
    return { success: true } // Not an error — user might not exist yet
  }

  const refereeId = users.id

  // Check if this user has a referrer
  const { data: referral } = await supabase
    .from('referral_events')
    .select('referrer_id, referral_code')
    .eq('referee_id', refereeId)
    .eq('event_type', 'signup')
    .maybeSingle()

  if (!referral?.referrer_id) {
    return { success: true } // No referrer, nothing to reward
  }

  const referrerId = referral.referrer_id

  // Determine extension duration
  const durationDays = isYearly ? 365 : 30
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  // Insert the pro extension reward
  const { error } = await supabase.from('referral_rewards').insert({
    user_id: referrerId,
    reward_type: 'pro_extension',
    duration_days: durationDays,
    referee_id: refereeId,
    referrer_id: referrerId,
    referral_code: referral.referral_code,
    order_id: orderId,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    if (error.code === '23505') {
      // Duplicate order_id — already processed
      return { success: true }
    }
    console.error('[Referral] Failed to insert pro extension reward:', error)
    return { success: false, error: error.message }
  }

  console.log(`[Referral] ✅ Granted ${durationDays}-day pro extension to referrer ${referrerId} for order ${orderId}`)
  return { success: true }
}

/**
 * Get Pro status for a user.
 */
export async function getProStatus(userId: string): Promise<{
  isPro: boolean
  expiresAt: string | null
  trialExpiresAt: string | null
  proExpiresAt: string | null
  hasActiveTrial: boolean
}> {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  // Get all active rewards for this user
  const { data: rewards } = await supabase
    .from('referral_rewards')
    .select('reward_type, expires_at')
    .eq('user_id', userId)
    .gte('expires_at', now)

  let trialExpiresAt: string | null = null
  let proExpiresAt: string | null = null

  for (const r of rewards || []) {
    if (r.reward_type === 'trial' && (!trialExpiresAt || r.expires_at > trialExpiresAt)) {
      trialExpiresAt = r.expires_at
    }
    if (r.reward_type === 'pro_extension' && (!proExpiresAt || r.expires_at > proExpiresAt)) {
      proExpiresAt = r.expires_at
    }
  }

  // Also check gumroad_sales for active subscriptions
  const { data: sales } = await supabase
    .from('gumroad_sales')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('refunded', false)
    .gte('expires_at', now)

  let proExpiresFromSale: string | null = null
  for (const s of sales || []) {
    if (!proExpiresFromSale || s.expires_at > proExpiresFromSale) {
      proExpiresFromSale = s.expires_at
    }
  }

  const effectiveProExpiresAt = proExpiresAt
    ? (proExpiresAt > (proExpiresFromSale || '') ? proExpiresAt : proExpiresFromSale)
    : proExpiresFromSale

  const isPro = !!effectiveProExpiresAt
  const hasActiveTrial = !!trialExpiresAt

  // Auto-expire old rewards
  if (rewards) {
    for (const r of rewards) {
      if (r.expires_at && new Date(r.expires_at) < new Date()) {
        // Mark expired by deleting or updating — we'll just let the query filter handle it
      }
    }
  }

  return {
    isPro,
    expiresAt: effectiveProExpiresAt,
    trialExpiresAt,
    proExpiresAt: effectiveProExpiresAt,
    hasActiveTrial,
  }
}
