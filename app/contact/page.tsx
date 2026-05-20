import Link from 'next/link';

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ Contact ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            Contact Us
          </h1>
          <p className="text-text-secondary text-base max-w-xl mx-auto">
            Have a question, feedback, or need help? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Email card */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Email Support</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              The fastest way to reach us is by email. We&apos;ll respond within 24 hours.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Send us a message</strong> —{' '}
              <a href="mailto:selina_zxw@qq.com" className="text-gold-primary hover:underline">
                selina_zxw@qq.com
              </a>
            </p>
          </div>

          {/* Quick links */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Billing &amp; Subscriptions</h3>
                <p className="text-text-tertiary text-sm mb-2">For payment, refund, or account questions:</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">Contact us →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Technical Issues</h3>
                <p className="text-text-tertiary text-sm mb-2">Bugs, errors, or feature requests:</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">Contact us →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Business Inquiries</h3>
                <p className="text-text-tertiary text-sm mb-2">Partnerships, collaborations, or press:</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">Contact us →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">FAQ</h3>
                <p className="text-text-tertiary text-sm mb-2">Find quick answers in our docs:</p>
                <Link href="/blog" className="text-gold-primary text-sm hover:underline">Browse Blog →</Link>
              </div>
            </div>
          </div>

          {/* Contact form - direct email link (no backend email API available) */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Send a Message</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Click the button below to send us an email directly from your email client.
            </p>
            <div className="flex flex-col items-center gap-6 py-4">
              <a
                href="mailto:selina_zxw@qq.com"
                className="btn-primary inline-flex items-center gap-2"
                style={{ padding: '14px 40px', fontSize: '16px' }}
              >
                ✦ Send us an Email
              </a>
              <p className="text-text-tertiary text-sm">
                Or write to: <a href="mailto:selina_zxw@qq.com" className="text-gold-primary hover:underline">selina_zxw@qq.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
