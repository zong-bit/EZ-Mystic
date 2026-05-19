'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './auth/auth-context';

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 starry-bg opacity-50" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-gold-primary text-lg font-display tracking-widest">✦ Free Bazi Calculator · AI-Powered Chinese Astrology ✦</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight text-gold-glow">
            Free Bazi Calculator &
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-gold-light to-gold-primary bg-clip-text text-transparent">
              Chinese Astrology Reading
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
            Calculate your BaZi (Four Pillars of Destiny) chart instantly — free, accurate, and AI-powered.
            <br />
            <span className="text-text-tertiary text-base">Millennia of Eastern wisdom, revealed by artificial intelligence</span>
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mb-8 text-text-tertiary text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gold-primary">★★★★★</span>
              <span className="text-text-secondary">4.8/5</span>
            </div>
            <span className="text-text-tertiary/50">·</span>
            <div className="flex items-center gap-1">
              <span>📊</span>
              <span>10,000+ charts generated</span>
            </div>
            <span className="text-text-tertiary/50">·</span>
            <div className="flex items-center gap-1">
              <span>🌍</span>
              <span>50+ countries</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bazi" className="btn-primary glow-pulse text-lg px-12 py-4">
              ✨ Get Your Free Bazi Chart
            </Link>
            <Link href="/pricing" className="glass px-8 py-4 text-text-secondary hover:text-text-primary transition-colors text-lg">
              View Pricing →
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex justify-center gap-8 text-text-tertiary">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">4</div>
              <div className="text-xs mt-1">Pillars</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">10</div>
              <div className="text-xs mt-1">Heavenly Stems</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">12</div>
              <div className="text-xs mt-1">Earthly Branches</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">∞</div>
              <div className="text-xs mt-1">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">Core Features</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            From precise charting to deep interpretation — a complete destiny analysis experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bazi Chart */}
            <Link href="/bazi" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🜁</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                Bazi Chart
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Precise charting based on true solar time correction, supporting solar/lunar calendar conversion, covering 1900–2100.
              </p>
            </Link>

            {/* AI Interpretation */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜂</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                AI Deep Interpretation
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                An AI astrologer analyzes your Bazi chart across multiple dimensions — personality, career, wealth, relationships, and more.
              </p>
            </div>

            {/* Destiny Book PDF */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜄</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                Complete Destiny Book
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Generate a beautifully formatted PDF Destiny Book report with Great Fortune cycles, annual luck analysis, and open-luck guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <LiveStats />

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">Pricing</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            Start free, unlock your full destiny profile
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="glass-card p-8 flex flex-col">
              <div className="mb-4">
                <span className="text-text-tertiary text-sm uppercase tracking-wider">Free</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">$0</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ Basic Bazi chart</li>
                <li>✓ Four Pillars overview</li>
                <li>✓ AI element analysis</li>
              </ul>
              <Link href="/bazi" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
                Most Popular
              </div>
              <div className="mb-4 mt-2">
                <span className="text-gold-primary text-sm uppercase tracking-wider">Pro</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-gold-primary">$9</span>
                <span className="text-text-secondary">.99</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ Everything in Free</li>
                <li>✓ Full AI deep interpretation</li>
                <li>✓ Complete Destiny Book (PDF)</li>
                <li>✓ Great Fortune & Annual Luck</li>
                <li>✓ Open Luck guidance</li>
              </ul>
              <Link href="/payment?plan=pro" className="btn-primary w-full text-center py-3">
                Get Destiny Book →
              </Link>
            </div>

            {/* Premium */}
            <div className="glass-card p-8 flex flex-col">
              <div className="mb-4">
                <span className="text-text-tertiary text-sm uppercase tracking-wider">Premium</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">$29</span>
                <span className="text-text-secondary">.99</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ Everything in Pro</li>
                <li>✓ Yearly forecast report</li>
                <li>✓ Relationship compatibility</li>
                <li>✓ Feng Shui basics</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/payment?plan=premium" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
                Upgrade →
              </Link>
            </div>
          </div>

          <p className="text-center text-text-tertiary text-xs mt-12">
            Secure payment via Gumroad & Paddle · 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Why EZ-Mystic */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-16">Why EZ-Mystic</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">📐</span>
              </div>
              <h3 className="font-display font-semibold mb-2">Precise Charting</h3>
              <p className="text-text-secondary text-sm">True solar time correction + accurate solar term data ensures 100% chart accuracy</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🧬</span>
              </div>
              <h3 className="font-display font-semibold mb-2">AI Deep Interpretation</h3>
              <p className="text-text-secondary text-sm">An AI astrologer rooted in ancient wisdom, providing professional and profound destiny readings</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🔒</span>
              </div>
              <h3 className="font-display font-semibold mb-2">Privacy & Security</h3>
              <p className="text-text-secondary text-sm">All data processing happens locally — your birth information never leaves your device</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Explore Your Destiny?
          </h2>
          <p className="text-text-secondary mb-8">
            Enter your birth information and receive your personalized Bazi chart and AI interpretation instantly
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4">
            ✨ Start Free Chart Reading
          </Link>
        </div>
      </section>

      {/* Business description for payment partner compliance */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto p-4 border border-gold-primary/20 rounded-lg bg-gold-primary/5">
          <p className="text-text-secondary text-sm leading-relaxed text-center">
            <strong className="text-gold-primary">FateWise</strong> (operated as <strong className="text-gold-primary">BornChart</strong>) is an AI-powered Chinese astrology platform that generates personalized Bazi (Four Pillars of Destiny) charts, provides in-depth AI interpretation across personality, career, wealth, and relationships, and delivers beautifully formatted Destiny Book PDF reports with Great Fortune cycles and annual luck analysis.
          </p>
        </div>
      </section>

    </div>
  );
}

// ── Live Stats component ──
type StatsData = {
  today: number
  total: number
  uniqueIps: number
}

function LiveStats() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-text-tertiary tracking-wide uppercase text-xs font-semibold">📊 Live Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.today}</div>
            <div className="text-xs text-text-tertiary mt-1">charts generated today</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.uniqueIps}</div>
            <div className="text-xs text-text-tertiary mt-1">active users this week</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.total}</div>
            <div className="text-xs text-text-tertiary mt-1">total charts generated</div>
          </div>
        </div>
      </div>
    </section>
  )
}
