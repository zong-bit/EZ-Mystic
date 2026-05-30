import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — FateWise',
  description: 'FateWise (BornChart) Terms of Service — terms governing your use of our Bazi chart and AI destiny reading platform.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service — FateWise',
    description: 'Terms governing your use of FateWise Bazi chart and AI destiny reading services.',
    url: 'https://bornchart.app/terms',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ Terms of Service ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            Terms of Service
          </h1>
          <p className="text-text-secondary text-sm">Last updated: May 19, 2026</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise is operated by <strong>ZONG XINWEI (宗馨薇)</strong>, a sole proprietor. By accessing or using FateWise (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) at bornchart.app, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use the Service.
            </p>
            <p className="text-text-secondary leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">2. Description of Service</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise provides an online platform for Bazi (Four Pillars of Destiny) chart calculation, AI-powered interpretation, and personalized destiny report generation. Our services include:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>Free basic Bazi chart calculation based on true solar time</li>
              <li>AI-powered deep interpretation using Large Language Models</li>
              <li>Destiny Book PDF report generation (paid feature)</li>
              <li>AI chat consultation regarding your chart</li>
              <li>Educational content about Chinese astrology and Eastern wisdom</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">3. User Responsibilities</h2>
            <p className="text-text-secondary leading-relaxed mb-3">As a user of FateWise, you agree to:</p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>Provide accurate birth information (date, time, location) for chart calculation</li>
              <li>Use the Service for personal, non-commercial purposes only</li>
              <li>Not attempt to reverse-engineer, abuse, or disrupt the Service</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">4. Intellectual Property</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              The Service, including but not limited to its code, design, content, algorithms, generated reports, and branding, is owned by FateWise and is protected by applicable intellectual property laws.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              The Bazi chart algorithm, AI interpretation logic, Destiny Book templates, and all original content (unless explicitly marked otherwise) are proprietary to FateWise.
            </p>
            <p className="text-text-secondary leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works from, or publicly display any part of the Service without our prior written consent.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">5. Payments and Subscriptions</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Paid features (Pro monthly and yearly subscriptions) are processed through our payment partners, including Paddle. By purchasing, you agree to their terms of service as well.
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>Pro plan: $9.99/month, renews automatically until cancelled</li>
              <li>Pro Yearly plan: $79.99/year, renews annually</li>
              <li>All prices are in US Dollars and may be subject to applicable taxes</li>
              <li>You can cancel your subscription at any time from your account dashboard</li>
              <li>Refunds are handled according to our Refund Policy</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">6. Limitation of Liability</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise is an entertainment and educational service. Bazi readings, AI interpretations, and all content provided are for <strong>entertainment and educational purposes only</strong>. They should not be considered as professional advice for medical, legal, financial, or any other life decisions.
            </p>
            <p className="text-text-secondary leading-relaxed mb-3">
              In no event shall FateWise, its owners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such cases, our liability shall be limited to the maximum extent permitted by law.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">7. Termination</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              We reserve the right to suspend or terminate your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, third parties, or our business interests.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Upon termination, your right to use the Service will immediately cease. Sections regarding intellectual property, limitation of liability, and governing law shall survive termination.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">8. Governing Law</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              These Terms shall be governed by and construed in accordance with the laws of Hong Kong SAR, without regard to its conflict of law provisions.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Any disputes arising from these Terms shall be resolved through amicable negotiation. If negotiation fails, the dispute shall be submitted to the competent courts of Hong Kong SAR.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">9. Contact</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-text-secondary leading-relaxed mb-2">
              <strong>Operator:</strong> ZONG XINWEI (宗馨薇) (Sole Proprietor)
            </p>
            <p className="text-text-secondary leading-relaxed mb-2">
              <strong>Email:</strong> <span className="text-gold-primary">support@bornchart.app</span>
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>Website:</strong> <span className="text-gold-primary">https://bornchart.app</span>
            </p>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm text-text-tertiary">
              FateWise is independently operated by ZONG XINWEI (宗馨薇), a sole proprietor. By using this Service, you are contracting with an individual sole proprietor operating under the brand name FateWise and BornChart.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
