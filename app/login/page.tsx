'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../src/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Cookie-only session check — zero network calls.
  // getSession() hangs on China→Supabase connections, so we never call it here.
  // Middleware already enforces auth; this is purely a UX optimization for logged-in users.
  useEffect(() => {
    let cancelled = false;

    // Supabase stores the auth cookie as sb-{projectRef}-auth-token
    const hasAuthCookie = document.cookie.includes('sb-xgaxejeaxfhlupguqteu-auth-token');

    if (hasAuthCookie) {
      // Cookie present — user is likely logged in. Trigger a server-side check.
      // This uses the existing cookie, so no new network to Supabase.
      router.refresh();
      // After refresh, middleware will handle any server-side redirect.
      // If we still see the login page, the cookie was stale — show the form.
    }

    // Always show the form after a short delay to avoid flash
    const t = setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
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

      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
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

      {checking ? (
        <div className="relative glass-card max-w-md w-full p-8 flex items-center justify-center" style={{minHeight: '200px'}}>
          <div className="text-text-secondary">Checking session...</div>
        </div>
      ) : (
        <div className="relative glass-card max-w-md w-full p-8 page-enter">
          {/* Close / back link */}
          <Link href="/" className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl">
            ✕
          </Link>

          <div className="text-center mb-8">
            <span className="text-gold-primary text-3xl">✦</span>
            <h1 className="font-display text-2xl font-bold text-gold-primary mt-2">Welcome Back</h1>
            <p className="text-text-secondary text-sm mt-1">Sign in to continue your journey</p>
          </div>

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
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-text-tertiary text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-gold-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
