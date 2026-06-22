'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './auth/auth-context';
import QuickDivination from './components/QuickDivination';

export default function HomePage() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/user-count')
      .then(r => r.json())
      .then(d => { if (d.count > 0) setUserCount(d.count) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Subtle radial glow — gold, not blue/purple */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 55% 45%, rgba(212,175,55,0.04) 0%, transparent 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-8 md:px-12 py-32 text-center">
          {/* Top label — narrow gold line */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span
              className="block"
              style={{ width: 40, height: 1, backgroundColor: 'var(--color-primary)' }}
            />
            <span
              className="text-sm tracking-[0.3em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Bazi Chart · Bagua Divination · AI Destiny Reading
            </span>
            <span
              className="block"
              style={{ width: 40, height: 1, backgroundColor: 'var(--color-primary)' }}
            />
          </div>

          {/* Title — serif, large, centered */}
          <h1
            className="font-display font-bold leading-[1.15] mb-8"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-serif)',
            }}
          >
            Ancient Chinese
            <br />
            <span style={{ color: 'var(--color-primary)' }}>
              Divination & Astrology
            </span>
          </h1>

          {/* Subtitle — generous line-height */}
          <p
            className="max-w-2xl mx-auto mb-12 leading-[1.9]"
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-sans)',
            }}
          >
            Instantly cast I Ching hexagrams and generate your BaZi (Four Pillars of Destiny) chart — free, precise, AI-powered.
            <br />
            <span style={{ color: 'var(--color-text-muted)' }}>Millennia of Eastern wisdom, revealed by artificial intelligence.</span>
          </p>

          {/* CTA — dual: primary gold (Bagua) + secondary (Bazi) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/bagua"
              className="inline-flex items-center gap-2 text-lg font-semibold transition-all hover:translate-y-[-1px]"
              style={{
                padding: '16px 40px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                boxShadow: '0 0 32px rgba(212,175,55,0.25)',
                fontSize: '1.125rem',
              }}
            >
              🔮 Free Bagua Divination
            </Link>
            <Link
              href="/bazi"
              className="inline-flex items-center gap-1 text-lg transition-colors"
              style={{
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                paddingBottom: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              View Your Bazi Chart →
            </Link>
          </div>

          {/* Social proof — centered */}
          {userCount !== null && userCount > 0 && (
            <div className="mt-8 text-center" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                {userCount.toLocaleString()}
              </span>
              <span> charts generated</span>
            </div>
          )}

          {/* Decorative bottom line */}
          <div className="mt-24 flex items-center justify-center gap-12 w-full max-w-md mx-auto">
            {[
              { num: '4', label: 'Pillars' },
              { num: '64', label: 'Hexagrams' },
              { num: '8', label: 'Trigrams' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center">
                <span
                  className="font-display font-bold"
                  style={{
                    fontSize: '2rem',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-family-serif)',
                  }}
                >
                  {item.num}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginTop: 4 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Quick Divination Section ── */}
      <QuickDivination />

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Features — centered grid ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              CORE FEATURES
            </span>
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
          </div>

          {/* Title */}
          <h2
            className="font-display font-bold mb-4 text-center"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            A Complete Destiny
            <br />
            Analysis Experience
          </h2>
          <p className="text-center text-text-secondary mb-16 max-w-xl mx-auto">
            From precise charting to deep interpretation — a complete destiny analysis experience
          </p>

          {/* Centered feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 — Bagua Divination (moved to first position) */}
            <Link href="/bagua" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                Bagua Divination
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Cast I Ching hexagrams with the Eight Trigrams. Get instant results with AI-powered interpretation of the ancient Oracle.
              </p>
            </Link>

            {/* Feature 2 — Bazi Chart */}
            <Link href="/bazi" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🜁</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                Bazi Chart
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Precise charting based on true solar time correction, supporting solar/lunar calendar conversion, covering 1900–2100.
              </p>
            </Link>

            {/* Feature 3 — AI Interpretation */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜂</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                AI Deep Interpretation
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI astrologer analyzes your Bazi chart and I Ching hexagrams across multiple dimensions — personality, career, wealth, relationships, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Life Tools — card grid layout ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              LIFE TOOLS
            </span>
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
          </div>

          <h2
            className="font-display font-bold mb-4 text-center"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            Ancient Wisdom for
            <br />
            Daily Life
          </h2>
          <p className="text-center text-text-secondary mb-16 max-w-xl mx-auto">
            Practical daily tools based on ancient Chinese wisdom
          </p>

          {/* Card grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Diet Guide */}
            <Link href="/diet" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🍜</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Diet Guide
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Five Elements diet recommendations based on seasonal energy.
              </p>
            </Link>

            {/* Color Match */}
            <Link href="/colors" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Color Match
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Find the colors that harmonize with your Five Elements energy.
              </p>
            </Link>

            {/* Exercise */}
            <Link href="/exercise" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🏃</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Exercise
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Mind-body exercises matched to your elemental profile.
              </p>
            </Link>

            {/* Direction */}
            <Link href="/direction" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Direction
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Feng Shui directions for your living and working space.
              </p>
            </Link>

            {/* Luck Boost */}
            <Link href="/luck" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🍀</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Luck Boost
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Daily lucky colors, numbers, directions, and wealth items.
              </p>
            </Link>

            {/* Compatibility */}
            <Link href="/compatibility" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">💑</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                Compatibility
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Five Elements compatibility between two people or energies.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <LiveStats />

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Pricing — card layout ── */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              PRICING
            </span>
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
          </div>

          <h2
            className="font-display font-bold mb-4 text-center"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            Start Free,
            <br />
            Unlock Your Destiny
          </h2>
          <p className="text-center text-text-secondary mb-16 max-w-xl mx-auto">
            Start with a free chart reading. Unlock your complete destiny profile when you're ready.
          </p>

          {/* Pricing cards */}
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
                <li>✓ Bagua hexagram casting</li>
                <li>✓ AI element analysis</li>
              </ul>
              <Link href="/bazi" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
                Get Started →
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
                Best Value
              </div>
              <div className="mb-4 mt-2">
                <span className="text-gold-primary text-sm uppercase tracking-wider">Pro · Monthly</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-gold-primary">$9</span>
                <span className="text-text-secondary">.99</span>
                <span className="text-text-tertiary text-sm ml-1">/month</span>
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

            {/* Pro Yearly */}
            <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
                Best Value
              </div>
              <div className="mb-4 mt-2">
                <span className="text-gold-primary text-sm uppercase tracking-wider">Pro · Yearly</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-gold-primary">$79</span>
                <span className="text-text-secondary">.99</span>
                <span className="text-text-tertiary text-sm ml-1">/year</span>
              </div>
              <p className="text-gold-primary text-sm font-semibold mb-2">Save 34% — just $6.67/month</p>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ Everything in Free</li>
                <li>✓ Full AI deep interpretation</li>
                <li>✓ Complete Destiny Book (PDF)</li>
                <li>✓ Great Fortune & Annual Luck</li>
                <li>✓ Open Luck guidance</li>
              </ul>
              <Link href="/payment?plan=pro-yearly" className="btn-primary w-full text-center py-3">
                Get Destiny Book →
              </Link>
            </div>
          </div>

          <p className="text-center text-text-tertiary text-xs mt-12">
            Secure payment via Gumroad & Paddle · 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ── Why FateWise ── */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              WHY FATEWISE
            </span>
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
          </div>

          <h2 className="font-display text-3xl font-bold text-center mb-16">Why FateWise</h2>

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

      {/* ── CTA — centered ── */}
      <section className="py-32 px-8">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Explore
            <br />
            Your Destiny?
          </h2>
          <p className="text-text-secondary mb-8">
            Enter your birth information and receive your personalized Bazi chart
            <br />
            and AI interpretation instantly.
          </p>
          <Link
            href="/bazi"
            className="btn-primary text-lg px-12 py-4"
          >
            ✨ Start Free Chart Reading
          </Link>
        </div>
      </section>

      {/* ── Footer compliance ── */}
      <section className="pb-16 px-8">
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
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-text-tertiary tracking-wide uppercase text-xs font-semibold">📊 Live Stats</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.today}</div>
            <div className="text-xs text-text-tertiary mt-1">Charts generated today</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.total}</div>
            <div className="text-xs text-text-tertiary mt-1">Total charts generated</div>
          </div>
        </div>
      </div>
    </section>
  )
}
