'use client';

import Link from 'next/link';
import { Sparkles, Compass, ArrowRight, Wand2 } from 'lucide-react';

export const metadata = {
  title: '生活工具 — 幸运方位、五行与数字 | FateWise',
  description: '根据你的八字命盘发现你的幸运方位、五行和数字。基于中国古老命理学的免费工具。',
};

const TOOLS = [
  {
    href: '/tools/lucky-direction',
    icon: <Compass className="w-8 h-8" />,
    title: '幸运方位 finder',
    subtitle: '根据你的八字命盘找到最吉利的方向。',
    description: '发现四大吉利方位（生气、天医、延年、伏位）和四大凶方，根据你的五行格局量身定制。',
    color: 'from-emerald-500/20 to-teal-600/10',
    borderColor: 'border-emerald-500/30',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  {
    href: '/tools/lucky-element-finder',
    icon: <Wand2 className="w-8 h-8" />,
    title: '幸运五行 finder',
    subtitle: '识别你有利和不利的五行。',
    description: '确定哪五种元素（木、火、土、金、水）支持你的命运，哪些应该避免。',
    color: 'from-amber-500/20 to-orange-600/10',
    borderColor: 'border-amber-500/30',
    hoverGlow: 'group-hover:shadow-amber-500/10',
  },
  {
    href: '/tools/lucky-numbers',
    icon: <Sparkles className="w-8 h-8" />,
    title: '幸运数字',
    subtitle: '发现你人生的吉利数字。',
    description: '根据你的八字命盘获取个性化幸运数字 — 可用于电话号码、车牌号、密码等。',
    color: 'from-violet-500/20 to-purple-600/10',
    borderColor: 'border-violet-500/30',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="px-6 pb-12 text-center">
        <span className="text-gold-primary text-sm tracking-[0.3em] uppercase">✦ 工具 ✦</span>
        <h1 className="font-display font-bold text-4xl md:text-5xl mt-4 mb-4 text-text-primary">
          生活工具
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          三大基于你八字命盘的核心工具 — 发现与你的命运相契合的方位、五行和数字。
        </p>
      </section>

      {/* Tool Cards */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool, idx) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group glass-card p-6 md:p-8 rounded-2xl border ${tool.borderColor} hover:border-opacity-50 transition-all duration-300 ${tool.hoverGlow} shadow-lg hover:shadow-xl`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-gold-primary mb-5 group-hover:scale-105 transition-transform duration-300`}>
                {tool.icon}
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-xl text-text-primary mb-1">
                {tool.title}
              </h2>
              <p className="text-gold-primary text-sm font-medium mb-3">
                {tool.subtitle}
              </p>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {tool.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-gold-primary text-sm font-medium group-hover:gap-3 transition-all duration-300">
                <span>探索</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="px-6 mt-12">
        <div className="max-w-3xl mx-auto glass-card p-8 rounded-2xl border border-gold-primary/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/[0.02] to-transparent pointer-events-none" />
          <div className="relative">
            <span className="text-3xl mb-4 block">👑</span>
            <h2 className="font-display font-bold text-2xl text-gold-primary mb-3">
              升级 Pro 解锁全部功能
            </h2>
            <p className="text-text-secondary text-sm mb-6 max-w-lg mx-auto">
              获取深度分析：年度运势、事业巅峰年份、关系兼容性、个性化风水建议，以及完整的《命运之书》PDF。
            </p>
            <Link href="/zh/pricing" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              <span>升级 Pro</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="px-6 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-tertiary text-xs leading-relaxed">
            FateWise 生活工具基于你的八字命盘计算吉利方位、五行亲和力和幸运数字，根植于中国传统命理学。
            每个工具根据你的出生日期、时间和地点提供个性化洞察 — 并经过真太阳时校正。
          </p>
        </div>
      </section>
    </div>
  );
}
