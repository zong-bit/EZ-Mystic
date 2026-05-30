import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy — FateWise',
  description: 'FateWise (BornChart) Refund Policy — 14-day money-back guarantee on all paid plans.',
  alternates: {
    canonical: '/refund',
  },
  openGraph: {
    title: 'Refund Policy — FateWise',
    description: '14-day money-back guarantee on all FateWise paid plans.',
    url: 'https://bornchart.app/refund',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ Refund Policy ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            Refund Policy
          </h1>
          <p className="text-text-secondary text-sm">Last updated: May 19, 2026</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">14-Day Money-Back Guarantee</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              We stand behind the quality of our service. If you are not satisfied with your FateWise purchase for any reason, we offer a <strong>14-day money-back guarantee</strong> on all paid plans.
            </p>
            <p className="text-text-secondary leading-relaxed">
              This means you have 14 calendar days from the date of purchase to request a full refund, no questions asked.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">What Qualifies for a Refund</h2>
            <ul className="text-text-secondary text-sm space-y-3 list-disc pl-5">
              <li>
                <strong>Pro Monthly Subscription:</strong> Full refund if requested within 14 days of purchase. If you cancel after 14 days, you will retain access until the end of the current billing period, but no refund will be issued for the current period.
              </li>
              <li>
                <strong>Premium Lifetime Access:</strong> Full refund if requested within 14 days of purchase.
              </li>
              <li>
                <strong>Free Service:</strong> The free Bazi chart and basic features are provided at no cost, so no refund applies.
              </li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">What Does Not Qualify</h2>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>Requests made more than 14 days after the purchase date</li>
              <li>Subscriptions cancelled after the 14-day refund window (access continues until end of billing period)</li>
              <li>Partial refunds for partially used billing periods (beyond the 14-day window)</li>
              <li>Refunds for services provided at no cost</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">How to Request a Refund</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Requesting a refund is simple:
            </p>
            <ol className="text-text-secondary text-sm space-y-3 list-decimal pl-5">
              <li>Email us at <span className="text-gold-primary">support@bornchart.app</span> with the subject line &ldquo;Refund Request&rdquo;</li>
              <li>Include the email address used for your purchase</li>
              <li>Optionally, let us know why you are requesting a refund (this helps us improve, but is not required)</li>
            </ol>
            <p className="text-text-secondary leading-relaxed mt-4">
              You may also manage your subscription and request cancellations through your account dashboard.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Processing Time</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Once we receive your refund request:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>We will acknowledge receipt within 1-2 business days</li>
              <li>Refunds are processed within 5-10 business days</li>
              <li>The refund will be issued to the original payment method</li>
              <li>You will receive a confirmation email once the refund has been processed</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              Please note that processing times may vary depending on your payment provider and financial institution.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Cancellation</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              You can cancel your Pro monthly subscription at any time from your account dashboard. Upon cancellation:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>You will retain access to Pro features until the end of your current billing period</li>
              <li>Your subscription will not renew</li>
              <li>No further charges will be made</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Contact</h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions about our Refund Policy, please contact us at{' '}
              <span className="text-gold-primary">support@bornchart.app</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
