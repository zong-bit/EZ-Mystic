'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/auth-context';
import { getSupabaseClient } from '../../../src/lib/supabase';
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
        .eq('source', 'ez-mystic')
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
            .eq('source', 'ez-mystic')
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
      setError(err?.message || '无法加载账户数据');
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
          <p className="text-text-secondary text-sm mt-4">加载中...</p>
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
      <div className="max-w-4xl mx-auto pt-28 px-6 pb-16">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
            {error}
          </div>
        )}

        {/* 欢迎语 */}
        <div className="mb-8 page-enter">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            欢迎{profile?.name ? `，${profile.name}` : ''}！🔮
          </h1>
          <p className="text-text-secondary text-sm mt-1">管理您的账户和使用情况</p>
        </div>

        {/* 首次使用引导 */}
        {!subscription && (
          <div className="glass-card p-8 mb-6 border-gold-primary/30 page-enter">
            <div className="text-center">
              <span className="text-3xl mb-3 block">✨</span>
              <h2 className="font-display text-xl font-bold text-gold-primary mb-2">第一次来吗？</h2>
              <p className="text-text-secondary text-sm mb-4">
                发现您的出生时间如何揭示命运。从一次免费的八字（BaZi）命盘解读开始吧！
              </p>
              <Link href="/bazi" className="btn-primary inline-block px-8 py-3">
                ✨ 尝试您的免费八字（BaZi）解读
              </Link>
              <p className="text-text-tertiary text-xs mt-3">
                无需信用卡 · 只需30秒
              </p>
            </div>
          </div>
        )}

        {/* 套餐卡片 */}
        <div className="glass-card p-6 mb-6 page-enter">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">您的套餐</h2>
              <p className="text-text-secondary text-sm">
                {subscription?.plan === 'pro' ? '专业版' : '免费版'}
              </p>
            </div>
            {subscription?.plan === 'free' && (
              <Link
                href="/payment/pro"
                className="px-4 py-2 btn-primary text-sm"
              >
                升级到专业版
              </Link>
            )}
          </div>

          {/* 订阅到期信息 */}
          {subscription?.status === 'active' && subscription?.expires_at && (
            <div className="text-sm mb-2">
              {new Date(subscription.expires_at) <= new Date() ? (
                <p className="text-cinnabar-red">
                  过期于 {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-text-secondary">
                  有效至 {new Date(subscription.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          {subscription?.status === 'active' && !subscription?.expires_at && (
            <p className="text-sm text-text-secondary">终身</p>
          )}
          {subscription?.status === 'expired' && (
            <p className="text-cinnabar-red text-sm">订阅已过期</p>
          )}

          {subscription?.plan === 'free' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">今日免费摘要</span>
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
                  ? '已达到每日限制。升级到专业版以无限访问。'
                  : `今天剩余${remainingRequests}次免费摘要`}
              </p>
            </div>
          )}

          {subscription?.plan === 'pro' && (
            <div className="flex items-center gap-2 text-jade-green text-sm">
              <span>✓</span>
              <span>无限访问</span>
            </div>
          )}
        </div>

        {/* 账户信息 */}
        <div className="glass-card p-6 mb-6 page-enter">
          <h2 className="text-lg font-semibold text-text-primary mb-4">账户信息</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">邮箱</span>
              <span className="text-text-primary break-all">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">姓名</span>
              <span className="text-text-primary">{profile?.name || '未设置'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">加入时间</span>
              <span className="text-text-primary">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : '无'}
              </span>
            </div>
          </div>
        </div>

        {/* 有效令牌 */}
        {tokens.length > 0 && (
          <div className="glass-card p-6 mb-6 page-enter">
            <h2 className="text-lg font-semibold text-text-primary mb-4">有效令牌</h2>
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
                        {isExpired ? '已过期' : '有效'}
                      </span>
                    </div>
                    {tok.max_requests > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-text-secondary">
                          <span>使用量</span>
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
                        过期：{new Date(tok.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 快速链接 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 page-enter">
          <Link
            href="/chat"
            className="glass-card p-6 text-center hover:border-gold-primary/30 transition-all group"
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="text-text-primary font-semibold group-hover:text-gold-primary transition-colors">与大师对话</div>
            <div className="text-sm text-text-secondary mt-1">开始你的旅程</div>
          </Link>
          <Link
            href="/pricing"
            className="glass-card p-6 text-center hover:border-gold-primary/30 transition-all group"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-text-primary font-semibold group-hover:text-gold-primary transition-colors">升级到专业版</div>
            <div className="text-sm text-text-secondary mt-1">获取无限访问</div>
          </Link>
        </div>

        {/* 退出登录 */}
        <div className="text-center pb-8">
          <button
            onClick={handleSignOut}
            className="px-6 py-2 text-cinnabar-red hover:bg-cinnabar-red/10 rounded-xl transition-colors font-medium"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}