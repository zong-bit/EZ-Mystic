import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold-primary text-lg">✦</span>
              <span className="font-display font-semibold text-text-primary text-lg">FateWise</span>
            </div>
            <p className="text-text-tertiary text-sm leading-relaxed">
              AI-powered Chinese astrology platform. Discover your destiny through BaZi chart analysis.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/bazi" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Bazi Chart
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <a href="mailto:support@bornchart.app" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  support@bornchart.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
          <p>
            © {new Date().getFullYear()} BornChart · FateWise. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary/60 text-center md:text-right max-w-md">
            Disclaimer: The content on this website is for entertainment and educational purposes only and does not constitute professional advice for life decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
