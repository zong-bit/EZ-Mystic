'use client';

import React from 'react';
import {
  Wind,
  TreePine,
  Droplets,
  Flame,
  Mountain,
  HeartPulse,
  Activity,
  ChevronRight,
} from 'lucide-react';

// --- 设计令牌与常量 ---

const elementColors: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    icon: string;
    gradient: string;
  }
> = {
  metal: {
    text: 'text-metal-white',
    bg: 'bg-metal-white/10',
    border: 'border-metal-white/20',
    icon: 'text-metal-white',
    gradient: 'from-metal-white via-warm-white to-metal-white',
  },
  wood: {
    text: 'text-wood',
    bg: 'bg-wood/10',
    border: 'border-wood/20',
    icon: 'text-wood',
    gradient: 'from-aurora-green via-wood to-cosmic-blue',
  },
  water: {
    text: 'text-water',
    bg: 'bg-water/10',
    border: 'border-water/20',
    icon: 'text-water',
    gradient: 'from-water via-star-dust to-cosmic-blue',
  },
  fire: {
    text: 'text-fire',
    bg: 'bg-fire/10',
    border: 'border-fire/20',
    icon: 'text-fire',
    gradient: 'from-cinnabar-red via-amber-glow to-fire',
  },
  earth: {
    text: 'text-earth',
    bg: 'bg-earth/10',
    border: 'border-earth/20',
    icon: 'text-earth',
    gradient: 'from-earth-brown via-gold-light to-earth',
  },
};

const exerciseData = [
  {
    element: 'metal',
    title: '金 (Metal)',
     subtitle: '呼吸系统 · 肺健康',
    description:
      '金主收敛，对应肺与大肠。适合节奏稳定的呼吸训练运动，增强肺活量与专注力。',
    activities: [
      { name: 'Tai Chi',  benefit: '调和气血，改善平衡与灵活性。' },
      { name: 'Yoga', benefit: 'Enhances lung function through postures and breathing techniques.' },
      { name: 'Deep Breathing Exercises',  benefit: '直接强化呼吸肌群，缓解焦虑。' },
    ],
    icon: Wind,
  },
  {
    element: 'wood',
    title: '木 (Wood)',
     subtitle: '肝 · 经络拉伸',
    description:
      'Wood governs growth, corresponding to the liver and gallbladder. Suitable for highly stretching exercises that help unblock meridians, release stress, and promote qi and blood flow.',
    activities: [
      {
        name: 'Stretching',
        benefit: '放松紧张肌肉，增加关节灵活性。' },
      {
        name: 'Dancing',
         benefit: '活动筋骨，提升情绪与协调性。' },
      {
        name: 'Climbing',
        benefit: '挑战自我，增强全身肌肉耐力。' },
    ],
    icon: TreePine,
  },
  {
    element: 'water',
    title: '水 (Water)',
     subtitle: '肾 · 膀胱排毒',
    description:
      'Water governs storage, corresponding to the kidneys and bladder. Suitable for fluid, relaxing exercises that help with energy recovery and meditation.',
    activities: [
      {
        name: 'Swimming',
        benefit: '全身低冲击运动，强化心肺功能。' },
      {
        name: 'Brisk Walking',
        benefit: '促进血液循环，温和锻炼腿部。' },
      {
        name: 'Meditation',
         benefit: '静心养神，调节神经系统平衡。' },
    ],
    icon: Droplets,
  },
  {
    element: 'fire',
    title: '火 (Fire)',
     subtitle: '心 · 小肠循环',
    description:
      '火主上升，对应心脏和小肠。适合高强度运动，提升心率、点燃激情、促进血液循环。',
    activities: [
      {
        name: 'Running',
         benefit: '高效燃脂，增强心血管健康。' },
      {
        name: 'Aerobics',
        benefit: '节奏强烈，提高心肺耐力。' },
      {
        name: 'HIIT (High-Intensity Interval Training)',
        benefit: '短时高效燃脂，促进新陈代谢。' },
    ],
    icon: Flame,
  },
  {
    element: 'earth',
    title: '土 (Earth)',
     subtitle: '脾与胃 · 核心力量',
    description:
      'Earth governs transformation, corresponding to the spleen and stomach. Suitable for stable, core-focused exercises that support digestive health and body stability.',
    activities: [
      {
        name: 'Weight Lifting',
        benefit: '强健筋骨，提高基础代谢。' },
      {
        name: 'Core Training',
        benefit: '稳定躯干，改善姿态和平衡。' },
      {
        name: 'Pilates',
        benefit: '强化深层肌肉，提高身体控制力。' },
    ],
    icon: Mountain,
  },
];

