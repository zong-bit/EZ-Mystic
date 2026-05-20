'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/auth-context';

interface ReferralInvite {
  id: string;
  refereeId: string;
  eventDate: string;
  refereeEmail: string;
  status: string;
  rewardType: string | null;
  rewardExpiresAt: string | null;
}

export default function ReferralHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReferralInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const cookieToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('sb-xgaxejeaxfhlupguqteu-auth-token='))
        ?.split('=')
        .slice(1)
        .join('=');

      if (!cookieToken) return;

      const res = await fetch('/api/referral/stats', {
        headers: { Authorization: `Bearer ${cookieToken}` },
      });
      if (!res.ok) return;

      // We'll use the history endpoint when available; for now show a placeholder
      // The stats API already provides count data; history detail comes via a separate endpoint
    } catch (err) {
      console.error('Failed to fetch referral history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-10 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gold-primary text-xl">📋</span>
          <h3 className="font-display text-lg font-semibold text-text-primary">Invite History</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-text-tertiary text-sm">No invites yet. Share your link to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gold-primary text-xl">📋</span>
        <h3 className="font-display text-lg font-semibold text-text-primary">Invite History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Email</th>
              <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Reward</th>
              <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((invite) => (
              <tr key={invite.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-text-primary font-mono text-xs">{invite.refereeEmail}</td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    invite.status === 'completed'
                      ? 'bg-jade-green/15 text-jade-green'
                      : invite.status === 'pending'
                      ? 'bg-gold-primary/15 text-gold-primary'
                      : 'bg-cinnabar-red/15 text-cinnabar-red'
                  }`}>
                    {invite.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-text-secondary text-xs">
                  {invite.rewardType ? (
                    <span className="text-gold-primary">{invite.rewardType}</span>
                  ) : (
                    <span className="text-text-tertiary">—</span>
                  )}
                  {invite.rewardExpiresAt && (
                    <div className="text-text-tertiary text-xs mt-0.5">
                      Expires: {new Date(invite.rewardExpiresAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3 text-text-tertiary text-xs">
                  {new Date(invite.eventDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
