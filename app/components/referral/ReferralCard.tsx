'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReferralStats {
  totalInvites: number;
  activeTrials: number;
  proExtensions: number;
  referralCode: string | null;
  referralLink: string | null;
  rewards: Array<{
    id: string;
    reward_type: string;
    duration_days: number | null;
    expires_at: string | null;
    created_at: string;
    referee_id: string | null;
  }>;
}

interface ReferralCardProps {
  token: string;
}

export default function ReferralCard({ token }: ReferralCardProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/referral/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch referral stats:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Check for active trial in rewards
  useEffect(() => {
    if (stats?.rewards) {
      const trial = stats.rewards.find(
        r => r.reward_type === 'trial' && r.expires_at && new Date(r.expires_at) > new Date()
      );
      if (trial?.expires_at) {
        setTrialExpiresAt(trial.expires_at);
      }
    }
  }, [stats]);

  const handleCopy = async () => {
    if (!stats?.referralLink) return;
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = stats.referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate trial countdown
  const getTrialCountdown = () => {
    if (!trialExpiresAt) return null;
    const diff = new Date(trialExpiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-tertiary rounded w-1/3" />
          <div className="h-10 bg-bg-tertiary rounded w-full" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-bg-tertiary rounded" />
            <div className="h-16 bg-bg-tertiary rounded" />
            <div className="h-16 bg-bg-tertiary rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-gold-primary text-2xl">✦</span>
        <h2 className="font-display text-lg font-bold text-text-primary">Invite Friends, Earn Rewards</h2>
      </div>

      {/* Trial countdown */}
      {trialExpiresAt && (
        <div className="mb-5 p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-gold-primary">⏳</span>
            <span className="text-gold-primary text-sm font-medium">
              7-Day Free Trial Active — {getTrialCountdown()}
            </span>
          </div>
        </div>
      )}

      {/* Referral link */}
      <div className="mb-5">
        <label className="block text-xs text-text-tertiary mb-1.5">Your referral link</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={stats?.referralLink || ''}
            className="input-field text-xs font-mono flex-1 bg-bg-tertiary/50 cursor-not-allowed"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              copied
                ? 'bg-jade-green/20 text-jade-green border border-jade-green/30'
                : 'btn-primary whitespace-nowrap'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-gold-primary">{stats?.totalInvites || 0}</div>
          <div className="text-text-tertiary text-xs mt-0.5">Invited</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-jade-green">{stats?.activeTrials || 0}</div>
          <div className="text-text-tertiary text-xs mt-0.5">Active Trials</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-gold-light">{stats?.proExtensions || 0}</div>
          <div className="text-text-tertiary text-xs mt-0.5">Pro Rewards</div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-text-tertiary text-xs text-center">
        When friends sign up with your link, they get 7 days free. When they subscribe, you earn Pro time!
      </p>
    </div>
  );
}
