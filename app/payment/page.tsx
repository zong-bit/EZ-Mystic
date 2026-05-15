'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentContent() {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const handlePayment = async () => {
    setProcessing(true);

    // TODO: Integrate Paddle/Dodo Payments
    // MVP simulated payment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    window.location.href = `/fatebook?bazi=${encodeURIComponent(JSON.stringify(baziData))}&name=${encodeURIComponent(name)}`;
    setProcessing(false);
  };

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-lg w-full page-enter">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gold-glow">Destiny Book</h1>
          <p className="text-text-secondary">Complete Destiny Report · PDF Download</p>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl font-display font-bold text-gold-primary mb-2">$29.99</div>
          <p className="text-text-tertiary text-sm">One-time payment · Lifetime access</p>
        </div>

        <div className="mb-8 space-y-3">
          {[
            '📋 Complete Bazi chart report',
            '🧬 AI deep interpretation (3000+ words)',
            '📊 Great Fortune & annual luck analysis',
            '🎯 Luck enhancement guide (colors/numbers/directions)',
            '📕 Beautiful PDF format download',
            '🔄 Free regeneration within 90 days',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-text-secondary text-sm">
              <span className="text-gold-primary">✓</span>
              {item}
            </div>
          ))}
        </div>

        <button onClick={handlePayment} disabled={processing} className="btn-primary w-full text-lg glow-pulse mb-4">
          {processing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              Processing...
            </span>
          ) : '💳 Pay $29.99 Now'}
        </button>

        <div className="text-center text-text-muted text-xs space-y-1">
          <p>Supports Paddle / Dodo Payments / Payoneer</p>
          <p>7-day no-questions-asked refund guarantee</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/bazi" className="text-text-secondary hover:text-text-primary transition-colors text-sm">← Back to Chart</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen starry-bg flex items-center justify-center">
        <div className="text-gold-primary text-2xl taiji-loader">✦</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
