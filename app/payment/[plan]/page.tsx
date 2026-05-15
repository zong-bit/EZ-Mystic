'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/gebxj';

interface PlanInfo {
  name: string;
  price: string;
  priceFull: string;
  subtitle: string;
  features: string[];
  gumroadLink: string;
  planKey: 'pro' | 'premium';
}

const PLANS: Record<string, PlanInfo> = {
  pro: {
    name: 'Pro',
    price: '$9',
    priceFull: '$9.99',
    subtitle: 'Monthly subscription',
    features: [
      'Full AI deep interpretation (career, wealth, love)',
      'Complete Destiny Book PDF download',
      'Great Fortune & Annual Luck cycles',
      'Open Luck (Ten Gods) guidance',
    ],
    gumroadLink: GUMROAD_MONTHLY,
    planKey: 'pro',
  },
  premium: {
    name: 'Premium',
    price: '$29',
    priceFull: '$29.99',
    subtitle: 'One-time payment',
    features: [
      'Everything in Pro',
      'Yearly forecast report',
      'Relationship compatibility analysis',
      'Feng Shui basics for your chart',
      'Priority support',
    ],
    gumroadLink: GUMROAD_YEARLY,
    planKey: 'premium',
  },
};

function PaymentPlanContent() {
  const searchParams = useSearchParams();
  const planSlug = searchParams.get('plan') || 'pro';
  const plan = PLANS[planSlug] || PLANS.pro;

  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const baziParam = baziData ? `&bazi=${encodeURIComponent(JSON.stringify(baziData))}` : '';
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : '';

  const [processing, setProcessing] = useState(false);

  const handleGumroadCheckout = () => {
    window.open(plan.gumroadLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-lg w-full page-enter">
        <div className="text-center mb-8">
          <span className="text-gold-primary text-sm uppercase tracking-wider">{plan.name} Plan</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-2 text-gold-glow">Destiny Book</h1>
          <p className="text-text-secondary">Complete your purchase to unlock your Destiny Book</p>
        </div>

        <div className="text-center mb-8">
          <div className="font-display text-5xl font-bold text-gold-primary mb-2">{plan.price}<span className="text-2xl text-text-secondary">.99</span></div>
          <p className="text-text-tertiary text-sm">{plan.subtitle}</p>
        </div>

        <div className="mb-8 space-y-3">
          {plan.features.map((item) => (
            <div key={item} className="flex items-center gap-3 text-text-secondary text-sm">
              <span className="text-gold-primary">✓</span>
              {item}
            </div>
          ))}
        </div>

        <button onClick={handleGumroadCheckout} disabled={processing} className="btn-primary w-full text-lg glow-pulse mb-4">
          {processing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              Opening checkout...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              💳 Pay with Gumroad · {plan.priceFull}
            </span>
          )}
        </button>

        <div className="text-center text-text-muted text-xs space-y-1 mb-6">
          <p>Powered by Gumroad · Secure checkout</p>
          <p>14-day money-back guarantee</p>
        </div>

        <div className="space-y-3 text-center">
          <Link
            href={`/fatebook?plan=${plan.planKey}${baziParam}${nameParam}`}
            className="block text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            I&apos;ve paid, continue to Destiny Book →
          </Link>
          <Link href="/bazi" className="block text-text-tertiary hover:text-text-primary transition-colors text-xs">
            ← Back to Chart
          </Link>
        </div>

        {baziData && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-text-tertiary text-xs text-center">
              Your Bazi chart will be used to generate your personalized Destiny Book after payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPlanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen starry-bg flex items-center justify-center">
        <div className="text-gold-primary text-2xl taiji-loader">✦</div>
      </div>
    }>
      <PaymentPlanContent />
    </Suspense>
  );
}
