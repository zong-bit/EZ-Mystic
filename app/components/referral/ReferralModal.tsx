'use client';

import { useState, useEffect } from 'react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (code: string) => void;
  initialCode?: string;
}

export default function ReferralModal({ isOpen, onClose, onApply, initialCode }: ReferralModalProps) {
  const [code, setCode] = useState(initialCode || '');
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || '');
      setValid(null);
      setError(null);
      setValidating(false);
    }
  }, [isOpen, initialCode]);

  const validateCode = async () => {
    if (!code.trim()) {
      setValid(null);
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const res = await fetch('/api/referral/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setValid(true);
        onApply?.(data.code || code.trim());
      } else {
        setValid(false);
      }
    } catch {
      setError('Failed to validate code');
    } finally {
      setValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative glass-card max-w-md w-full p-6 page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-gold-primary text-3xl">✦</span>
          <h2 className="font-display text-xl font-bold text-gold-primary mt-2">Have an Invite Code?</h2>
          <p className="text-text-secondary text-sm mt-1">Enter it below to get a 7-day free trial</p>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              className="input-field text-center uppercase tracking-widest font-mono text-lg"
              placeholder="ABC12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={32}
              disabled={validating}
            />
          </div>

          {valid === null && !error && (
            <button
              onClick={validateCode}
              disabled={validating || !code.trim()}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating ? 'Validating...' : 'Apply Code'}
            </button>
          )}

          {validating && (
            <div className="text-center text-text-tertiary text-sm">
              <span className="inline-block w-4 h-4 border-2 border-gold-primary/30 border-t-gold-primary rounded-full animate-spin" />
            </div>
          )}

          {valid === true && (
            <div className="p-3 rounded-xl bg-jade-green/10 border border-jade-green/20 text-jade-green text-sm text-center">
              ✓ Code valid! You'll get a 7-day free trial.
            </div>
          )}

          {valid === false && (
            <div className="p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
              Invalid or expired code. Please check and try again.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
