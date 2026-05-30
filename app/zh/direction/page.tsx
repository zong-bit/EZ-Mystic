'use client';

import React from 'react';
import { Compass, Home, Briefcase, Heart, Shield, Moon } from 'lucide-react';

// 五行方位数据定义
const directionData = [
  {
    element: '木',
    direction: 'East',
    color: 'text-wood',
    bgColor: 'bg-wood/10',
    borderColor: 'border-wood/20',
    icon: Home,
    fengshui: 'Represents health, family, and new beginnings',
    activities: ['Bedroom Orientation', 'Children\'s Room Design', 'Family Gathering Area'],
    description:
      'The East is where the sun rises, symbolizing new beginnings and vitality. In Feng Shui, the Wood element is closely related to family harmony and personal health.',
  },
  {
    element: '火',
    direction: 'South',
    color: 'text-fire',
    bgColor: 'bg-fire/10',
    borderColor: 'border-fire/20',
    icon: Moon,
    fengshui: 'Represents fame, reputation, and achievement',
    activities: ['Office Seat Orientation', 'Living Room Main Wall', 'Achievement Display Area'],
    description:
      'The South belongs to Fire, symbolizing fame and social status. Strengthening the energy of this direction helps enhance personal influence and career achievements.',
  },
  {
    element: '土',
    direction: 'Southwest / Northeast',
    color: 'text-earth',
    bgColor: 'bg-earth/10',
    borderColor: 'border-earth/20',
    icon: Shield,
    fengshui: 'Represents stability, relationships, and trust',
    activities: ['Bedroom Layout', 'Marriage Palace', 'Stable Work Area'],
    description:
      'The Earth element is at the center, representing stability and inclusiveness. The Southwest relates to women and marriage, the Northeast to wisdom and knowledge, forming the foundation of trust.',
  },
  {
    element: '金',
    direction: 'West / Northwest',
    color: 'text-metal-white',
    bgColor: 'bg-metal-white/10',
    borderColor: 'border-metal-white/20',
    icon: Briefcase,
    fengshui: 'Represents creativity, children, and helpful people',
    activities: ['Creative Studio', 'Children\'s Play Area', 'Benefactor Position'],
    description:
      'The Metal element is pure and resolute. The West represents creativity and children luck, the Northwest represents helpful people and leadership. Suitable for inspiring creativity and expanding networks.',
  },
  {
    element: '水',
    direction: 'North',
    color: 'text-water',
    bgColor: 'bg-water/10',
    borderColor: 'border-water/20',
    icon: Compass,
    fengshui: 'Represents career, wisdom, and flow',
    activities: ['Study Orientation', 'Financial Planning Area', 'Meditation Corner'],
    description:
      'The North belongs to Water, symbolizing wisdom and the flow of career. Keeping this direction tidy with appropriate water element decorations helps smooth career fortune.',
  },
];

export default function DirectionPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-4 md:px-8 lg:px-12 py-12 md:py-20 overflow-hidden relative">
      {/* 背景装饰光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-nebula-purple/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* 页面标题区 */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-text-tertiary uppercase tracking-wider mb-4">
            <Compass className="w-3 h-3" />
            <span>Feng Shui Guide</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary font-display">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-primary via-gold-light to-nebula-purple">
              Five Elements Direction Guide
            </span>
          </h1>
          <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Explore the resonance between spatial energy and personal destiny. Optimize your life trajectory by adjusting Five Elements in your living and working environment.
          </p>
        </div>

        {/* 核心展示区：五行方位网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {directionData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.element}
                className={`glass-card group flex flex-col h-full p-6 md:p-8 border-white/10 hover:border-white/20 transition-all duration-500 ${
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* 卡片头部：元素与方位 */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${item.bgColor} ${item.borderColor} transition-transform duration-500 group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="text-right">
                    <span className="block text-4xl font-bold text-text-primary font-display tracking-tight opacity-90 group-hover:opacity-100 transition-opacity">
                      {item.element}
                    </span>
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      {item.direction}
                    </span>
                  </div>
                </div>

                {/* 卡片内容 */}
                <div className="flex-1 space-y-4">
                  <h3 className={`text-xl font-semibold ${item.color}`}>
                    {item.fengshui}
                  </h3>
                  <p className="text-text-tertiary leading-relaxed text-sm">
                    {item.description}
                  </p>

                  {/* 适合的活动 */}
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                      Suitable Activities
                    </p>
                    <ul className="space-y-2">
                      {item.activities.map((activity, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-text-secondary"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`}
                          />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部行动号召 */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 max-w-2xl w-full border-gold-primary/20 bg-gold-primary/[0.03] glass-card">
            <h2 className="text-2xl font-semibold text-text-primary mb-2 font-display">
              Unsure of Your Chart\'s Five Elements?
            </h2>
            <p className="text-text-tertiary mb-6">
              Generate your personalized birth chart to receive Feng Shui direction advice based on your BaZi.
            </p>
            <button className="group relative inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-b from-gold-primary to-gold-secondary px-8 font-medium text-ink-black shadow-[0_10px_20px_rgba(212,168,83,0.3)] transition-all hover:from-gold-light hover:to-gold-primary hover:shadow-[0_15px_25px_rgba(212,168,83,0.4)] active:scale-95">
              <span className="relative z-10">Generate My Chart</span>
              <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-gold-primary to-gold-secondary opacity-0 blur-md transition-opacity group-hover:opacity-30" />
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <div className="inline-block glass-card px-8 py-6 border-gold-primary/30">
            <p className="text-text-secondary mb-3">
              Want personalized advice?
            </p>
            <a
              href="/chat"
              className="text-gold-primary font-semibold hover:text-gold-light transition-colors text-lg"
            >
              Talk to our AI Master for free →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
