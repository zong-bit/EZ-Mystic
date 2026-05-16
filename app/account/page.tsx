'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import { getSupabaseClient } from '../../src/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  expires_at: string | null;
}

interface Token {
  id: string;
  token: string;
  max_requests: number;
  used_requests: number;
  expires_at: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (supabase: SupabaseClient) => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Check if subscription has expired
      if (subData) {
        const expires = new Date(subData.expires_at || '');
        if (expires < new Date()) {
          // Expired — update via Supabase REST API
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (supabaseUrl) {
            await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${subData.id}`, {
              method: 'PATCH',
              headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({ status: 'expired', plan: 'free' }),
            });
          }
          // Refresh
          const { data: refreshedSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          setSubscription(refreshedSub);
        } else {
          setSubscription(subData);
        }
      } else {
        setSubscription(subData);
      }

      const { data: tokenData } = await supabase
        .from('tokens')
        .select('*')
        .eq('user_id', user.id)
        .is('expires_at', null)
        .or(`expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });
      setTokens(tokenData || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const supabase = getSupabaseClient();
    fetchData(supabase);
  }, [user, authLoading, router, fetchData]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <span className="text-gold-primary text-4xl taiji-loader inline-block">☯</span>
          <p className="text-text-secondary text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const totalRequests = subscription?.plan === 'pro' ? Infinity : 3;
  const usedRequests = tokens.length > 0 ? tokens.reduce((sum, t) => sum + t.used_requests, 0) : 0;
  const remainingRequests = subscription?.plan === 'pro' ? Infinity : Math.max(0, 3 - usedRequests);
  const progressPercent = subscription?.plan === 'free'
    ? Math.min(100, (usedRequests / 3) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
            <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">
              Home
            </Link>
            <Link href="/bazi" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">
              Bazi Chart
            </Link>
            <Link href="/chat" className="text-text-tertiary hover:text-text-secondary transition-colors text-sm">
              Chat
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <span className="text-text-secondary text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-text-tertiary hover:text-cinnabar-red transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto pt-28 px-6 pb-16">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
            {error}
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8 page-enter">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Welcome{profile?.name ? `, ${profile.name}` : ''}!
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and usage</p>
        </div>

        {/* Plan Card */}
        <div className="glass-card p-6 mb-6 page-enter">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Your Plan</h2>
              <p className="text-text-secondary text-sm">
                {subscription?.plan === 'pro' ? 'Pro' : 'Free'}
              </p>
            </div>
            {subscription?.plan === 'free' && (
              <Link
                href="/payment/pro"
                className="px-4 py-2 btn-primary text-sm"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

          {/* Subscription expiry info */}
          {subscription?.status === 'active' && subscription?.expires_at && (
            <div className="text-sm mb-2">
              {new Date(subscription.expires_at) <= new Date() ? (
                <p className="text-cinnabar-red">
                  Expired on {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-text-secondary">
                  Valid until {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          {subscription?.status === 'active' && !subscription?.expires_at && (
            <p className="text-sm text-text-secondary">Lifetime</p>
          )}
          {subscription?.status === 'expired' && (
            <p className="text-cinnabar-red text-sm">Subscription expired</p>
          )}

          {subscription?.plan === 'free' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Free summaries today</span>
                <span className="text-text-primary font-medium">{usedRequests} / 3</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <div
                  className="bg-gold-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary">
                {remainingRequests === 0
                  ? 'Daily limit reached. Upgrade to Pro for unlimited access.'
                  : `${remainingRequests} free summaries remaining today`}
              </p>
            </div>
          )}

          {subscription?.plan === 'pro' && (
            <div className="flex items-center gap-2 text-jade-green text-sm">
              <span>✓</span>
              <span>Unlimited access</span>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="glass-card p-6 mb-6 page-enter">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Account Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Email</span>
              <span className="text-text-primary break-all">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Name</span>
              <span className="text-text-primary">{profile?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Member since</span>
              <span className="text-text-primary">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Tokens */}
        {tokens.length > 0 && (
          <div className="glass-card p-6 mb-6 page-enter">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Active Tokens</h2>
            <div className="space-y-3">
              {tokens.map((tok) => {
                const isExpired = tok.expires_at && new Date(tok.expires_at) < new Date();
                const progress = tok.max_requests > 0 ? (tok.used_requests / tok.max_requests) * 100 : 0;
                return (
                  <div key={tok.id} className={`border border-white/10 rounded-xl p-4 space-y-2 ${isExpired ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-text-primary bg-white/5 px-2 py-1 rounded">
                        {tok.token.slice(0, 12)}...
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isExpired ? 'bg-cinnabar-red/10 text-cinnabar-red' : 'bg-jade-green/10 text-jade-green'
                      }`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    {tok.max_requests > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>Usage</span>
                          <span>{tok.used_requests} / {tok.max_requests}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div
                            className="bg-gold-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {tok.expires_at && (
                      <p className="text-xs text-text-secondary">
                        Expires: {new Date(tok.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 page-enter">
          <Link
            href="/chat"
            className="glass-card p-6 text-center hover:border-gold-primary/30 transition-all group"
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="text-text-primary font-semibold group-hover:text-gold-primary transition-colors">Chat with Master</div>
            <div className="text-sm text-text-secondary mt-1">Start your journey</div>
          </Link>
          <Link
            href="/pricing"
            className="glass-card p-6 text-center hover:border-gold-primary/30 transition-all group"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-text-primary font-semibold group-hover:text-gold-primary transition-colors">Upgrade to Pro</div>
            <div className="text-sm text-text-secondary mt-1">Get unlimited access</div>
          </Link>
        </div>

        {/* Sign Out */}
        <div className="text-center pb-8">
          <button
            onClick={handleSignOut}
            className="px-6 py-2 text-cinnabar-red hover:bg-cinnabar-red/10 rounded-xl transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
