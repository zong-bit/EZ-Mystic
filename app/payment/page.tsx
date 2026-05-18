'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Paddle checkout URLs (update after creating in Paddle dashboard)
const PADDLE_CHECKOUT_PRO = 'https://check.paddle.com/checkout/YOUR_PRO_LINK';
const PADDLE_CHECKOUT_PREMIUM = 'https://check.paddle.com/checkout/YOUR_PREMIUM_LINK';

function PaymentContent() {
  const searchParams = useSearchParams();
  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const baziParam = baziData ? `&bazi=${encodeURIComponent(JSON.stringify(baziData))}` : '';
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : '';

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-2xl w-full page-enter">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gold-glow">Choose Your Plan</h1>
          <p className="text-text-secondary">Complete your purchase to unlock the Destiny Book</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pro Plan */}
          <div className="border border-gold-primary/30 rounded-lg p-6 flex flex-col bg-gold-primary/[0.04]">
            <div className="text-gold-primary text-sm uppercase tracking-wider mb-2">Pro</div>
            <div className="font-display text-4xl font-bold text-gold-primary mb-1">$9<span className="text-lg text-text-secondary">.99</span></div>
            <p className="text-text-tertiary text-xs mb-4">Monthly subscription</p>

            <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-grow">
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Full AI deep interpretation</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Complete Destiny Book PDF</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Great Fortune &amp; Annual Luck</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Open Luck guidance</li>
            </ul>

            <a
              href={PADDLE_CHECKOUT_PRO}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center py-3 mb-3"
            >
              Pay with Paddle →
            </a>

            <div className="text-center">
              <Link
                href={`/fatebook?plan=pro${baziParam}${nameParam}`}
                className="text-text-tertiary hover:text-text-primary transition-colors text-xs"
              >
                I&apos;ve paid, continue to Destiny Book →
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border border-gold-primary/30 rounded-lg p-6 flex flex-col bg-gold-primary/[0.04]">
            <div className="text-gold-primary text-sm uppercase tracking-wider mb-2">Premium</div>
            <div className="font-display text-4xl font-bold text-gold-primary mb-1">$29<span className="text-lg text-text-secondary">.99</span></div>
            <p className="text-text-tertiary text-xs mb-4">One-time payment</p>

            <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-grow">
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Everything in Pro</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Yearly forecast report</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Relationship compatibility</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Feng Shui basics for your chart</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> Priority support</li>
            </ul>

            <a
              href={PADDLE_CHECKOUT_PREMIUM}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center py-3 mb-3"
            >
              Pay with Paddle →
            </a>

            <div className="text-center">
              <Link
                href={`/fatebook?plan=premium${baziParam}${nameParam}`}
                className="text-text-tertiary hover:text-text-primary transition-colors text-xs"
              >
                I&apos;ve paid, continue to Destiny Book →
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-text-muted text-xs space-y-1 mb-6">
          <p>Powered by Paddle · Secure checkout</p>
          <p>14-day money-back guarantee</p>
        </div>

        <div className="text-center">
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
