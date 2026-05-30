'use client';

import Link from 'next/link';
// Gumroad product links
const GUMROAD_MONTHLY = 'https://selinazw.gumroad.com/l/lcrujk';
const GUMROAD_YEARLY = 'https://selinazw.gumroad.com/l/wejaix';

// Paddle checkout URLs (update after creating in Paddle dashboard)
const PADDLE_CHECKOUT_PRO = 'https://checkout.paddle.com/checkout/price/pri_01krwnhrp61mddw9hb4rj7k40b';

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <span className="text-gold-primary text-lg font-display tracking-widest">✦ 选择您的路径 ✦</span>
        <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
          简单透明的定价
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          从免费排盘开始，随时解锁您的完整命运档案。
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Free */}
          <div className="glass-card p-8 flex flex-col">
            <span className="text-text-tertiary text-sm uppercase tracking-wider">免费</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-text-primary">$0</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">适合探索您的命运</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>基础八字命盘与四柱</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>日主与五行分析</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>AI 性格概览</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary/30">—</span>
                <span className="text-text-tertiary">深度解读</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary/30">—</span>
                <span className="text-text-tertiary">命书 PDF</span>
              </li>
            </ul>
            <Link href="/bazi" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
              免费开始
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="glass-card p-8 flex flex-col">
            <span className="text-text-tertiary text-sm uppercase tracking-wider">Pro · 月付</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-text-primary">$9</span>
              <span className="text-text-secondary">.99</span>
              <span className="text-text-tertiary text-sm ml-1">/月</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">您的完整命运档案——按月续费</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>免费版全部内容</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>完整 AI 深度解读（事业、财富、感情）</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>完整命书 PDF 下载</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>大运与流年周期</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>开运指引（十神）</span>
              </li>
            </ul>

            {/* Deliverables — Pro */}
            <div className="mb-6 p-3 border border-gold-primary/20 rounded bg-gold-primary/5">
              <p className="text-xs text-gold-primary font-semibold uppercase tracking-wider mb-1">您将收到：</p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>✦ 完整 AI 深度解读报告</li>
                <li>✦ 完整命书 PDF 下载</li>
                <li>✦ 大运与流年分析</li>
                <li>✦ 开运指引（十神）</li>
              </ul>
            </div>

            <a href={GUMROAD_MONTHLY} target="_blank" rel="noopener noreferrer" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
              月付获取命书 →
            </a>
          </div>

          {/* Pro Yearly */}
          <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
              最佳价值
            </div>
            <span className="text-gold-primary text-sm uppercase tracking-wider mt-2">Pro</span>
            <div className="my-4">
              <span className="font-display text-5xl font-bold text-gold-primary">$79</span>
              <span className="text-text-secondary">.99</span>
              <span className="text-text-tertiary text-sm ml-1">/年</span>
            </div>
            <p className="text-gold-primary text-sm font-semibold mb-1">节省 34%——每月仅 $6.67</p>
            <p className="text-text-secondary text-sm mb-6">您的完整命运档案——按年计费</p>
            <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Full AI deep interpretation (career, wealth, love)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Complete Destiny Book PDF download</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Great Fortune &amp; Annual Luck cycles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-primary">✓</span>
                <span>Open Luck (Ten Gods) guidance</span>
              </li>
            </ul>

            {/* Deliverables — Pro Yearly */}
            <div className="mb-6 p-3 border border-gold-primary/20 rounded bg-gold-primary/5">
              <p className="text-xs text-gold-primary font-semibold uppercase tracking-wider mb-1">You Will Receive:</p>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>✦ Full AI deep interpretation report</li>
                <li>✦ Complete Destiny Book PDF download</li>
                <li>✦ Great Fortune &amp; Annual Luck analysis</li>
                <li>✦ Open Luck (Ten Gods) guidance</li>
              </ul>
            </div>

            <a href={GUMROAD_YEARLY} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center py-3">
              年付获取命书 →
            </a>
          </div>


        </div>
      </section>

      {/* Activate License CTA */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-8">
          <span className="text-gold-primary text-lg">✦</span>
          <h2 className="font-display text-xl font-bold text-gold-primary mt-2 mb-2">已有激活码？</h2>
          <p className="text-text-secondary text-sm mb-5">
            在下方输入您的 Gumroad 购买码，立即解锁 Pro 功能。
          </p>
          <Link href="/activate" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            激活授权
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-12">常见问题</h2>
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">免费解读包含什么？</h3>
              <p className="text-text-secondary text-sm">您的基础八字命盘，包含四柱、日主分析和五行分布。这是了解您命运密码的良好起点。</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">命书是如何工作的？</h3>
              <p className="text-text-secondary text-sm">排盘后，您可以购买完整命书 PDF——一份精美排版的报告，涵盖您的性格、事业、财富、感情、大运周期和流年运势。</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gold-primary mb-2">有退款政策吗？</h3>
              <p className="text-text-secondary text-sm">是的，所有付费计划均提供 14 天无理由退款保证。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-2xl font-bold mb-4">
            不确定哪个方案适合您？
          </h2>
          <p className="text-text-secondary mb-8">
            从免费排盘开始——您会清楚知道自己需要什么。
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4">
            ✨ 开始免费排盘
          </Link>
        </div>
      </section>

      {/* Payment policies — required for Paddle */}
      <section className="pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gold-primary/10 border border-gold-primary/30 rounded-full px-4 py-2">
            <span className="text-gold-primary text-lg">🛡</span>
            <span className="text-gold-primary text-sm font-semibold">所有付费计划 14 天无理由退款保证</span>
          </div>
          <p className="text-text-tertiary text-xs">Powered by Gumroad &amp; Paddle · Secure checkout</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <Link href="/terms" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Terms of Service</Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/privacy" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Privacy Policy</Link>
            <span className="text-text-tertiary/30">·</span>
            <Link href="/refund" className="text-text-tertiary hover:text-gold-primary transition-colors underline underline-offset-2">Refund Policy</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
