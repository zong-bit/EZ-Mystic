'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (currentPage) {
      return currentPage === path;
    }
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
          <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm transition-colors ${
              isActive('/') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Home
          </Link>
          <Link
            href="/bazi"
            className={`text-sm transition-colors ${
              isActive('/bazi') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Bazi Chart
          </Link>
          <Link
            href="/chat"
            className={`text-sm transition-colors ${
              isActive('/chat') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Chat
          </Link>
          <Link
            href="/blog"
            className={`text-sm transition-colors ${
              isActive('/blog') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Blog
          </Link>
          <Link
            href="/zen"
            className={`text-sm transition-colors ${
              isActive('/zen') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Zen
          </Link>
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              isActive('/pricing') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm transition-colors ${
                  isActive('/dashboard') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/account"
                className={`text-sm transition-colors ${
                  isActive('/account') ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                Account
              </Link>
              {user.user_metadata?.name ? (
                <button
                  onClick={signOut}
                  className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {user.user_metadata.name}
                </button>
              ) : (
                <button
                  onClick={signOut}
                  className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Sign Out
                </button>
              )}
            </>
          ) : (
            <Link
              href="/signup"
              className="btn-primary text-sm"
              style={{ padding: '8px 20px', fontSize: '14px' }}
            >
              Begin Your Journey →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
