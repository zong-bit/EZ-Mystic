'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/gebxj';

// Paddle product prices
const PADDLE_PRO_PRICE_ID = 'pri_01krwj2267cjbr45n40f3aj3vr';
const PADDLE_PREMIUM_PRICE_ID = 'pri_01krwj29wge21qkx8yfe9re6vy';
// TODO: Replace with actual Paddle checkout URLs from dashboard
const PADDLE_CHECKOUT_PRO = 'https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b';
const PADDLE_CHECKOUT_PREMIUM = 'https://checkout.paddle.com/checkout/price/pri_01krwnhv91ve8zd3t49kd0bysb';

interface PlanInfo {
  name: string;
  price: string;
  priceFull: string;
  subtitle: string;
  features: string[];
  gumroadLink: string;
  paddleLink: string;
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
    paddleLink: PADDLE_CHECKOUT_PRO,
    planKey: 'pro',
  },
  premium: {
    name: 'Premium',
    price: '$29',
    priceFull: '$29.99',
    subtitle: 'One-time payment · Lifetime access',
    features: [
      'Everything in Pro',
      'Yearly forecast report',
      'Relationship compatibility analysis',
      'Feng Shui basics for your chart',
      'Priority support',
    ],
    gumroadLink: GUMROAD_YEARLY,
    paddleLink: PADDLE_CHECKOUT_PREMIUM,
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

  const [selected, setSelected] = useState<'gumroad' | 'paddle'>('gumroad');
  const handleCheckout = () => {
    const url = selected === 'gumroad' ? plan.gumroadLink : plan.paddleLink;
    window.open(url, '_blank', 'noopener,noreferrer');
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

        <div className="mb-6">
          <p className="text-text-tertiary text-xs mb-2 text-center">Choose payment method:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelected('gumroad')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                selected === 'gumroad'
                  ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                  : 'border-white/10 text-text-tertiary hover:text-text-secondary'
              }`}
            >
              💳 Gumroad
            </button>
            <button
              onClick={() => setSelected('paddle')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                selected === 'paddle'
                  ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                  : 'border-white/10 text-text-tertiary hover:text-text-secondary'
              }`}
            >
              🔷 Paddle
            </button>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={processing} className="btn-primary w-full text-lg glow-pulse mb-4">
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
              💳 Pay with {selected === 'gumroad' ? 'Gumroad' : 'Paddle'} · {plan.priceFull}
            </span>
          )}
        </button>

        <div className="text-center space-y-3 mb-6">
          {/* 14-day guarantee badge */}
          <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
            <span className="text-gold-primary text-lg">🛡</span>
            <span className="text-gold-primary text-sm font-semibold">14-Day Money-Back Guarantee</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
            <span>Powered by Gumroad & Paddle</span>
            <span className="text-text-tertiary/30">·</span>
            <span>Secure checkout</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs">
            <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              Terms of Service
            </Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              Refund Policy
            </Link>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <Link
            href={`/payment/verify?plan=${plan.planKey}${baziParam}${nameParam}`}
            className="block text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            I&apos;ve paid — activate my purchase →
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
    <>
      <Suspense fallback={
        <div className="min-h-screen starry-bg flex items-center justify-center">
          <div className="text-gold-primary text-2xl taiji-loader">✦</div>
        </div>
      }>
        <PaymentPlanContent />
      </Suspense>
      {/* Server-rendered legal notice */}
      <div className="text-center space-y-3 px-6 pb-8">
        <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
          <span className="text-gold-primary text-lg">🛡</span>
          <span className="text-gold-primary text-sm font-semibold">14-Day Money-Back Guarantee</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
          <span>Powered by Gumroad &amp; Paddle</span>
          <span className="text-text-tertiary/30">·</span>
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Terms of Service</Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Privacy Policy</Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Refund Policy</Link>
        </div>
      </div>
    </>
  );
}
