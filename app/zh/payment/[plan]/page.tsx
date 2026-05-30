'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/gebxj';

// Paddle product prices
const PADDLE_PRO_PRICE_ID = 'pri_01krwj2267cjbr45n40f3aj3vr';
const PADDLE_PREMIUM_PRICE_ID = 'pri_01krwj29wge21qkx8yfe9re6vy';
// TODO: Replace with actual Paddle checkout URLs from dashboard
const PADDLE_CHECKOUT_PRO = 'https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b';
const PADDLE_CHECKOUT_PREMIUM = 'https://checkout.paddle.com/checkout/price/pri_01krwnhv91ve8zd3t49kd0bysb';

interface PlanInfo {
  name: string;
  price: string;
  priceFull: string;
  subtitle: string;
  features: string[];
  gumroadLink: string;
  paddleLink: string;
  planKey: 'pro' | 'premium';
}

const PLANS: Record<string, PlanInfo> = {
  pro: {
    name: '专业版',
    price: '$9',
    priceFull: '$9.99',
    subtitle: '月度订阅',
    features: [
      '完整AI深度解读（事业、财运、爱情）',
      '《命运之书》PDF完整下载',
      '大运与流年周期分析',
      '十神开运指引',
    ],
    gumroadLink: GUMROAD_MONTHLY,
    paddleLink: PADDLE_CHECKOUT_PRO,
    planKey: 'pro',
  },
  premium: {
    name: '高级版',
    price: '$29',
    priceFull: '$29.99',
    subtitle: '一次性付款 · 终身使用',
    features: [
      '包含专业版全部功能',
      '年度运势报告',
      '合盘兼容性分析 (八字/BaZi)',
      '八字五行基础风水利 (五行/Five Elements)',
      '优先技术支持',
    ],
    gumroadLink: GUMROAD_YEARLY,
    paddleLink: PADDLE_CHECKOUT_PREMIUM,
    planKey: 'premium',
  },
};

function PaymentPlanContent() {
  const searchParams = useSearchParams();
  const planSlug = searchParams.get('plan') || 'pro';
  const plan = PLANS[planSlug] || PLANS.pro;

  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const baziParam = baziData ? `&bazi=${encodeURIComponent(JSON.stringify(baziData))}` : '';
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : '';

  const [processing, setProcessing] = useState(false);

  const [selected, setSelected] = useState<'gumroad' | 'paddle'>('gumroad');
  const handleCheckout = () => {
    const url = selected === 'gumroad' ? plan.gumroadLink : plan.paddleLink;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-lg w-full page-enter">
        <div className="text-center mb-8">
          <span className="text-gold-primary text-sm uppercase tracking-wider">{plan.name} 方案</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-2 text-gold-glow">命运之书</h1>
          <p className="text-text-secondary">完成购买，解锁您的《命运之书》</p>
        </div>

        <div className="text-center mb-8">
          <div className="font-display text-5xl font-bold text-gold-primary mb-2">{plan.price}<span className="text-2xl text-text-secondary">.99</span></div>
          <p className="text-text-tertiary text-sm">{plan.subtitle}</p>
        </div>

        <div className="mb-8 space-y-3">
          {plan.features.map((item) => (
            <div key={item} className="flex items-center gap-3 text-text-secondary text-sm">
              <span className="text-gold-primary">✓</span>
              {item}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-text-tertiary text-xs mb-2 text-center">选择支付方式：</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelected('gumroad')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                selected === 'gumroad'
                  ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                  : 'border-white/10 text-text-tertiary hover:text-text-secondary'
              }`}
            >
              💳 Gumroad
            </button>
            <button
              onClick={() => setSelected('paddle')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-colors ${
                selected === 'paddle'
                  ? 'border-gold-primary text-gold-primary bg-gold-primary/10'
                  : 'border-white/10 text-text-tertiary hover:text-text-secondary'
              }`}
            >
              🔷 Paddle
            </button>
          </div>
        </div>

        <button onClick={handleCheckout} disabled={processing} className="btn-primary w-full text-lg glow-pulse mb-4">
          {processing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              正在打开结账...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              💳 使用 {selected === 'gumroad' ? 'Gumroad' : 'Paddle'}支付 · {plan.priceFull}
            </span>
          )}
        </button>

        <div className="text-center space-y-3 mb-6">
          {/* 14-day guarantee badge */}
          <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
            <span className="text-gold-primary text-lg">🛡</span>
            <span className="text-gold-primary text-sm font-semibold">14天无忧退款保证</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
            <span>由 Gumroad 和 Paddle 提供技术支持</span>
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

        <div className="space-y-3 text-center">
          <Link
            href={`/payment/verify?plan=${plan.planKey}${baziParam}${nameParam}`}
            className="block text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            我已付款 — 激活我的购买 →
          </Link>
          <Link href="/bazi" className="block text-text-tertiary hover:text-text-primary transition-colors text-xs">
            ← 返回八字图表 (BaZi)
          </Link>
        </div>

        {baziData && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-text-tertiary text-xs text-center">
              支付完成后，您的八字排盘 (八字/BaZi) 将用于生成个性化《命运之书》。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPlanPage() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen starry-bg flex items-center justify-center">
          <div className="text-gold-primary text-2xl taiji-loader">✦</div>
        </div>
      }>
        <PaymentPlanContent />
      </Suspense>
      {/* Server-rendered legal notice */}
      <div className="text-center space-y-3 px-6 pb-8">
        <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
          <span className="text-gold-primary text-lg">🛡</span>
          <span className="text-gold-primary text-sm font-semibold">14天无忧退款保证</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-text-tertiary text-xs">
          <span>由 Gumroad 和 Paddle 提供技术支持</span>
          <span className="text-text-tertiary/30">·</span>
          <span>安全结账</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">服务条款</Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">隐私政策</Link>
          <span className="text-text-tertiary/30">·</span>
          <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">退款政策</Link>
        </div>
      </div>
    </>
  );
}