'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';

interface ReferralStats {
  totalInvites: number;
  activeTrials: number;
  proExtensions: number;
  referralCode: string | null;
  referralLink: string | null;
}

interface ReferralCardProps {
  onCopy?: () => void;
}

export default function ReferralCard({ onCopy }: ReferralCardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/referral/stats', {
        headers: {
          Authorization: `Bearer ${document.cookie
            .split(';')
            .find(c => c.trim().startsWith('sb-xgaxejeaxfhlupguqteu-auth-token='))
            ?.split('=')
            .slice(1)
            .join('=') || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch referral stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCopy = async () => {
    if (!stats?.referralLink) return;
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      onCopy?.();
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
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/3" />
          <div className="h-10 bg-white/5 rounded" />
          <div className="flex gap-4">
            <div className="h-16 bg-white/5 rounded flex-1" />
            <div className="h-16 bg-white/5 rounded flex-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-gold-primary text-2xl">✦</span>
        <h3 className="font-display text-lg font-semibold text-text-primary">Invite Friends</h3>
      </div>

      {/* Invite Link */}
      <div className="mb-5">
        <p className="text-text-secondary text-sm mb-2">Share your invite link:</p>
        <div className="flex gap-2">
          <div className="flex-1 input-field text-sm font-mono text-gold-primary/80 truncate select-all">
            {stats?.referralLink || 'Generating...'}
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              copied
                ? 'bg-jade-green/20 text-jade-green border border-jade-green/30'
                : 'bg-gold-primary/15 text-gold-primary border border-gold-primary/20 hover:bg-gold-primary/25'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <div className="text-2xl font-bold text-gold-primary">{stats?.totalInvites || 0}</div>
          <div className="text-text-tertiary text-xs mt-1">Invited</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <div className="text-2xl font-bold text-jade-green">{stats?.activeTrials || 0}</div>
          <div className="text-text-tertiary text-xs mt-1">Active Trials</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/[0.03]">
          <div className="text-2xl font-bold text-gold-light">{stats?.proExtensions || 0}</div>
          <div className="text-text-tertiary text-xs mt-1">Pro Extensions</div>
        </div>
      </div>

      {/* Reward info */}
      <div className="mt-4 p-3 rounded-xl bg-gold-primary/5 border border-gold-primary/10">
        <p className="text-text-secondary text-xs text-center">
          When friends sign up via your link, they get <span className="text-gold-primary font-semibold">7 days free</span> — and you'll earn rewards too!
        </p>
      </div>
    </div>
  );
}
