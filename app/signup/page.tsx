'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../src/lib/supabase';
import ReferralModal from '../components/referral/ReferralModal';

export const dynamic = 'force-dynamic';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Extract ref code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  // Handle referral claim after signup
  const handleClaimReferral = async (success: boolean, errorMsg?: string) => {
    if (!success) {
      if (errorMsg === 'cancelled') {
        setClaimResult(null);
      }
      return;
    }

    if (!referralCode) return;

    setLoading(true);
    setError(null);
    setClaimResult(null);

    try {
      // Use localStorage token instead of getSession() which hangs
      // on China→Supabase connections.
      const tokenStr = localStorage.getItem(
        `sb-xgaxejeaxfhlupguqteu-auth-token`
      );
      if (!tokenStr) {
        setClaimResult({ success: false, error: 'Not logged in' });
        return;
      }

      // Supabase stores the session object as JSON in localStorage
      let accessToken = '';
      try {
        const parsed = JSON.parse(tokenStr);
        accessToken = parsed.access_token || '';
      } catch {
        // Fallback: treat raw string as token
        accessToken = tokenStr;
      }

      if (!accessToken) {
        setClaimResult({ success: false, error: 'Not logged in' });
        return;
      }

      const res = await fetch('/api/referral/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: referralCode }),
      });

      const data = await res.json();
      if (data.success) {
        setClaimResult({ success: true });
      } else {
        setClaimResult({ success: false, error: data.error || 'Failed to apply referral code' });
      }
    } catch (e: any) {
      setClaimResult({ success: false, error: e.message || 'Claim failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setClaimResult(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Auto-detect Gumroad purchase and activate Pro
      try {
        const { data: sale } = await supabase
          .from('gumroad_sales')
          .select('token, plan')
          .eq('email', email.toLowerCase().trim())
          .eq('refunded', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (sale?.token) {
          localStorage.setItem('fatewise_token', sale.token);
          localStorage.setItem('fatewise_plan', sale.plan || 'pro');
        }
      } catch {
        // Gumroad lookup failure is non-fatal
      }

      if (data.session) {
        // Auto-login if session returned (email confirmation disabled)
        // Persist session to localStorage as backup (getSession() hangs on China→Supabase)
        try {
          const tokenStr = JSON.stringify(data.session);
          localStorage.setItem(
            `sb-xgaxejeaxfhlupguqteu-auth-token`,
            tokenStr
          );
        } catch (e) {
          console.warn('[Signup] Failed to persist session:', e);
        }

        // Wait for cookie propagation, then navigate
        await new Promise((resolve) => setTimeout(resolve, 300));

        const cookieSet = document.cookie.includes('sb-xgaxejeaxfhlupguqteu-auth-token');
        if (cookieSet) {
          router.replace('/bazi');
        } else {
          window.location.href = '/bazi';
        }
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 starry-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

      <div className="relative glass-card max-w-md w-full p-8 page-enter">
        {/* Close / back link */}
        <Link href="/" className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl">
          ✕
        </Link>

        <div className="text-center mb-8">
          <span className="text-gold-primary text-3xl">✦</span>
          <h1 className="font-display text-2xl font-bold text-gold-primary mt-2">Create Account</h1>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-jade-green/10 border border-jade-green/20 text-jade-green text-sm text-center">
            Registration successful! Please check your email to confirm your account.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-text-tertiary text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-primary hover:underline">
            Sign in
          </Link>
        </p>

        {/* Claim result */}
        {claimResult && (
          <div className={`mt-4 p-4 rounded-xl text-sm text-center ${
            claimResult.success
              ? 'bg-jade-green/10 border border-jade-green/20 text-jade-green'
              : 'bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red'
          }`}>
            {claimResult.success
              ? '✓ Referral code applied! 7-day free trial activated.'
              : claimResult.error || 'Failed to apply referral code.'
            }
          </div>
        )}
      </div>

      {/* Referral modal */}
      <ReferralModal
        defaultCode={referralCode}
        onClaimed={handleClaimReferral}
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-gold-primary text-4xl taiji-loader inline-block">☯</span>
          <p className="text-text-secondary text-sm mt-4">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
