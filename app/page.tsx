'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './auth/auth-context';

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Subtle radial glow — gold, not blue/purple */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 55% 45%, rgba(212,175,55,0.04) 0%, transparent 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-8 md:px-12 py-32">
          {/* Top label — narrow gold line */}
          <div className="flex items-center gap-3 mb-10">
            <span
              className="block"
              style={{ width: 40, height: 1, backgroundColor: 'var(--color-primary)' }}
            />
            <span
              className="text-sm tracking-[0.3em] uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Free Bazi Calculator · AI-Powered Chinese Astrology
            </span>
          </div>

          {/* Title — serif, large, asymmetric */}
          <h1
            className="font-display font-bold leading-[1.15] mb-8"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-serif)',
            }}
          >
            Read Your Destiny
            <br />
            <span style={{ color: 'var(--color-primary)' }}>
              with Four Pillars
            </span>
          </h1>

          {/* Subtitle — generous line-height */}
          <p
            className="max-w-xl mb-12 leading-[1.9]"
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-sans)',
            }}
          >
            Calculate your BaZi (Four Pillars of Destiny) chart instantly.
            <br />
            Millennia of Eastern wisdom, interpreted with precision.
          </p>

          {/* CTA — asymmetric: primary left, secondary right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <Link
              href="/bazi"
              className="inline-flex items-center gap-2 text-base font-semibold transition-all hover:translate-y-[-1px]"
              style={{
                padding: '14px 36px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                boxShadow: '0 0 24px rgba(212,175,55,0.15)',
              }}
            >
              Get Your Free Bazi Chart
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-base transition-colors"
              style={{
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                paddingBottom: 2,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              View Pricing
              <span className="text-lg leading-none">→</span>
            </Link>
          </div>

          {/* Social proof — minimal */}
          {userCount !== null && userCount > 0 && (
            <div className="mt-16 flex items-center gap-3" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                {userCount.toLocaleString()}
              </span>
              <span>charts generated</span>
            </div>
          )}

          {/* Decorative bottom line */}
          <div className="mt-24 flex gap-12">
            {[
              { num: '4', label: 'Pillars' },
              { num: '10', label: 'Heavenly Stems' },
              { num: '12', label: 'Earthly Branches' },
            ].map(item => (
              <div key={item.label} className="flex flex-col">
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

      {/* ── Features — asymmetric grid ── */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              CORE FEATURES
            </span>
          </div>

          {/* Title */}
          <h2
            className="font-display font-bold mb-20"
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

          {/* Asymmetric feature rows */}
          <div className="space-y-20">
            {/* Feature 1 — wide left, narrow right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <Link href="/bazi" className="group inline-block">
                  <h3
                    className="font-display font-bold mb-4 transition-colors"
                    style={{
                      fontSize: '1.5rem',
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-family-serif)',
                    }}
                  >
                    Bazi Chart
                  </h3>
                  <p
                    className="leading-[1.9]"
                    style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}
                  >
                    Precise charting based on true solar time correction, supporting solar/lunar calendar conversion, covering 1900–2100.
                  </p>
                </Link>
              </div>
              <div
                className="p-8"
                style={{
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                  backgroundColor: 'var(--color-bg-surface)',
                }}
              >
                <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 12 }}>🜁</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                  Four Pillars · Year · Month · Day · Hour
                  <br />
                  Each pillar reveals a dimension of your destiny.
                </p>
              </div>
            </div>

            {/* Feature 2 — reversed: narrow left, wide right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div
                className="p-8 md:order-1"
                style={{
                  borderTop: '1px solid rgba(212,175,55,0.15)',
                  backgroundColor: 'var(--color-bg-surface)',
                  marginRight: 'auto',
                }}
              >
                <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 12 }}>🜂</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                  Personality · Career · Wealth · Relationships
                  <br />
                  Multiple dimensions of destiny analysis.
                </p>
              </div>
              <div className="md:order-2">
                <h3
                  className="font-display font-bold mb-4"
                  style={{
                    fontSize: '1.5rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-serif)',
                  }}
                >
                  AI Deep Interpretation
                </h3>
                <p
                  className="leading-[1.9]"
                  style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}
                >
                  An AI astrologer analyzes your Bazi chart across multiple dimensions — personality, career, wealth, relationships, and more.
                </p>
              </div>
            </div>

            {/* Feature 3 — full width */}
            <div
              className="p-10 md:p-14"
              style={{
                borderTop: '1px solid rgba(212,175,55,0.15)',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:gap-12">
                <div>
                  <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 12 }}>🜄</div>
                  <h3
                    className="font-display font-bold"
                    style={{
                      fontSize: '1.5rem',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-serif)',
                    }}
                  >
                    Complete Destiny Book
                  </h3>
                </div>
                <p
                  className="md:flex-1 mt-4 md:mt-0 leading-[1.9]"
                  style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}
                >
                  Generate a beautifully formatted PDF Destiny Book report with Great Fortune cycles, annual luck analysis, and open-luck guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Life Tools — minimal list layout, no cards ── */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              LIFE TOOLS
            </span>
          </div>

          <h2
            className="font-display font-bold mb-16"
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

          {/* List layout instead of card grid */}
          <div className="space-y-0">
            {[
              { href: '/diet', icon: '🍜', title: 'Diet Guide', desc: 'Five Elements diet recommendations based on seasonal energy.' },
              { href: '/colors', icon: '🎨', title: 'Color Match', desc: 'Find the colors that harmonize with your Five Elements energy.' },
              { href: '/exercise', icon: '🏃', title: 'Exercise', desc: 'Mind-body exercises matched to your elemental profile.' },
              { href: '/direction', icon: '🧭', title: 'Direction', desc: 'Feng Shui directions for your living and working space.' },
              { href: '/luck', icon: '🍀', title: 'Luck Boost', desc: 'Daily lucky colors, numbers, directions, and wealth items.' },
              { href: '/compatibility', icon: '💑', title: 'Compatibility', desc: 'Five Elements compatibility between two people or energies.' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-6 py-7 block"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <span
                  className="flex-shrink-0 mt-0.5"
                  style={{ fontSize: '1.25rem', color: 'var(--color-primary)', opacity: 0.7 }}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="font-display font-semibold transition-colors"
                      style={{
                        fontSize: '1.0625rem',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-family-serif)',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="text-lg transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      →
                    </span>
                  </div>
                  <p
                    className="leading-[1.8]"
                    style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}
                  >
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <LiveStats />

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-8">
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
      </div>

      {/* ── Pricing — minimal, no cards, text-first ── */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              PRICING
            </span>
          </div>

          <h2
            className="font-display font-bold mb-4"
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

          {/* Pricing rows */}
          <div className="mt-16 space-y-0">
            {/* Free */}
            <div
              className="flex flex-col md:flex-row md:items-center md:gap-12 py-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-baseline gap-3 mb-4 md:mb-0">
                <span
                  className="font-display font-bold"
                  style={{ fontSize: '2rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-serif)' }}
                >
                  Free
                </span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span>✓ Basic Bazi chart</span>
                <span>✓ Four Pillars overview</span>
                <span>✓ AI element analysis</span>
              </div>
              <Link
                href="/bazi"
                className="mt-4 md:mt-0 whitespace-nowrap text-sm font-semibold"
                style={{
                  color: 'var(--color-primary)',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                  paddingBottom: 2,
                }}
              >
                Get Started →
              </Link>
            </div>

            {/* Pro Monthly */}
            <div
              className="flex flex-col md:flex-row md:items-center md:gap-12 py-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-baseline gap-3 mb-4 md:mb-0">
                <span
                  className="font-display font-bold"
                  style={{ fontSize: '2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-family-serif)' }}
                >
                  $9.99
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>/month</span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span>✓ Everything in Free</span>
                <span>✓ Full AI deep interpretation</span>
                <span>✓ Complete Destiny Book (PDF)</span>
                <span>✓ Great Fortune & Annual Luck</span>
                <span>✓ Open Luck guidance</span>
              </div>
              <Link
                href="/payment?plan=pro"
                className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold"
                style={{
                  color: 'var(--color-primary)',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                  paddingBottom: 2,
                }}
              >
                Get Destiny Book →
              </Link>
            </div>

            {/* Pro Yearly */}
            <div
              className="flex flex-col md:flex-row md:items-center md:gap-12 py-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-baseline gap-3 mb-4 md:mb-0">
                <span
                  className="font-display font-bold"
                  style={{ fontSize: '2rem', color: 'var(--color-primary)', fontFamily: 'var(--font-family-serif)' }}
                >
                  $79.99
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>/year</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-primary)', background: 'var(--color-primary-alpha-10)', padding: '2px 8px' }}
                >
                  Save 34%
                </span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span>✓ Everything in Free</span>
                <span>✓ Full AI deep interpretation</span>
                <span>✓ Complete Destiny Book (PDF)</span>
                <span>✓ Great Fortune & Annual Luck</span>
                <span>✓ Open Luck guidance</span>
              </div>
              <Link
                href="/payment?plan=pro-yearly"
                className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold"
                style={{
                  color: 'var(--color-primary)',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                  paddingBottom: 2,
                }}
              >
                Get Destiny Book →
              </Link>
            </div>
          </div>

          <p className="mt-12 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Secure payment via Gumroad & Paddle · 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ── Why FateWise ── */}
      <section className="py-32 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
              WHY FATEWISE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'Precise Charting', desc: 'True solar time correction + accurate solar term data ensures 100% chart accuracy' },
              { title: 'AI Deep Interpretation', desc: 'An AI astrologer rooted in ancient wisdom, providing professional and profound destiny readings' },
              { title: 'Privacy & Security', desc: 'All data processing happens locally — your birth information never leaves your device' },
            ].map(item => (
              <div key={item.title}>
                <h3
                  className="font-display font-semibold mb-3"
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-serif)',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-[1.9]"
                  style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — minimal ── */}
      <section className="py-32 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="font-display font-bold mb-6"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            Ready to Explore
            <br />
            Your Destiny?
          </h2>
          <p
            className="mb-10 leading-[1.9]"
            style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}
          >
            Enter your birth information and receive your personalized Bazi chart
            <br />
            and AI interpretation instantly.
          </p>
          <Link
            href="/bazi"
            className="inline-flex items-center gap-2 text-base font-semibold"
            style={{
              padding: '14px 36px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              boxShadow: '0 0 24px rgba(212,175,55,0.15)',
            }}
          >
            Start Free Chart Reading
          </Link>
        </div>
      </section>

      {/* ── Footer compliance ── */}
      <section className="pb-16 px-8">
        <div className="max-w-3xl mx-auto">
          <div
            className="p-6"
            style={{
              borderTop: '1px solid rgba(212,175,55,0.15)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>FateWise</span> (operated as{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>BornChart</span>) is an AI-powered Chinese astrology platform that generates personalized Bazi (Four Pillars of Destiny) charts, provides in-depth AI interpretation across personality, career, wealth, and relationships, and delivers beautifully formatted Destiny Book PDF reports with Great Fortune cycles and annual luck analysis.
          </div>
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
    <section className="py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="tracking-wide uppercase text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            📊 Live Stats
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            { val: stats.today, label: 'charts generated today' },
            { val: stats.uniqueIps, label: 'active users this week' },
            { val: stats.total, label: 'total charts generated' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div
                className="font-display font-bold"
                style={{
                  fontSize: '2rem',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-family-serif)',
                }}
              >
                {item.val}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
