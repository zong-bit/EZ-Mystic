import Link from 'next/link';

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ 联系我们 ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            联系我们
          </h1>
          <p className="text-text-secondary text-base max-w-xl mx-auto">
            有问题、反馈或需要帮助？我们很乐意倾听。联系我们，我们会尽快回复。
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Email card */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">邮件支持</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              最快的方式是通过电子邮件联系我们。我们将在24小时内回复。
            </p>
            <p className="text-text-secondary leading-relaxed">
              <strong>发送消息</strong> —{' '}
              <a href="mailto:selina_zxw@qq.com" className="text-gold-primary hover:underline">
                发送消息
              </a>
            </p>
          </div>

          {/* Quick links */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">快速链接</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">账单与订阅</h3>
                <p className="text-text-tertiary text-sm mb-2">关于支付、退款或账户问题：</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">联系我们 →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">技术问题</h3>
                <p className="text-text-tertiary text-sm mb-2">错误、问题或功能建议：</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">联系我们 →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">商务咨询</h3>
                <p className="text-text-tertiary text-sm mb-2">合作、联合或媒体：</p>
                <a href="mailto:selina_zxw@qq.com" className="text-gold-primary text-sm hover:underline">联系我们 →</a>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-display text-sm font-semibold text-text-primary mb-1">常见问题</h3>
                <p className="text-text-tertiary text-sm mb-2">在我们的文档中快速找到答案：</p>
                <Link href="/blog" className="text-gold-primary text-sm hover:underline">浏览博客 →</Link>
              </div>
            </div>
          </div>

          {/* Contact form - direct email link (no backend email API available) */}
          <div className="glass-card p-8">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-4">发送消息</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              点击下方按钮直接从您的邮件客户端发送电子邮件。
            </p>
            <div className="flex flex-col items-center gap-6 py-4">
              <a
                href="mailto:selina_zxw@qq.com"
                className="btn-primary inline-flex items-center gap-2"
                style={{ padding: '14px 40px', fontSize: '16px' }}
              >
                ✦ 发送电子邮件
              </a>
              <p className="text-text-tertiary text-sm">
                或发送电子邮件
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}