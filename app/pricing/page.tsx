'use client';

import Link from 'next/link';

// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/gebxj';

// Paddle checkout URLs (update after creating in Paddle dashboard)
const PADDLE_CHECKOUT_PRO = 'https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b';
const PADDLE_CHECKOUT_PREMIUM = 'https://checkout.paddle.com/checkout/price/pri_01krwnhv91ve8zd3t49kd0bysb';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <span className="text-gold-primary text-lg font-display tracking-widest">✦ Choose Your Path ✦</span>
        <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
          Simple, Transparent Pricing
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Start with a free chart reading. Unlock your complete destiny profile when you&apos;re ready.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="glass-card p-8 flex flex-col">
            <span className="text-text-tertiary text-sm uppercase tracking-wider">Free</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-text-primary">$0</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Perfect for exploring your destiny</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Basic Bazi chart with Four Pillars</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Day Master &amp; element analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>AI personality overview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary/30">—</span>
                <span className="text-text-tertiary">Deep interpretation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary/30">—</span>
                <span className="text-text-tertiary">Destiny Book PDF</span>
              </li>
            </ul>
            <Link href="/bazi" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
              Most Popular
            </div>
            <span className="text-gold-primary text-sm uppercase tracking-wider mt-2">Pro</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-gold-primary">$9</span>
              <span className="text-text-secondary">.99</span>
              <span className="text-text-tertiary text-sm ml-1">/month</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Your complete destiny profile — renew monthly</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Full AI deep interpretation (career, wealth, love)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Complete Destiny Book PDF download</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Great Fortune &amp; Annual Luck cycles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Open Luck (Ten Gods) guidance</span>
              </li>
            </ul>
            <Link href="/payment?plan=pro" className="btn-primary w-full text-center py-3">
              Get Destiny Book →
            </Link>
          </div>

          {/* Premium */}
          <div className="glass-card p-8 flex flex-col">
            <span className="text-text-tertiary text-sm uppercase tracking-wider">Premium · Lifetime</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-text-primary">$29</span>
              <span className="text-text-secondary">.99</span>
              <span className="text-text-tertiary text-sm ml-1">one-time</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Everything in Pro + extras — pay once, keep forever</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Yearly forecast report</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Relationship compatibility analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Feng Shui basics for your chart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <Link href="/payment?plan=premium" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
              Upgrade →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">What&apos;s included in the free reading?</h3>
              <p className="text-text-secondary text-sm">Your basic Bazi chart with the Four Pillars, Day Master analysis, and element distribution. It&apos;s a great starting point to understand your destiny code.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">How does the Destiny Book work?</h3>
              <p className="text-text-secondary text-sm">After your chart reading, you can purchase the complete Destiny Book PDF — a beautifully formatted report covering your personality, career, wealth, love, Great Fortune cycles, and annual luck.</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">Is there a refund policy?</h3>
              <p className="text-text-secondary text-sm">Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-2xl font-bold mb-4">
            Not sure which plan is right for you?
          </h2>
          <p className="text-text-secondary mb-8">
            Start with the free chart reading — you&apos;ll know exactly what you need.
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4">
            ✨ Start Free Chart Reading
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold-primary text-lg">✦</span>
            <span className="font-display font-semibold">FateWise</span>
          </div>
          <p className="text-text-tertiary text-sm mb-2">
            © 2026 ez-mystic · FateWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
