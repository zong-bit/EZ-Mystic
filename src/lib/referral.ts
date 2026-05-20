/**
 * Referral System Utility Functions
 * Phase 1: Invite → Signup → 7-day trial
 */

import { getSupabaseAdmin } from './supabase';

// Generate a random 8-character alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I/l)
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get or create a referral code for a user.
 * Uses service role to bypass RLS.
 */
export async function getOrCreateReferralCode(userId: string): Promise<{ code: string; link: string }> {
  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bornchart.app';

  // Check if user already has a code
  const { data: existing, error: fetchErr } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (fetchErr) {
    console.error('Error fetching referral code:', fetchErr);
  }

  if (existing?.code) {
    return { code: existing.code, link: `${baseUrl}/register?ref=${existing.code}` };
  }

  // Generate a new code (with retry for uniqueness)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ owner_id: userId, code, is_active: true })
      .select('code')
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        // Unique violation, retry
        continue;
      }
      console.error('Error creating referral code:', error);
      throw new Error('Failed to create referral code');
    }

    if (data?.code) {
      return { code: data.code, link: `${baseUrl}/register?ref=${data.code}` };
    }
  }

  throw new Error('Failed to create referral code after retries');
}

/**
 * Validate a referral code and return the referrer's ID.
 * Public function, no auth required.
 */
export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerId: string | null }> {
  if (!code || code.length < 3) {
    return { valid: false, referrerId: null };
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('referral_codes')
    .select('owner_id, is_active')
    .eq('code', code.toUpperCase().trim())
    .maybeSingle();

  if (error || !data || !data.is_active) {
    return { valid: false, referrerId: null };
  }

  // Check if referrer still exists
  const { data: user } = await supabase
    .from('auth.users')
    .select('id')
    .eq('id', data.owner_id)
    .maybeSingle();

  if (!user) {
    return { valid: false, referrerId: null };
  }

  return { valid: true, referrerId: data.owner_id };
}

/**
 * Claim a referral reward after signup.
 * - Records the referral event
 * - Creates a 7-day trial reward
 * - Returns the trial expiration date
 */
export async function claimReferralReward(
  refereeId: string,
  code: string,
): Promise<{ success: boolean; trialExpiresAt: string | null; error: string | null }> {
  const supabase = getSupabaseAdmin();
  const trimmedCode = code.toUpperCase().trim();

  // 1. Validate the code
  const validation = await validateReferralCode(trimmedCode);
  if (!validation.valid) {
    return { success: false, trialExpiresAt: null, error: 'Invalid referral code' };
  }

  const referrerId = validation.referrerId!;

  // 2. Prevent self-referral
  if (refereeId === referrerId) {
    return { success: false, trialExpiresAt: null, error: 'Cannot use your own referral code' };
  }

  // 3. Check if referee already claimed a signup reward
  const { data: existingEvent } = await supabase
    .from('referral_events')
    .select('id')
    .eq('referee_id', refereeId)
    .eq('event_type', 'signup')
    .maybeSingle();

  if (existingEvent) {
    return { success: false, trialExpiresAt: null, error: 'Referral reward already claimed' };
  }

  // 4. Create referral event
  const { data: event, error: eventErr } = await supabase
    .from('referral_events')
    .insert({
      referrer_id: referrerId,
      referee_id: refereeId,
      event_type: 'signup',
      status: 'completed',
      metadata: { code: trimmedCode },
    })
    .select()
    .maybeSingle();

  if (eventErr) {
    if (eventErr.code === '23505') {
      return { success: false, trialExpiresAt: null, error: 'Referral reward already claimed' };
    }
    console.error('Error creating referral event:', eventErr);
    return { success: false, trialExpiresAt: null, error: 'Failed to record referral' };
  }

  // 5. Create trial reward (7 days)
  const trialDays = 7;
  const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

  const { error: rewardErr } = await supabase
    .from('referral_rewards')
    .insert({
      user_id: refereeId,
      reward_type: 'trial',
      duration_days: trialDays,
      status: 'active',
      expires_at: expiresAt,
      source_referral_id: event?.id,
    });

  if (rewardErr) {
    console.error('Error creating referral reward:', rewardErr);
    return { success: false, trialExpiresAt: null, error: 'Failed to create trial reward' };
  }

  return { success: true, trialExpiresAt: expiresAt, error: null };
}

/**
 * Get referral statistics for a user.
 */
export async function getReferralStats(userId: string): Promise<{
  totalInvites: number;
  activeTrials: number;
  proExtensions: number;
  referralCode: string | null;
  referralLink: string | null;
}> {
  const supabase = getSupabaseAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bornchart.app';

  // Get referral code
  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('owner_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  // Get total invites (completed signup events where user is referrer)
  const { count: totalInvites } = await supabase
    .from('referral_events')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .eq('event_type', 'signup')
    .eq('status', 'completed');

  // Get active trial count
  const { count: activeTrials } = await supabase
    .from('referral_rewards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('reward_type', 'trial')
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString());

  // Get pro extension count
  const { count: proExtensions } = await supabase
    .from('referral_rewards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('reward_type', 'pro_extension');

  return {
    totalInvites: totalInvites || 0,
    activeTrials: activeTrials || 0,
    proExtensions: proExtensions || 0,
    referralCode: codeData?.code || null,
    referralLink: codeData?.code ? `${baseUrl}/register?ref=${codeData.code}` : null,
  };
}

/**
 * Get referral history (invites made by a user).
 */
export async function getReferralHistory(userId: string): Promise<Array<{
  id: string;
  refereeId: string;
  eventDate: string;
  refereeEmail: string;
  status: string;
  rewardType: string | null;
  rewardExpiresAt: string | null;
}>> {
  const supabase = getSupabaseAdmin();

  const { data: events, error } = await supabase
    .from('referral_events')
    .select(`
      id,
      referee_id,
      event_type,
      status,
      created_at,
      referral_rewards (
        reward_type,
        expires_at
      )
    `)
    .eq('referrer_id', userId)
    .eq('event_type', 'signup')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referral history:', error);
    return [];
  }

  // Get referee emails
  const refereeIds = (events || []).map(e => e.referee_id).filter(Boolean);
  let emails: Record<string, string> = {};
  if (refereeIds.length > 0) {
    const { data: users } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('id', refereeIds);
    if (users) {
      emails = Object.fromEntries(users.map(u => [u.id, u.email || '']));
    }
  }

  return (events || []).map(e => ({
    id: e.id,
    refereeId: e.referee_id,
    eventDate: e.created_at,
    refereeEmail: emails[e.referee_id] || 'Unknown',
    status: e.status,
    rewardType: e.referral_rewards?.[0]?.reward_type || null,
    rewardExpiresAt: e.referral_rewards?.[0]?.expires_at || null,
  }));
}
