'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentContent() {
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const baziData = searchParams.get('bazi') ? JSON.parse(decodeURIComponent(searchParams.get('bazi')!)) : null;
  const name = searchParams.get('name') || '';

  const handlePayment = async () => {
    setProcessing(true);

    // TODO: 集成 Paddle/Dodo Payments 支付
    // MVP 模拟支付
    await new Promise((resolve) => setTimeout(resolve, 2000));

    window.location.href = `/fatebook?bazi=${encodeURIComponent(JSON.stringify(baziData))}&name=${encodeURIComponent(name)}`;
    setProcessing(false);
  };

  return (
    <div className="min-h-screen starry-bg flex items-center justify-center px-6">
      <div className="glass-card p-8 md:p-12 max-w-lg w-full page-enter">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gold-glow">天命之书</h1>
          <p className="text-text-secondary">完整命书报告 · PDF 下载</p>
        </div>

        <div className="text-center mb-8">
          <div className="text-5xl font-display font-bold text-gold-primary mb-2">$29.99</div>
          <p className="text-text-tertiary text-sm">一次性付费 · 永久有效</p>
        </div>

        <div className="mb-8 space-y-3">
          {[
            '📋 完整八字排盘报告',
            '🧬 AI 深度解读（3000+ 字）',
            '📊 大运流年分析',
            '🎯 开运指南（颜色/数字/方位）',
            '📕 精美 PDF 格式下载',
            '🔄 90 天内免费重新生成',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-text-secondary text-sm">
              <span className="text-gold-primary">✓</span>
              {item}
            </div>
          ))}
        </div>

        <button onClick={handlePayment} disabled={processing} className="btn-primary w-full text-lg glow-pulse mb-4">
          {processing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              处理中...
            </span>
          ) : '💳 立即支付 $29.99'}
        </button>

        <div className="text-center text-text-muted text-xs space-y-1">
          <p>支持 Paddle / Dodo Payments / Payoneer</p>
          <p>7天无理由退款保证</p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/bazi" className="text-text-secondary hover:text-text-primary transition-colors text-sm">← 返回排盘页</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen starry-bg flex items-center justify-center">
        <div className="text-gold-primary text-2xl taiji-loader">✦</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
