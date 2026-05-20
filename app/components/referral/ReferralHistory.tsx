'use client';

import { useState, useEffect, useCallback } from 'react';

interface RewardEntry {
  id: string;
  reward_type: string;
  duration_days: number | null;
  expires_at: string | null;
  created_at: string;
  referee_id: string | null;
}

interface ReferralHistoryProps {
  token: string;
}

export default function ReferralHistory({ token }: ReferralHistoryProps) {
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    try {
      const res = await fetch('/api/referral/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch (e) {
      console.error('Failed to fetch rewards:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const getStatusBadge = (reward: RewardEntry) => {
    if (reward.reward_type === 'pro_extension') {
      const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isExpired
            ? 'bg-cinnabar-red/15 text-cinnabar-red'
            : 'bg-jade-green/15 text-jade-green'
        }`}>
          {isExpired ? 'Expired' : 'Active'}
        </span>
      );
    }
    if (reward.reward_type === 'trial') {
      const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isExpired
            ? 'bg-text-tertiary/15 text-text-tertiary'
            : 'bg-gold-primary/15 text-gold-primary'
        }`}>
          {isExpired ? 'Expired' : 'Active'}
        </span>
      );
    }
    return <span className="text-text-tertiary text-xs">Unknown</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRewardLabel = (reward: RewardEntry) => {
    if (reward.reward_type === 'trial') {
      return `7-Day Free Trial`;
    }
    if (reward.reward_type === 'pro_extension') {
      return `${reward.duration_days || 0}-Day Pro Extension`;
    }
    return reward.reward_type;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-bg-tertiary rounded w-1/4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-bg-tertiary rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <span className="text-3xl">📋</span>
        <p className="text-text-secondary text-sm mt-3">No rewards yet. Invite friends to start earning!</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-gold-primary text-2xl">📋</span>
        <h2 className="font-display text-lg font-bold text-text-primary">Reward History</h2>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between p-4 rounded-xl bg-bg-tertiary/40 border border-white/5 hover:border-gold-primary/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                reward.reward_type === 'trial'
                  ? 'bg-gold-primary/15'
                  : 'bg-jade-green/15'
              }`}>
                {reward.reward_type === 'trial' ? '🎁' : '⭐'}
              </div>
              <div>
                <div className="text-text-primary text-sm font-medium">
                  {getRewardLabel(reward)}
                </div>
                <div className="text-text-tertiary text-xs">
                  {formatDate(reward.created_at)}
                </div>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(reward)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
