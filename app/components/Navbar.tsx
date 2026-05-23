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
  const [toolsOpen, setToolsOpen] = useState(false);

  const isActive = (path: string) => {
    if (currentPage) return currentPage === path;
    return pathname === path;
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/bazi', label: 'Bazi Chart' },
    { href: '/daily', label: 'Daily' },
    { href: '/chat', label: 'Chat' },
    { href: '/blog', label: 'Blog' },
    { href: '/zen', label: 'Zen' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact' },
  ];

  const toolsLinks = [
    { href: '/diet', label: 'Diet Guide' },
    { href: '/colors', label: 'Color Match' },
    { href: '/exercise', label: 'Exercise' },
    { href: '/direction', label: 'Direction' },
    { href: '/luck', label: 'Luck Boost' },
    { href: '/compatibility', label: 'Compatibility' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
          <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 relative">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
              {link.label}
            </Link>
          ))}
          {/* Tools dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`text-sm transition-colors flex items-center gap-1 ${
                toolsOpen ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Tools
              <svg className="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: toolsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 glass-card py-2 z-50">
                {toolsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setToolsOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      isActive(link.href)
                        ? 'text-gold-primary bg-gold-primary/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
            {/* Tools links in mobile */}
            <div className="border-t border-white/5 pt-2 mt-2">
              <div className="px-3 py-1 text-xs font-semibold text-gold-primary uppercase tracking-wider">Five Elements Tools</div>
              {toolsLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
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
