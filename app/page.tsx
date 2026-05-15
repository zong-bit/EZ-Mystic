'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
            <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bazi" className="text-text-secondary hover:text-gold-primary transition-colors text-sm">
              Bazi Chart
            </Link>
            <Link href="/bazi" className="btn-primary text-sm" style={{ padding: '8px 20px', fontSize: '14px' }}>
              Begin Your Journey →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 starry-bg opacity-50" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-gold-primary text-lg font-display tracking-widest">✦ Eastern Wisdom × AI Innovation ✦</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight text-gold-glow">
            Discover Your
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-gold-light to-gold-primary bg-clip-text text-transparent">
              Destiny Code
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Precise Bazi Charting · AI Deep Interpretation · Complete Destiny Book
            <br />
            <span className="text-text-tertiary text-base">Millennia of Eastern wisdom, revealed by artificial intelligence</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bazi" className="btn-primary glow-pulse text-lg px-10 py-4">
              ✨ Free Chart Reading
            </Link>
            <Link href="/bazi" className="glass px-8 py-4 text-text-secondary hover:text-text-primary transition-colors text-lg">
              Learn More →
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

      {/* Why FateWise */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
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
          <p className="text-text-muted text-xs">
            Disclaimer: The content on this website is for entertainment and educational purposes only and does not constitute advice for life decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
