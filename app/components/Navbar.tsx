'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../auth/auth-context';
import LangSwitch from './LangSwitch';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [divinationOpen, setDivinationOpen] = useState(false);
  const [lifeOpen, setLifeOpen] = useState(false);
  const isChinese = pathname.startsWith('/zh');

  const isActive = (path: string) => {
    if (currentPage) return currentPage === path;
    return pathname === path;
  };

  // ── 左半区：核心链接 ──
  const coreLinks = isChinese
    ? [
        { href: '/zh', label: '首页' },
        { href: '/zh/bazi', label: '八字命盘' },
        { href: '/zh/bagua', label: '🔮 八卦起卦' },
        { href: '/zh/chat', label: 'AI 咨询' },
        { href: '/zh/daily', label: '每日运势' },
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/bazi', label: 'Bazi Chart' },
        { href: '/bagua', label: '🔮 Bagua' },
        { href: '/chat', label: 'AI Chat' },
        { href: '/daily', label: 'Daily' },
      ];

  // ── 占卜 & 人际 ──
  const divinationTools = isChinese
    ? [
        { href: '/zh/bagua', label: '八卦起卦' },
        { href: '/zh/compatibility', label: '合婚匹配' },
        { href: '/zh/luck', label: '运势提升' },
      ]
    : [
        { href: '/bagua', label: 'Bagua Divination' },
        { href: '/compatibility', label: 'Compatibility' },
        { href: '/luck', label: 'Luck Boost' },
      ];

  // ── 生活 & 风水 ──
  const lifeTools = isChinese
    ? [
        { href: '/zh/diet', label: '饮食指南' },
        { href: '/zh/colors', label: '色彩匹配' },
        { href: '/zh/exercise', label: '运动指南' },
        { href: '/zh/direction', label: '方位指南' },
        { href: '/zh/zen', label: '禅意空间' },
      ]
    : [
        { href: '/diet', label: 'Diet Guide' },
        { href: '/colors', label: 'Color Match' },
        { href: '/exercise', label: 'Exercise' },
        { href: '/direction', label: 'Direction' },
        { href: '/zen', label: 'Zen Space' },
      ];

  // ── 右半区：次要链接 ──
  const secondaryLinks = isChinese
    ? [
        { href: '/zh/blog', label: '博客' },
        { href: '/zh/pricing', label: '定价' },
        { href: '/zh/contact', label: '联系' },
      ]
    : [
        { href: '/blog', label: 'Blog' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/contact', label: 'Contact' },
      ];

  const isDivinationActive = divinationTools.some(l => isActive(l.href));
  const isLifeActive = lifeTools.some(l => isActive(l.href));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(20px) saturate(180%)', background: 'rgba(18,18,26,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href={isChinese ? '/zh' : '/'} className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
          <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
        </Link>

        {/* Desktop nav — 左右分区 */}
        <div className="hidden md:flex items-center gap-2">
          {/* 左半区：核心功能 + 两类工具下拉 */}
          <div className="flex items-center gap-5 mr-6">
            {coreLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`text-sm nav-link-glow ${isActive(link.href) ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {link.label}
              </Link>
            ))}
            <div className="relative" onMouseEnter={() => setDivinationOpen(true)} onMouseLeave={() => setDivinationOpen(false)}>
              <button onClick={() => setDivinationOpen(!divinationOpen)}
                className={`text-sm nav-link-glow flex items-center gap-1 ${divinationOpen || isDivinationActive ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {isChinese ? '占卜 & 人际' : 'Divination'}
                <svg className="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: divinationOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {divinationOpen && (
                <div className="absolute top-full left-0 mt-2 glass-card py-2 z-50" style={{ minWidth: '180px' }}>
                  {divinationTools.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setDivinationOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" onMouseEnter={() => setLifeOpen(true)} onMouseLeave={() => setLifeOpen(false)}>
              <button onClick={() => setLifeOpen(!lifeOpen)}
                className={`text-sm nav-link-glow flex items-center gap-1 ${lifeOpen || isLifeActive ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {isChinese ? '生活 & 风水' : 'Lifestyle'}
                <svg className="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: lifeOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {lifeOpen && (
                <div className="absolute top-full left-0 mt-2 glass-card py-2 z-50" style={{ minWidth: '180px' }}>
                  {lifeTools.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setLifeOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 竖线分隔 */}
          <div className="h-5 w-px bg-white/10 mr-5" />

          {/* 右半区：次要链接 + 语言 + CTA */}
          <div className="flex items-center gap-4">
            {secondaryLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`text-sm nav-link-glow ${isActive(link.href) ? 'text-gold-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {link.label}
              </Link>
            ))}
            <LangSwitch />
            {user ? (
              <>
                <Link href={isChinese ? '/zh/dashboard' : '/dashboard'} className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
                  {isChinese ? '仪表盘' : 'Dashboard'}
                </Link>
                <button onClick={signOut} className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
                  {user.user_metadata?.name || (isChinese ? '退出' : 'Sign Out')}
                </button>
              </>
            ) : (
              <Link href={isChinese ? '/zh/signup' : '/signup'} className="btn-primary text-sm" style={{ padding: '8px 20px', fontSize: '14px' }}>
                {isChinese ? '免费排盘 →' : 'Get Free Chart →'}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary transition-colors glass"
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
        <div className="md:hidden border-t border-white/5" style={{ background: 'rgba(18,18,26,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
          <div className="px-4 py-4 space-y-2">
            {coreLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`block py-3 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-2 mt-2">
              <div className="px-3 py-1 text-xs font-semibold text-gold-primary uppercase tracking-wider">
                {isChinese ? '占卜 & 人际' : 'Divination & Relations'}
              </div>
              {divinationTools.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                  {link.label}
                </Link>
              ))}
              <div className="my-2 mx-3 border-t border-white/5" />
              <div className="px-3 py-1 text-xs font-semibold text-gold-primary uppercase tracking-wider">
                {isChinese ? '生活 & 风水' : 'Lifestyle & Feng Shui'}
              </div>
              {lifeTools.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/5 pt-2 mt-2">
              {secondaryLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg text-sm transition-colors ${isActive(link.href) ? 'text-gold-primary bg-gold-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
                  {link.label}
                </Link>
              ))}
              <div className="flex justify-center py-2">
                <LangSwitch />
              </div>
            </div>
            {user ? (
              <div className="border-t border-white/5 pt-2 mt-2">
                <Link href={isChinese ? '/zh/dashboard' : '/dashboard'} onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5">
                  {isChinese ? '仪表盘' : 'Dashboard'}
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }}
                  className="block w-full text-left py-3 px-4 rounded-lg text-sm text-red-400 hover:bg-red-500/5">
                  {isChinese ? '退出登录' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="border-t border-white/5 pt-2 mt-2">
                <Link href={isChinese ? '/zh/signup' : '/signup'} onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 rounded-lg text-sm text-center btn-primary">
                  {isChinese ? '免费排盘 →' : 'Get Free Chart →'}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
