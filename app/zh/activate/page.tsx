'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ActivatePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    setError('');
    setSuccess(false);

    if (!code.trim()) {
      setError('请输入您的激活码');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '无效的激活码');
        return;
      }

      // Store in localStorage and redirect
      localStorage.setItem('fatewise_token', data.token);
      localStorage.setItem('fatewise_plan', data.plan || 'pro');

      setSuccess(true);
      setTimeout(() => router.push('/bazi'), 2000);
    } catch (e: any) {
      setError('激活失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 starry-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />

      <div className="relative glass-card max-w-md w-full p-8 page-enter">
        {/* 关闭/返回链接 */}
        <Link href="/" className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors text-xl" aria-label="关闭">
          ✕
        </Link>

        <div className="text-center mb-8">
          <span className="text-gold-primary text-3xl" aria-hidden="true">✦</span>
          <h1 className="font-display text-2xl font-bold text-gold-primary mt-2">激活您的许可证</h1>
          <p className="text-text-secondary text-sm mt-1">输入您的Gumroad激活码以解锁Pro版本</p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-jade-green/10 border border-jade-green/20 text-jade-green text-sm text-center" role="alert">
            ✓ 激活成功！正在跳转到您的命盘（八字/BaZi）...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm text-center" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5" htmlFor="activation-code">激活码</label>
            <input
              id="activation-code"
              type="text"
              className="input-field font-mono"
              placeholder="请输入您的激活码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleActivate(); }}
              disabled={loading}
              aria-label="激活码输入框"
            />
          </div>

          <button
            type="button"
            onClick={handleActivate}
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={loading ? '正在激活...' : '立即激活'}
          >
            {loading ? '正在激活...' : '立即激活'}
          </button>
        </div>

        <p className="text-center text-text-tertiary text-xs mt-6">
          还没有激活码？{' '}
          <Link href="/pricing" className="text-gold-primary hover:underline">
            查看套餐
          </Link>
        </p>
      </div>
    </div>
  );
}