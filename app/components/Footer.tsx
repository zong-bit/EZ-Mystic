import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-gold-primary text-lg">✦</span>
          <span className="font-display font-semibold text-text-primary">FateWise</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
          <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors">
            Terms of Service
          </Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors">
            Privacy Policy
          </Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors">
            Refund Policy
          </Link>
        </div>

        <p className="text-text-tertiary text-sm mb-2">
          © 2026 BornChart · FateWise. All rights reserved.
        </p>
        <p className="text-text-tertiary/50 text-xs max-w-lg mx-auto">
          Disclaimer: The content on this website is for entertainment and educational purposes only and does not constitute professional advice for life decisions.
        </p>
      </div>
    </footer>
  );
}
