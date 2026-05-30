'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ActivatePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    setError('');
    setSuccess(false);

    if (!code.trim()) {
      setError('Please enter your activation code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Invalid activation code');
        return;
      }

      // Store in localStorage and redirect
      localStorage.setItem('fatewise_token', data.token);
      localStorage.setItem('fatewise_plan', data.plan || 'pro');

      setSuccess(true);
      setTimeout(() => router.push('/bazi'), 2000);
    } catch (e: any) {
      setError('Activation failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 starry-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />

      <div className="relative glass-card max-w-md w-full p-8 page-enter">
        {/* Close / back link */}
        <Link href="/" className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl">
          ✕
        </Link>

        <div className="text-center mb-8">
          <span className="text-gold-primary text-3xl">✦</span>
          <h1 className="font-display text-2xl font-bold text-gold-primary mt-2">Activate Your License</h1>
          <p className="text-text-secondary text-sm mt-1">Enter your Gumroad activation code to unlock Pro</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-jade-green/10 border border-jade-green/20 text-jade-green text-sm text-center">
            ✓ Activation successful! Redirecting to your chart...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Activation Code</label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="Enter your activation code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleActivate(); }}
              disabled={loading}
            />
          </div>

          <button
            type="button"
            onClick={handleActivate}
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Activating...' : 'Activate Now'}
          </button>
        </div>

        <p className="text-center text-text-tertiary text-xs mt-6">
          Don't have a code?{' '}
          <Link href="/pricing" className="text-gold-primary hover:underline">
            View plans
          </Link>
        </p>
      </div>
    </div>
  );
}
