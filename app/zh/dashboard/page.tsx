'use client';

import { useAuth } from '../../auth/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../../src/lib/supabase';
import ReferralCard from '../../components/referral/ReferralCard';
import ReferralHistory from '../../components/referral/ReferralHistory';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/account');
    }
  }, [user, loading, router]);

  if (loading) {
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

  const email = user.email || '';
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
  const [token, setToken] = useState<string | null>(null);

  // Get session token for API calls
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token || null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Dashboard Content */}
      <div className="max-w-4xl mx-auto pt-28 px-6 pb-16">
        <div className="glass-card p-8 page-enter">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gold-primary/15 flex items-center justify-center">
              <span className="text-gold-primary text-2xl">☯</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">欢迎来到 FateWise</h1>
              <p className="text-text-secondary text-sm">自 {createdAt} 起成为会员</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-5">
              <h3 className="text-gold-primary text-sm font-semibold mb-1">邮箱</h3>
              <p className="text-text-primary text-sm break-all">{email}</p>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-gold-primary text-sm font-semibold mb-1">用户 ID</h3>
              <p className="text-text-primary text-xs break-all font-mono">{user.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-text-primary">快速链接</h2>

            <Link
              href="/chat"
              className="block glass-card p-4 hover:border-gold-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="text-text-primary font-medium group-hover:text-gold-primary transition-colors">
                    与袁方大师交流
                  </div>
                  <div className="text-text-tertiary text-sm">无限次AI玄学咨询</div>
                </div>
              </div>
            </Link>

            <Link
              href="/bazi"
              className="block glass-card p-4 hover:border-gold-primary/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="text-text-primary font-medium group-hover:text-gold-primary transition-colors">
                    八字命盘 (Bazi Chart)
                  </div>
                  <div className="text-text-tertiary text-sm">生成您的四柱命盘 (Four Pillars chart)</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Referral Section */}
          <div className="mt-8 space-y-6">
            <h2 className="font-display text-lg font-semibold text-text-primary flex items-center gap-2">
              <span className="text-gold-primary">✦</span> 推荐计划
            </h2>
            {token ? (
              <>
                <ReferralCard token={token} />
                <ReferralHistory token={token} />
              </>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-text-secondary text-sm">登录查看您的推荐统计</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}