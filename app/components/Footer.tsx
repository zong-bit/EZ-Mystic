'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isChinese = pathname.startsWith('/zh');

  const t = (zh: string, en: string) => isChinese ? zh : en;

  const links = isChinese ? {
    home: '/zh',
    bazi: '/zh/bazi',
    bagua: '/zh/bagua',
    pricing: '/zh/pricing',
    blog: '/zh/blog',
    terms: '/zh/terms',
    privacy: '/zh/privacy',
    refund: '/zh/refund',
    contact: '/zh/contact',
  } : {
    home: '/',
    bazi: '/bazi',
    bagua: '/bagua',
    pricing: '/pricing',
    blog: '/blog',
    terms: '/terms',
    privacy: '/privacy',
    refund: '/refund',
    contact: '/contact',
  };

  return (
    <footer className="relative z-10 border-t border-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold-primary text-lg">✦</span>
              <span className="font-display font-semibold text-text-primary text-lg">FateWise</span>
            </div>
            <p className="text-text-tertiary text-sm leading-relaxed">
              {t('AI 驱动的中国占星术平台。通过八字命盘分析发现你的命运。', 'AI-powered Chinese astrology platform. Discover your destiny through BaZi chart analysis.')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">{t('产品', 'Product')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={links.home} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('首页', 'Home')}
                </Link>
              </li>
              <li>
                <Link href={links.bazi} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('八字命盘', 'Bazi Chart')}
                </Link>
              </li>
              <li>
                <Link href={links.bagua} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('八卦问卜', 'Bagua Divination')}
                </Link>
              </li>
              <li>
                <Link href={links.pricing} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('定价', 'Pricing')}
                </Link>
              </li>
              <li>
                <Link href={links.blog} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('博客', 'Blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">{t('法律', 'Legal')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={links.terms} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('服务条款', 'Terms of Service')}
                </Link>
              </li>
              <li>
                <Link href={links.privacy} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('隐私政策', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link href={links.refund} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('退款政策', 'Refund Policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">{t('支持', 'Support')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href={links.contact} className="text-text-tertiary hover:text-gold-primary transition-colors text-sm">
                  {t('联系我们', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-tertiary">
          <p>
            © {new Date().getFullYear()} BornChart · FateWise. {t('保留所有权利。', 'All rights reserved.')}
          </p>
          <p className="text-xs text-text-tertiary/60 text-center md:text-right max-w-md">
            {t('免责声明：本网站内容仅供娱乐和教育目的，不构成专业人生决策建议。', 'Disclaimer: The content on this website is for entertainment and educational purposes only and does not constitute professional advice for life decisions.')}
          </p>
        </div>
      </div>
    </footer>
  );
}
