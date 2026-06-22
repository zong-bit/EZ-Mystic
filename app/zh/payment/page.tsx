'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/wejaix';

// Paddle checkout URLs (update after creating in Paddle dashboard)
const PADDLE_CHECKOUT_PRO = 'https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b';
const PADDLE_CHECKOUT_PREMIUM = 'https://checkout.paddle.com/checkout/price/pri_01krwnhv91ve8zd3t49kd0bysb';

function PaymentContent() {
  const searchParams = useSearchParams();
  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const baziParam = baziData ? `&bazi=${encodeURIComponent(JSON.stringify(baziData))}` : '';
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : '';

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-2xl w-full page-enter">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gold-glow">选择您的方案</h1>
          <p className="text-text-secondary">完成购买以解锁命运之书</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pro Plan */}
          <div className="border border-gold-primary/30 rounded-lg p-6 flex flex-col bg-gold-primary/[0.04]">
            <div className="text-gold-primary text-sm uppercase tracking-wider mb-2">Pro</div>
            <div className="font-display text-4xl font-bold text-gold-primary mb-1">$9<span className="text-lg text-text-secondary">.99</span></div>
            <p className="text-text-tertiary text-xs mb-4">月度订阅</p>

            <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-grow">
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> AI 深度全面解读</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 完整命运之书 PDF</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 大运与年运</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 开运指南</li>
            </ul>

            <a
              href={GUMROAD_MONTHLY}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center py-3 mb-3"
            >
              通过 Gumroad 支付 →
            </a>
            <a
              href={PADDLE_CHECKOUT_PRO}
              target="_blank"
              rel="noopener noreferrer"
              className="glass w-full text-center py-3 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              通过 Paddle 支付 →
            </a>

            <div className="text-center">
              <Link
                href={`/payment/verify?plan=pro${baziParam}${nameParam}`}
                className="text-text-tertiary hover:text-gold-primary transition-colors text-xs"
              >
                我已付款 — 激活我的购买 →
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border border-gold-primary/30 rounded-lg p-6 flex flex-col bg-gold-primary/[0.04]">
            <div className="text-gold-primary text-sm uppercase tracking-wider mb-2">Premium</div>
            <div className="font-display text-4xl font-bold text-gold-primary mb-1">$29<span className="text-lg text-text-secondary">.99</span></div>
            <p className="text-text-tertiary text-xs mb-4">一次性支付</p>

            <ul className="text-sm text-text-secondary space-y-2 mb-6 flex-grow">
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 包含 Pro 版所有功能</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 年度运势报告</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 关系合盘</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 命盘风水基础</li>
              <li className="flex items-center gap-2"><span className="text-gold-primary">✓</span> 优先支持</li>
            </ul>

            <a
              href={GUMROAD_YEARLY}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center py-3 mb-3"
            >
              通过 Gumroad 支付 →
            </a>
            <a
              href={PADDLE_CHECKOUT_PREMIUM}
              target="_blank"
              rel="noopener noreferrer"
              className="glass w-full text-center py-3 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              通过 Paddle 支付 →
            </a>

            <div className="text-center">
              <Link
                href={`/payment/verify?plan=premium${baziParam}${nameParam}`}
                className="text-text-tertiary hover:text-gold-primary transition-colors text-xs"
              >
                我已付款 — 激活我的购买 →
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3 mb-6">
          {/* 14-day guarantee badge */}
          <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
            <span className="text-gold-primary text-lg">🛡</span>
            <span className="text-gold-primary text-sm font-semibold">14 天无理由退款保证</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
            <span>由 Gumroad 和 Paddle 提供支持</span>
            <span className="text-text-tertiary/30">·</span>
            <span>安全结账</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs">
            <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              服务条款
            </Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              隐私政策
            </Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
              退款政策
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/bazi" className="text-text-secondary hover:text-text-primary transition-colors text-sm">← 返回命盘</Link>
        </div>
      </div>
    </div>
  );
}

// Static legal notice — rendered server-side (visible to Paddle crawler)
function PaymentLegalNotice() {
  return (
    <div className="text-center space-y-3 px-6 pb-8">
      <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
        <span className="text-gold-primary text-lg">🛡</span>
        <span className="text-gold-primary text-sm font-semibold">14 天无理由退款保证</span>
      </div>

      <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
        <span>由 Gumroad 和 Paddle 提供支持</span>
        <span className="text-text-tertiary/30">·</span>
        <span>安全结账</span>
      </div>

      <div className="flex items-center justify-center gap-3 text-xs">
        <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
          服务条款
        </Link>
        <span className="text-text-tertiary/30">·</span>
        <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
          隐私政策
        </Link>
        <span className="text-text-tertiary/30">·</span>
        <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">
          退款政策
        </Link>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen starry-bg flex items-center justify-center">
          <div className="text-gold-primary text-2xl taiji-loader">✦</div>
        </div>
      }>
        <PaymentContent />
      </Suspense>
      {/* Server-rendered legal notice — visible to crawlers */}
      <PaymentLegalNotice />
    </>
  );
}