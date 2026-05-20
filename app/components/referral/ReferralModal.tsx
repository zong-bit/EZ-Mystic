'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReferralModalProps {
  defaultCode?: string | null;
  onClaimed?: (success: boolean, error?: string) => void;
}

export default function ReferralModal({ defaultCode, onClaimed }: ReferralModalProps) {
  const [code, setCode] = useState(defaultCode || '');
  const [verifying, setVerifying] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(!!defaultCode);

  const verifyCode = useCallback(async (inputCode: string) => {
    if (!inputCode || inputCode.length < 4) {
      setValid(null);
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch('/api/referral/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setValid(data.valid);
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (defaultCode) {
      verifyCode(defaultCode);
    }
  }, [defaultCode, verifyCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(val);
    setValid(null);
    setError(null);

    // Debounced verification
    if (val.length >= 4) {
      const timer = setTimeout(() => verifyCode(val), 500);
      return () => clearTimeout(timer);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClaimed?.(false, 'cancelled');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${showModal ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          showModal ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative glass-card max-w-md w-full p-6 page-enter ${
          showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <span className="text-gold-primary text-3xl">✦</span>
          <h3 className="font-display text-xl font-bold text-gold-primary mt-2">Have a referral code?</h3>
          <p className="text-text-secondary text-sm mt-1">Enter it to get 7 days free!</p>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              maxLength={8}
              placeholder="ABC12345"
              value={code}
              onChange={handleInputChange}
              className="input-field text-center text-lg font-mono tracking-widest uppercase"
            />
          </div>

          {verifying && (
            <div className="text-center">
              <span className="text-gold-primary text-sm">Verifying...</span>
            </div>
          )}

          {valid === true && !verifying && (
            <div className="p-3 rounded-xl bg-jade-green/10 border border-jade-green/20 text-jade-green text-sm text-center">
              ✓ Valid code! You'll get 7 days free.
            </div>
          )}

          {valid === false && !verifying && (
            <div className="p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
              Invalid code. Please check and try again.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => onClaimed?.(true)}
            disabled={!code || code.length < 8 || valid === false || verifying}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Code
          </button>
        </div>
      </div>
    </div>
  );
}
