import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About FateWise — AI + Chinese Bazi Destiny Analysis',
  description:
    'FateWise combines millennia of Chinese Bazi wisdom with modern AI to deliver precise, personalized destiny analysis. Learn about our mission, team, and the technology behind your chart.',
  alternates: { canonical: 'https://bornchart.app/about' },
  openGraph: {
    title: 'About FateWise',
    description: 'AI-powered Chinese Bazi destiny analysis rooted in 6,000 years of Eastern wisdom.',
    url: 'https://bornchart.app/about',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About FateWise',
    description: 'AI-powered Chinese Bazi destiny analysis rooted in 6,000 years of Eastern wisdom.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-primary/3 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs text-gold-primary font-semibold uppercase tracking-widest bg-gold-primary/10 px-3 py-1 rounded-full">
            Our Story
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl mt-6 mb-6 text-gold-glow leading-tight">
            Ancient Wisdom, Modern Intelligence
          </h1>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            FateWise was born from a simple belief: <span className="text-text-primary font-medium">6,000 years of Chinese destiny wisdom should be accessible to everyone</span>, not locked behind expensive readings or language barriers.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-6 gold-divider pb-2">
              Our Mission
            </h2>
            <div className="text-text-primary text-sm leading-relaxed space-y-4">
              <p>
                Chinese Bazi (八字) — the Four Pillars of Destiny — is one of the most sophisticated systems of self-analysis ever created. It maps the interplay of elemental forces at the moment of your birth to reveal your innate strengths, relationship patterns, career timing, and life cycles.
              </p>
              <p>
                But for centuries, accurate Bazi analysis has required years of study, a skilled practitioner, and often a significant fee. <span className="text-gold-primary font-medium">FateWise changes that.</span>
              </p>
              <p>
                We combine <span className="text-text-primary">precise astronomical calculations</span> (including true solar time correction) with <span className="text-text-primary">advanced AI interpretation</span> to deliver personalized destiny analysis that is both accurate and accessible. Our goal is not to replace human masters, but to make the foundational knowledge available to anyone, anywhere, at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-gold-primary mb-8 text-center gold-divider pb-2">
            How FateWise Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">01</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">True Solar Time</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We correct your birth time using your exact GPS coordinates to calculate true solar time — the foundation of accurate Bazi.
              </p>
            </div>
            {/* Step 2 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">02</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">Four Pillars Calculation</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your birth year, month, day, and hour are converted into the Eight Characters (八字) using the traditional Heavenly Stems and Earthly Branches system.
              </p>
            </div>
            {/* Step 3 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">03</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">AI Interpretation</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI analyzes your chart against millennia of classical Bazi theory — Five Elements, Ten Gods, Luck Pillars — to generate your personalized reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-6 gold-divider pb-2">
              The Team
            </h2>
            <div className="text-text-primary text-sm leading-relaxed space-y-4">
              <p>
                FateWise is built by a small team of engineers, data scientists, and Chinese metaphysics researchers who share a passion for bridging Eastern and Western knowledge systems.
              </p>
              <p>
                Our team includes practitioners of traditional Bazi study who ensure the theoretical foundation is sound, and AI engineers who bring modern computational power to bear on centuries-old interpretive frameworks. The result is a tool that respects tradition while embracing innovation.
              </p>
              <p>
                We believe that technology should democratize access to wisdom, not replace the human judgment that has always been essential to destiny analysis. FateWise is a starting point — an invitation to explore one of humanity's greatest systems of self-understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-gold-primary mb-8 text-center gold-divider pb-2">
            Our Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">Accuracy First</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Every chart calculation is verified against classical astronomical algorithms. True solar time correction ensures your chart reflects the actual sky at your birthplace.
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">Respect for Tradition</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Our AI models are trained on classical Bazi texts and validated by experienced practitioners. We honor the tradition while making it accessible.
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">Transparency</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                We explain the reasoning behind interpretations. Your chart is not a black box — every insight is traceable to classical Bazi principles.
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">Empowerment</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Our goal is not dependency, but self-understanding. We provide the tools for you to learn Bazi yourself and grow your practice over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-10 text-center">
            <h3 className="font-display text-lg font-bold text-gold-primary mb-3">
              Ready to explore your destiny?
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Get your free Bazi chart and discover the Four Pillars written at your birth.
            </p>
            <Link href="/bazi" className="btn-primary text-base px-10 py-3 inline-block">
              ✨ Get Your Free Bazi Chart
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold-primary text-lg">✦</span>
            <span className="font-display font-semibold text-text-primary">FateWise</span>
          </div>
          <p className="text-text-tertiary text-sm mb-2">
            © 2026 BornChart · FateWise. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Disclaimer: The content on this website is for entertainment and educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
