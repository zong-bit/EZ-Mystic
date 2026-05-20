'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
              The fastest way to reach us is by email. We typically respond within 24 hours.
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Email:</strong>{' '}
              <a href="mailto:support@bornchart.app" className="text-gold-primary hover:underline">
                support@bornchart.app
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
                <a href="mailto:support@bornchart.app" className="text-gold-primary text-sm hover:underline">support@bornchart.app</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Technical Issues</h3>
                <p className="text-text-tertiary text-sm mb-2">Bugs, errors, or feature requests:</p>
                <a href="mailto:support@bornchart.app" className="text-gold-primary text-sm hover:underline">support@bornchart.app</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">Business Inquiries</h3>
                <p className="text-text-tertiary text-sm mb-2">Partnerships, collaborations, or press:</p>
                <a href="mailto:support@bornchart.app" className="text-gold-primary text-sm hover:underline">support@bornchart.app</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">FAQ</h3>
                <p className="text-text-tertiary text-sm mb-2">Find quick answers in our docs:</p>
                <Link href="/blog" className="text-gold-primary text-sm hover:underline">Browse Blog →</Link>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Send a Message</h2>
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-gold-primary text-4xl mb-4 block">✦</span>
                <p className="text-text-primary font-display text-lg mb-2">Message Sent!</p>
                <p className="text-text-secondary text-sm">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-gold-primary text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                action="mailto:support@bornchart.app"
                method="POST"
                encType="text/plain"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="name" className="block text-sm text-text-secondary mb-1.5">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-gold-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-gold-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm text-text-secondary mb-1.5">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-gold-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm text-text-secondary mb-1.5">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-gold-primary/50 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
