'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (currentPage) return currentPage === path;
    return pathname === path;
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/bazi', label: 'Bazi Chart' },
    { href: '/chat', label: 'Chat' },
    { href: '/blog', label: 'Blog' },
    { href: '/zen', label: 'Zen' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const legalLinks = [
    { href: '/terms', label: 'Terms' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/refund', label: 'Refund' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
          <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
              {link.label}
            </Link>
          ))}
          <span className="text-text-tertiary/20 text-xs">|</span>
          {legalLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">Dashboard</Link>
              <Link href="/account" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">Account</Link>
              <button onClick={signOut} className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
                {user.user_metadata?.name || 'Sign Out'}
              </button>
            </>
          ) : (
            <Link href="/signup" className="btn-primary text-sm" style={{ padding: '8px 20px', fontSize: '14px' }}>
              Begin Your Journey →
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-bg-primary/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`block py-3 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="px-4 py-1 text-xs text-text-tertiary uppercase tracking-wider">Legal</p>
              {legalLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
            {user ? (
              <div className="border-t border-white/5 pt-2 mt-2">
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">Dashboard</Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }}
                  className="block w-full text-left py-3 px-4 rounded-lg text-sm text-red-400 hover:bg-red-500/5">Sign Out</button>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-2 mt-2">
                <Link href="/signup" onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg text-sm text-center btn-primary">
                  Begin Your Journey →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