// --- 子组件 ---

const ElementIcon = ({
  type,
  className,
}: {
  type: keyof typeof elementColors;
  className?: string;
}) => {
  const IconMap: Record<string, React.ElementType> = {
    metal: Wind,
    wood: TreePine,
    water: Droplets,
    fire: Flame,
    earth: Mountain,
  };
  const Icon = IconMap[type] || Activity;
  const colorStyle = elementColors[type];

  return (
    <div
      className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${colorStyle?.bg} ${colorStyle?.border} border ${className}`}
    >
      <Icon className={`w-6 h-6 ${colorStyle?.icon}`} />
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-lg bg-gradient-to-tr ${colorStyle?.gradient}`}
      />
    </div>
  );
};

const ExerciseCard = ({
  data,
}: {
  data: (typeof exerciseData)[0];
}) => {
  const colors = elementColors[data.element];
  const Icon = data.icon;

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-2xl ${colors?.border}`}
    >
      {/* 顶部渐变背景装饰 */}
      <div
        className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20 bg-gradient-to-br ${colors?.gradient}`}
      />

      <div className="p-6 z-10">
        {/* 头部：图标 + 标题 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <ElementIcon
              type={data.element}
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div>
              <h3
                className={`text-xl font-bold font-display tracking-tight ${colors?.text}`}
              >
                {data.title}
              </h3>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted">
                {data.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-text-tertiary leading-relaxed mb-6 min-h-[48px]">
          {data.description}
        </p>

        {/* 活动列表 */}
        <div className="space-y-3">
          {data.activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]"
            >
              <div className={`mt-1 flex-shrink-0 ${colors?.text}`}>
                <Activity size={16} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  {activity.name}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {activity.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div
        className={`h-1 w-full bg-gradient-to-r opacity-50 transition-opacity group-hover:opacity-100 bg-gradient-to-r ${colors?.gradient}`}
      />
    </article>
  );
};

// --- 主页面组件 ---

export default function ExercisePage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary/30">
      {/* 背景光晕 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-nebula-purple/20 blur-[120px] rounded-full opacity-30" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-gold-primary/10 blur-[100px] rounded-full opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 max-w-7xl">
        {/* 页面标题区 */}
        <header className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gold-primary mb-6 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
            身心平衡指南
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-6 font-display">
            五行{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-amber-glow to-gold-primary">
              Exercise
            </span>{' '}
            运动建议
          </h1>

          <p className="text-lg text-text-tertiary leading-relaxed">
            According to Traditional Chinese Medicine 五行 theory, different elements correspond to different organs and energy states.
            Choose exercises that match your current 五行 energy for mind-body harmony and balance.
          </p>
        </header>

        {/* 核心内容：五行网格 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {exerciseData.map((item) => (
            <ExerciseCard key={item.element} data={item} />
          ))}

          {/* 占位卡片 */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center hover:bg-white/[0.04] transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <HeartPulse className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-secondary mb-2">
              需要个性化建议？
            </h3>
            <p className="text-sm text-text-muted mb-6">
              View your birth chart to get a custom exercise prescription based on your missing and excess 五行.
            </p>
            <button className="group flex items-center gap-2 text-sm font-medium text-gold-primary hover:text-gold-light transition-colors">
              查看我的命盘
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* 底部说明 */}
        <footer className="mt-24 text-center">
          <p className="text-xs text-text-muted max-w-2xl mx-auto">
            * This page provides general health advice based on Traditional Chinese Medicine 五行 theory, not medical advice.
            如有健康问题，请咨询专业医生或物理治疗师。
          </p>
        </footer>

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="inline-block glass-card px-8 py-6 border-gold-primary/30">
            <p className="text-text-secondary mb-3">
              想要个性化建议？
            </p>
            <a
              href="/chat"
              className="text-gold-primary font-semibold hover:text-gold-light transition-colors text-lg"
            >
              免费咨询我们的AI大师 →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
