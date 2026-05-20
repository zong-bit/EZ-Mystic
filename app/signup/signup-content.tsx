'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../src/lib/supabase';
import ReferralModal from '../components/referral/ReferralModal';

export default function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  // Extract ref code from URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase().trim());
    }
  }, [searchParams]);

  const handleReferralApply = (code: string) => {
    setReferralCode(code);
    setShowReferralModal(false);
  };

  const handleClaimReferral = async () => {
    if (!referralCode) return;
    try {
      const res = await fetch('/api/referral/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimResult(`7-day free trial activated! Expires: ${new Date(data.trialExpiresAt).toLocaleDateString()}`);
      } else {
        setClaimResult(data.error || 'Failed to apply referral code');
      }
    } catch {
      setClaimResult('Failed to apply referral code');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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

      if (data.session) {
        // Auto-login if session returned (email confirmation disabled)
        router.push('/bazi');
        router.refresh();
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
          <p className="text-text-secondary text-sm mt-1">Join FateWise for unlimited AI metaphysics consultations</p>
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

        {/* Referral Code Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-text-secondary">Referral Code <span className="text-text-tertiary">(optional)</span></label>
            {!referralCode && (
              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="text-gold-primary text-xs hover:underline"
              >
                Have a code?
              </button>
            )}
          </div>

          {referralCode ? (
            <div className="flex gap-2">
              <div className="flex-1 input-field text-center uppercase tracking-widest font-mono text-sm text-gold-primary">
                {referralCode}
              </div>
              <button
                type="button"
                onClick={() => setReferralCode(null)}
                className="px-3 text-text-tertiary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowReferralModal(true)}
              className="w-full input-field text-center text-text-tertiary hover:text-text-secondary hover:border-gold-primary/20 transition-colors cursor-pointer"
            >
              Enter referral code (optional)
            </button>
          )}
        </div>

        {/* Claim referral reward */}
        {referralCode && (
          <button
            type="button"
            onClick={handleClaimReferral}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-jade-green/15 text-jade-green border border-jade-green/20 hover:bg-jade-green/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Claim 7-Day Free Trial
          </button>
        )}

        {claimResult && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
            claimResult.includes('trial') || claimResult.includes('activated')
              ? 'bg-jade-green/10 border border-jade-green/20 text-jade-green'
              : 'bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red'
          }`}>
            {claimResult}
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
      </div>

      {/* Referral Code Modal */}
      <ReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        onApply={handleReferralApply}
      />
    </div>
  );
}
