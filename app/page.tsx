'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ backdropFilter: 'blur(12px)', background: 'rgba(18,18,26,0.72)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold-primary text-xl font-display font-bold text-gold-glow">✦</span>
            <span className="text-text-primary font-display font-semibold text-lg">FateWise</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/bazi" className="text-text-secondary hover:text-gold-primary transition-colors text-sm">
              八字排盘
            </Link>
            <Link href="/bazi" className="btn-primary text-sm" style={{ padding: '8px 20px', fontSize: '14px' }}>
              开始探索 →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 starry-bg opacity-50" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-gold-primary text-lg font-display tracking-widest">✦ 东方智慧 × AI科技 ✦</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight text-gold-glow">
            发现你的
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-gold-light to-gold-primary bg-clip-text text-transparent">
              命运密码
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            精准八字排盘 · AI深度解读 · 完整命书报告
            <br />
            <span className="text-text-tertiary text-base">千年命理智慧，由人工智能为你揭示</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bazi" className="btn-primary glow-pulse text-lg px-10 py-4">
              ✨ 免费排盘
            </Link>
            <Link href="/bazi" className="glass px-8 py-4 text-text-secondary hover:text-text-primary transition-colors text-lg">
              了解更多 →
            </Link>
          </div>

          {/* 装饰元素 */}
          <div className="mt-16 flex justify-center gap-8 text-text-tertiary">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">4</div>
              <div className="text-xs mt-1">柱八字</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">10</div>
              <div className="text-xs mt-1">天干</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">12</div>
              <div className="text-xs mt-1">地支</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">∞</div>
              <div className="text-xs mt-1">可能</div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能卡片 */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">核心功能</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            从精准排盘到深度解读，一站式命理分析
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 八字排盘 */}
            <Link href="/bazi" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🜁</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                八字排盘
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                基于真太阳时校正的精准排盘，支持公历/农历转换，覆盖1900-2100年。
              </p>
            </Link>

            {/* AI解读 */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜂</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                AI深度解读
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI命理师基于八字格局，从性格、事业、财运、感情等多维度为你深度解析。
              </p>
            </div>

            {/* 命书PDF */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜄</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                完整命书
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                一键生成精美PDF命书报告，包含大运流年、开运指南等完整内容。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 为什么选择 */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-16">为什么选择 FateWise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">📐</span>
              </div>
              <h3 className="font-display font-semibold mb-2">精准排盘</h3>
              <p className="text-text-secondary text-sm">真太阳时校正 + 精确节气数据，确保排盘100%准确</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🧬</span>
              </div>
              <h3 className="font-display font-semibold mb-2">AI深度解读</h3>
              <p className="text-text-secondary text-sm">基于古籍智慧的AI命理师，提供专业、有深度的命理解读</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🔒</span>
              </div>
              <h3 className="font-display font-semibold mb-2">隐私安全</h3>
              <p className="text-text-secondary text-sm">所有数据处理在本地完成，你的出生信息绝不外泄</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            准备好探索你的命运了吗？
          </h2>
          <p className="text-text-secondary mb-8">
            输入你的出生信息，即刻获取专属八字排盘与AI解读
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4">
            ✨ 开始免费排盘
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold-primary text-lg">✦</span>
            <span className="font-display font-semibold">FateWise</span>
          </div>
          <p className="text-text-tertiary text-sm mb-2">
            © 2026 ez-mystic · FateWise. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            免责声明：本网站内容仅供娱乐和教育用途，不构成人生决策建议。
          </p>
        </div>
      </footer>
    </div>
  );
}
