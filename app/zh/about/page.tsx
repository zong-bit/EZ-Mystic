import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于 FateWise — AI + 中国八字/BaZi 命运分析',
  description:
    'FateWise 将千年中国八字/BaZi智慧与现代AI相结合，提供精准、个性化的命运分析。了解我们的使命、团队及背后的技术。',
  alternates: { canonical: '/zh/about' },
  openGraph: {
    title: '关于 FateWise',
    description: '以6000年东方智慧为根基的AI驱动中国八字/BaZi命运分析。',
    url: 'https://bornchart.app/about',
    siteName: 'FateWise',
    type: 'website',
     locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '关于 FateWise',
    description: '以6000年东方智慧为根基的AI驱动中国八字/BaZi命运分析。',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-primary/3 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-xs text-gold-primary font-semibold uppercase tracking-widest bg-gold-primary/10 px-3 py-1 rounded-full">
            我们的故事
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl mt-6 mb-6 text-gold-glow leading-tight">
            古老智慧，现代智能
          </h1>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            FateWise 源于一个简单的信念：<span className="text-text-primary font-medium">6000年的中国八字/BaZi命运智慧应当人人可及</span>，而不被昂贵的解读或语言壁垒所封锁。
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-6 gold-divider pb-2">
              我们的使命
            </h2>
            <div className="text-text-primary text-sm leading-relaxed space-y-4">
              <p>
                中国八字/BaZi — 四柱命理 — 是有史以来最精妙的自我分析体系之一。它描绘了你出生时刻元素力量的相互作用，揭示你天生的优势、关系模式、职业时机和人生周期。
              </p>
              <p>
                但几个世纪以来，准确的八字/BaZi分析需要多年研究、熟练的从业者，而且通常费用不菲。<span className="text-gold-primary font-medium">FateWise 改变了这一点。</span>
              </p>
              <p>
                我们将<span className="text-text-primary">精确的天文计算</span>（包括真太阳时/True Solar Time校正）与<span className="text-text-primary">先进的AI解读</span>相结合，提供既准确又便捷的个性化命运分析。我们的目标不是取代人类大师，而是让基础知识在任何时间、任何地点对任何人都可及。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-gold-primary mb-8 text-center gold-divider pb-2">
            FateWise 的工作原理
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">01</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">真太阳时/True Solar Time</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                我们根据你的精确GPS坐标校正出生时间，计算真太阳时/True Solar Time——这是准确八字/BaZi的基础。
              </p>
            </div>
            {/* Step 2 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">02</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">四柱计算</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                你的出生年、月、日、时通过传统的天干地支体系转换为八个字（八字/BaZi）。
              </p>
            </div>
            {/* Step 3 */}
            <div className="glass-card p-6 text-center">
              <div className="text-gold-primary text-3xl font-display font-bold mb-3">03</div>
              <h3 className="font-display font-semibold text-text-primary mb-3">AI 解读</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI 根据数千年的经典八字/BaZi理论——五行/Five Elements、十神、大运——分析你的命盘，生成个性化解读。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-6 gold-divider pb-2">
              团队
            </h2>
            <div className="text-text-primary text-sm leading-relaxed space-y-4">
              <p>
                FateWise 由一支由工程师、数据科学家和中国玄学研究者组成的小团队打造，他们共同致力于融合东方与西方知识体系。
              </p>
              <p>
                我们的团队包括传统八字/BaZi研习者，确保理论基础的扎实；以及AI工程师，将现代计算能力应用于几个世纪以来的解读框架。结果是诞生了一个尊重传统、拥抱创新的工具。
              </p>
              <p>
                我们相信，技术应当让智慧触手可及，而不是取代命运分析中始终不可或缺的人类判断。FateWise 是一个起点——邀请你探索人类最伟大的自我认知体系之一。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-xl font-bold text-gold-primary mb-8 text-center gold-divider pb-2">
            我们的原则
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">精度至上</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                每个命盘计算都经过经典天文算法的验证。真太阳时/True Solar Time校正确保你的命盘反映出生地的真实天象。
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">尊重传统</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                我们的AI模型基于经典八字/BaZi文献训练，并由经验丰富的从业者验证。我们尊重传统，同时使其易于理解。
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">透明公开</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                我们解释每个解读背后的推理。你的命盘不是黑箱——每条洞察都可追溯至经典八字/BaZi原理。
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gold-primary mb-3">赋能成长</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                我们的目标不是依赖，而是自我认知。我们提供工具，让你自己学习八字/BaZi，并随着时间的推移精进实践。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-10 text-center">
            <h3 className="font-display text-lg font-bold text-gold-primary mb-3">
              准备好探索你的命运了吗？
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              获取免费八字/BaZi命盘，发现你出生时写下的四柱。
            </p>
            <Link href="/bazi" className="btn-primary text-base px-10 py-3 inline-block">
              ✨ 免费获取八字/BaZi命盘
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold-primary text-lg">✦</span>
            <span className="font-display font-semibold text-text-primary">FateWise</span>
          </div>
          <p className="text-text-tertiary text-sm mb-2">
            © 2026 BornChart · FateWise 版权所有。
          </p>
          <p className="text-text-muted text-xs">
            免责声明：本网站内容仅供娱乐和教育用途。
          </p>
        </div>
      </footer>
    </div>
  );
}