import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — FateWise',
  description: 'FateWise (BornChart) Privacy Policy — how we collect, use, store, and protect your personal data when using our Bazi chart and AI destiny reading platform.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — FateWise',
    description: 'How FateWise collects, uses, and protects your personal data.',
    url: 'https://bornchart.app/privacy',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ Privacy Policy ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            Privacy Policy
          </h1>
          <p className="text-text-secondary text-sm">Last updated: May 19, 2026</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">1. Information We Collect</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              When you use FateWise, we collect the following information:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>Account Information:</strong> Email address and name (if you create an account)</li>
              <li><strong>Birth Data:</strong> Date of birth, exact birth time, and birth location — necessary for accurate Bazi chart calculation using true solar time correction</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, and interactions with the AI chat service</li>
              <li><strong>Payment Data:</strong> Payment processing is handled entirely by Paddle. We do not store credit card numbers or billing details on our servers</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">2. How We Use Your Information</h2>
            <p className="text-text-secondary leading-relaxed mb-3">We use the information we collect for the following purposes:</p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>To calculate your Bazi chart using true solar time correction</li>
              <li>To generate AI-powered interpretations and Destiny Book PDF reports</li>
              <li>To provide and maintain your account</li>
              <li>To process payments and manage subscriptions</li>
              <li>To improve our service and user experience</li>
              <li>To communicate with you about your account and service updates</li>
              <li>To detect, prevent, and address technical issues or abuse</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">3. Data Storage and Security</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>Database:</strong> We use Supabase, a secure cloud database with encryption at rest and in transit</li>
              <li><strong>Authentication:</strong> User authentication is managed through Supabase Auth</li>
              <li><strong>Data Retention:</strong> We retain your data as long as your account is active. You may request deletion at any time</li>
              <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL</li>
              <li><strong>Access Control:</strong> We implement strict access controls to ensure only authorized systems and personnel can access your data</li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">4. Third-Party Services</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise uses the following third-party services, each with their own privacy policies:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>DeepSeek API:</strong> Used for AI-powered Bazi interpretation and chat. Your chart data and conversation messages are sent to DeepSeek for processing. 
                <a href="https://platform.deepseek.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">DeepSeek Privacy Policy</a>
              </li>
              <li>
                <strong>Supabase:</strong> Used for database storage and user authentication. 
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Supabase Privacy Policy</a>
              </li>
              <li>
                <strong>Paddle:</strong> Our payment processor. Paddle handles all payment transactions and does not share your full financial details with us. 
                <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Paddle Privacy Policy</a>
              </li>
              <li>
                <strong>Vercel:</strong> Hosting provider for the FateWise website.
                <a href="https://vercel.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline ml-1">Vercel Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">5. Cookies</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              FateWise uses minimal cookies for essential functionality only:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>Session cookies:</strong> Required for user authentication and login state</li>
              <li><strong>No tracking cookies:</strong> We do not use analytics, advertising, or tracking cookies</li>
              <li><strong>No third-party cookies:</strong> We do not permit third-party cookies on our platform</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              You can control cookie preferences through your browser settings. However, disabling essential cookies may affect your ability to use certain features of the Service.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">6. Your Rights</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the following rights regarding your personal data:
            </p>
            <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time without affecting the lawfulness of processing based on consent before its withdrawal</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mt-3 text-sm">
              To exercise any of these rights, please contact us at <span className="text-gold-primary">support@bornchart.app</span>. We will respond to your request within 30 days.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">7. Data Transfers</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              Your data may be processed in countries where our servers or third-party service providers are located. We ensure that appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
            </p>
            <p className="text-text-secondary leading-relaxed">
              By using FateWise, you consent to the transfer of your information to countries outside your country of residence, including but not limited to the United States and Hong Kong SAR.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">8. Changes to This Policy</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
            </p>
            <p className="text-text-secondary leading-relaxed">
              We encourage you to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">9. Contact</h2>
            <p className="text-text-secondary leading-relaxed mb-3">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-text-secondary leading-relaxed">
              Email: <span className="text-gold-primary">support@bornchart.app</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
