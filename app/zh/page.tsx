'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/auth-context';
import QuickDivination from '../components/QuickDivinationZh';

export default function HomePage() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/user-count')
      .then(r => r.json())
      .then(d => { if (d.count > 0) setUserCount(d.count) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 starry-bg opacity-50" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-gold-primary text-lg font-display tracking-widest">✦ 八字命盘 · 八卦起卦 · AI 占星解读 ✦</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6 leading-tight text-gold-glow">
            易经八卦
            <br />
            <span className="bg-gradient-to-r from-gold-primary via-gold-light to-gold-primary bg-clip-text text-transparent">
              八字命理 · 智能解读
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
            即时起卦、生成八字命盘——免费、精准、AI 驱动。
            <br />
            <span className="text-text-tertiary text-base">千年东方智慧，由人工智能揭示</span>
          </p>

          {/* Real user count */}
          {userCount !== null && userCount > 0 && (
            <div className="mb-8 text-text-tertiary text-sm">
              <span className="text-gold-primary font-semibold">{userCount.toLocaleString()}</span>
              <span className="text-text-tertiary"> 位用户</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bagua" className="btn-primary glow-pulse text-lg px-12 py-4" style={{ boxShadow: '0 0 32px rgba(212,175,55,0.25)' }}>
              🔮 免费起卦
            </Link>
            <Link href="/bazi" className="glass px-8 py-4 text-text-secondary hover:text-text-primary transition-colors text-lg">
              查看八字命盘 →
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 flex justify-center gap-8 text-text-tertiary">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">4</div>
              <div className="text-xs mt-1">柱</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">64</div>
              <div className="text-xs mt-1">卦象</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">8</div>
              <div className="text-xs mt-1">卦</div>
            </div>
            <div className="w-px bg-text-tertiary/30" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-gold-primary">∞</div>
              <div className="text-xs mt-1">种可能</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Divination */}
      <QuickDivination />

      {/* Invite Friends CTA — position 2, after Hero */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 border-gold-primary/30">
          <div className="text-gold-primary text-3xl mb-4">✦</div>
          <h2 className="font-display text-3xl font-bold mb-4 text-gold-glow">
            邀请好友，免费获赠 Pro
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto leading-relaxed">
            与朋友分享 FateWise——每位好友注册，您都获得 7 天 Pro 体验。当他们升级时，您也将获得 Pro 权限。
          </p>
          <Link href="/signup" className="btn-primary text-lg px-10 py-4">
            开始分享 →
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">核心功能</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            从精准排盘到深度解读——完整的命运分析体验
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bagua Divination (moved to first position) */}
            <Link href="/bagua" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                八卦起卦
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                易经八卦起卦，即时获得卦象结果与 AI 深度解读。探索古老易学的智慧指引。
              </p>
            </Link>

            {/* Bazi Chart */}
            <Link href="/bazi" className="glass-card p-8 hover:scale-[1.02] transition-transform group">
              <div className="text-4xl mb-4">🜁</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary group-hover:text-gold-light transition-colors">
                八字命盘
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                基于真太阳时校正的精准排盘，支持农历/公历转换，覆盖 1900–2100 年。
              </p>
            </Link>

            {/* AI Interpretation */}
            <div className="glass-card p-8">
              <div className="text-4xl mb-4">🜂</div>
              <h3 className="font-display text-xl font-semibold mb-3 text-gold-primary">
                AI 深度解读
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI 占星师从多个维度解读您的八字命盘和易经卦象——性格、事业、财运、感情等。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Life Tools */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">生活工具</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            基于古代中国智慧的实用日常工具
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Diet Guide */}
            <Link href="/diet" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🍜</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                饮食指南
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                基于节气能量的五行饮食建议。
              </p>
            </Link>

            {/* Color Match */}
            <Link href="/colors" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                色彩匹配
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                找到与您的五行能量和谐的颜色。
              </p>
            </Link>

            {/* Exercise */}
            <Link href="/exercise" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🏃</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                运动指南
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                根据您的五行属性匹配身心锻炼方式。
              </p>
            </Link>

            {/* Direction */}
            <Link href="/direction" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🧭</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                方位指南
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                您生活和工作空间的风水方位。
              </p>
            </Link>

            {/* Luck Boost */}
            <Link href="/luck" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">🍀</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                运势提升
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                每日幸运颜色、数字、方位和招财物品。
              </p>
            </Link>

            {/* Compatibility */}
            <Link href="/compatibility" className="glass-card p-6 hover:scale-[1.02] transition-transform group">
              <div className="text-3xl mb-3">💑</div>
              <h3 className="font-display text-lg font-semibold mb-2 text-gold-primary group-hover:text-gold-light transition-colors">
                合婚匹配
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                两人或两种能量之间的五行兼容性分析。
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <LiveStats />

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4">定价</h2>
          <p className="text-text-secondary text-center mb-16 max-w-xl mx-auto">
            免费开始，解锁您的完整命运档案
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="glass-card p-8 flex flex-col">
              <div className="mb-4">
                <span className="text-text-tertiary text-sm uppercase tracking-wider">免费</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-text-primary">$0</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ 基础八字命盘</li>
                <li>✓ 八卦起卦</li>
                <li>✓ AI 五行分析</li>
              </ul>
              <Link href="/bazi" className="glass w-full text-center py-3 text-text-primary hover:text-gold-primary transition-colors">
                开始使用
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
                最受欢迎
              </div>
              <div className="mb-4 mt-2">
                <span className="text-gold-primary text-sm uppercase tracking-wider">Pro · 月付</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-gold-primary">$9</span>
                <span className="text-text-secondary">.99</span>
                <span className="text-text-tertiary text-sm ml-1">/月</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ 免费版全部内容</li>
                <li>✓ 完整 AI 深度解读</li>
                <li>✓ 完整命书 (PDF)</li>
                <li>✓ 大运与流年运势</li>
                <li>✓ 开运指引</li>
              </ul>
              <Link href="/payment?plan=pro" className="btn-primary w-full text-center py-3">
                获取命书 →
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="glass-card p-8 flex flex-col relative border-gold-primary/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-primary text-dark text-xs px-4 py-1 rounded-full font-semibold">
                最佳价值
              </div>
              <div className="mb-4 mt-2">
                <span className="text-gold-primary text-sm uppercase tracking-wider">Pro · 年付</span>
              </div>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-gold-primary">$79</span>
                <span className="text-text-secondary">.99</span>
                <span className="text-text-tertiary text-sm ml-1">/年</span>
              </div>
              <p className="text-gold-primary text-sm font-semibold mb-2">节省 34%——每月仅 $6.67</p>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 flex-grow">
                <li>✓ 免费版全部内容</li>
                <li>✓ 完整 AI 深度解读</li>
                <li>✓ 完整命书 (PDF)</li>
                <li>✓ 大运与流年运势</li>
                <li>✓ 开运指引</li>
              </ul>
              <Link href="/payment?plan=pro-yearly" className="btn-primary w-full text-center py-3">
                获取命书 →
              </Link>
            </div>
          </div>

          <p className="text-center text-text-tertiary text-xs mt-12">
            通过 Gumroad & Paddle 安全支付 · 14 天无理由退款
          </p>
        </div>
      </section>

      {/* Why FateWise */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-16">为什么选择 FateWise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">📐</span>
              </div>
              <h3 className="font-display font-semibold mb-2">精准排盘</h3>
              <p className="text-text-secondary text-sm">真太阳时校正 + 精确节气数据，确保 100% 排盘准确率</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🧬</span>
              </div>
              <h3 className="font-display font-semibold mb-2">AI 深度解读</h3>
              <p className="text-text-secondary text-sm">根植于古代智慧的 AI 占星师，提供专业而深刻的命运解读</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-primary/10 flex items-center justify-center">
                <span className="text-gold-primary text-xl">🔒</span>
              </div>
              <h3 className="font-display font-semibold mb-2">隐私与安全</h3>
              <p className="text-text-secondary text-sm">所有数据处理均在本地完成——您的出生信息永远不会离开您的设备</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-3xl font-bold mb-4">
            准备好探索您的命运了吗？
          </h2>
          <p className="text-text-secondary mb-8">
            输入您的出生信息，即时获得个性化八字命盘和 AI 解读
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4">
            ✨ 开始免费排盘
          </Link>
        </div>
      </section>

      {/* Business description for payment partner compliance */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto p-4 border border-gold-primary/20 rounded-lg bg-gold-primary/5">
          <p className="text-text-secondary text-sm leading-relaxed text-center">
            <strong className="text-gold-primary">FateWise</strong>（由 <strong className="text-gold-primary">BornChart</strong> 运营）是一个 AI 驱动的中国占星平台，生成个性化八字（四柱推命）命盘和易经卦象，提供性格、事业、财富和关系方面的深度 AI 解读，并交付精美排版的命书 PDF 报告，包含大运周期和流年运势分析。
          </p>
        </div>
      </section>

    </div>
  );
}

// ── Live Stats component ──
type StatsData = {
  today: number
  total: number
  uniqueIps: number
}

function LiveStats() {
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])

  if (!stats) return null

  return (
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-text-tertiary tracking-wide uppercase text-xs font-semibold">📊 实时统计</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.today}</div>
            <div className="text-xs text-text-tertiary mt-1">今日生成命盘数</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.uniqueIps}</div>
            <div className="text-xs text-text-tertiary mt-1">本周活跃用户</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-bold text-gold-primary">{stats.total}</div>
            <div className="text-xs text-text-tertiary mt-1">总命盘生成数</div>
          </div>
        </div>
      </div>
    </section>
  )
}
