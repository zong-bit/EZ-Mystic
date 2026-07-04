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

  // Determine the correct redirect path based on current URL (preserve /zh/ prefix)
  const redirectPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/zh/') ? '/zh/chat' : '/chat';

  // Session check — zero network calls.
  // getSession() hangs on China→Supabase connections, so we never call it here.
  // Check cookie first, then localStorage as fallback (cookie may not be written yet after login).
  // Use window.location.href for full-page reload so cookie takes effect (router.replace is client-side only).
  useEffect(() => {
    let cancelled = false;

    // Check cookie first
    const hasAuthCookie = document.cookie.includes('sb-xgaxejeaxfhlupguqteu-auth-token');
    if (hasAuthCookie) {
      const t = setTimeout(() => {
        if (!cancelled) {
          window.location.href = redirectPath;
        }
      }, 300);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    // Fallback: check localStorage (login page sets this on successful login)
    // This catches the case where cookie hasn't propagated yet after login
    try {
      const tokenStr = localStorage.getItem('sb-xgaxejeaxfhlupguqteu-auth-token');
      if (tokenStr) {
        const parsed = JSON.parse(tokenStr);
        if (parsed?.access_token) {
          // User is logged in (token exists in localStorage)
          // Wait for cookie to propagate, then redirect with full page reload
          const t = setTimeout(() => {
            if (!cancelled) {
              window.location.href = redirectPath;
            }
          }, 500);
          return () => {
            cancelled = true;
            clearTimeout(t);
          };
        }
      }
    } catch {
      // Malformed token — fall through
    }

    // No auth found — show the form
    const t = setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [redirectPath]);

  // Also re-compute redirectPath on each render in case pathname changes
  const [resolvedRedirectPath, setResolvedRedirectPath] = useState(redirectPath);
  useEffect(() => {
    setResolvedRedirectPath(redirectPath);
  }, [redirectPath]);

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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify session was actually established — signInWithPassword may succeed
      // but the session could fail to persist (cookie not written, etc.)
      if (!data?.session) {
        console.warn('[Login] signInWithPassword succeeded but no session returned');
        throw new Error('Authentication succeeded but session could not be established. Please try again.');
      }

      console.log('[Login] Auth successful, session established for:', data.session.user?.email);

      // Persist the auth token in localStorage as a backup.
      // Supabase JS client stores it automatically, but we double-store
      // because getSession() hangs on China→Supabase connections and the
      // auth context won't pick up the cookie reliably.
      try {
        const tokenStr = JSON.stringify(data.session);
        localStorage.setItem(
          `sb-xgaxejeaxfhlupguqteu-auth-token`,
          tokenStr
        );
      } catch (e) {
        console.warn('[Login] Failed to persist session to localStorage:', e);
      }

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

      // Clear form state before navigating
      setEmail('');
      setPassword('');

      // Always use full-page redirect to guarantee cookie propagation.
      // Client-side navigation doesn't pick up new cookies set by Supabase auth.
      window.location.href = resolvedRedirectPath;
    } catch (err: any) {
      console.error('[Login] Error:', err);
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
