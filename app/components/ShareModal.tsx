'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShareModal() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 5秒后弹出
    const timer = setTimeout(() => {
      if (!dismissed) setVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { setVisible(false); setDismissed(true); }}
      />
      {/* Modal */}
      <div className="relative glass-card p-6 md:p-8 rounded-2xl border border-gold-primary/30 text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
        <button
          onClick={() => { setVisible(false); setDismissed(true); }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors text-lg"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="text-gold-primary text-3xl mb-3">✦</div>
        <h2 className="font-display text-xl font-bold text-gold-glow mb-2">
          Invite Friends, Get Free Pro
        </h2>
        <p className="text-text-secondary text-sm mb-5 max-w-xs mx-auto">
          Share FateWise with a friend — you both get <strong className="text-gold-primary">7 days of Pro</strong> for every friend who signs up. When they subscribe, you earn Pro time too.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="btn-primary text-sm px-6 py-2.5 inline-flex items-center justify-center gap-2"
            onClick={() => setDismissed(true)}
          >
            ✦ Start Sharing
          </Link>
          <button
            onClick={() => { setVisible(false); setDismissed(true); }}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            No thanks, continue reading
          </button>
        </div>
      </div>
    </div>
  );
}
