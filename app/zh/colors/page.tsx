'use client';

import React, { useState } from 'react';
import {
  Sun,
  Wind,
  Droplets,
  Flame,
  Mountain,
  Palette,
  Info,
  Sparkles,
} from 'lucide-react';

// --- 数据定义: 五行与五色 ---

interface WuxingData {
  id: string;
  element: string;
  colorName: string;
  colors: { name: string; hex: string }[];
  description: string;
  meaning: string;
  applications: string[];
  icon: React.ReactNode;
  gradient: string;
}

const wuxingData: WuxingData[] = [
  {
    id: 'metal',
    element: '金',
    colorName: 'White / Gold',
    colors: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Gold', hex: '#d4af37' },
      { name: 'Silver White', hex: '#c0c0c0' },
    ],
    description:
      'The Metal element represents gathering, clearing, and transformation. In colors, it corresponds to white, gold, and silver, symbolizing purity, nobility, and wealth.',
    meaning: 'Symbolizes authority, order, and wealth. Suitable for enhancing decision-making and execution.',
    applications: ['Office Environment', 'Financial Industry'],
    icon: <Sun className="w-6 h-6" />,
    gradient: 'from-gray-100 via-white to-gold-light',
  },
  {
    id: 'wood',
    element: '木',
    colorName: 'Green / Cyan',
    colors: [
      { name: 'Emerald Green', hex: '#10b981' },
      { name: 'Cyan', hex: '#06b6d4' },
      { name: 'Dark Green', hex: '#065f46' },
    ],
    description:
      'The Wood element represents growth, development, and benevolence. In colors, it corresponds to green and cyan, symbolizing life, vitality, and health.',
    meaning: 'Symbolizes growth, health, and harmony. Suitable for fostering creativity and interpersonal relationships.',
    applications: ['Home Decoration', 'Health & Wellness'],
    icon: <Wind className="w-6 h-6" />,
    gradient: 'from-aurora-green via-wood to-cosmic-blue',
  },
  {
    id: 'water',
    element: '水',
    colorName: 'Black / Blue',
    colors: [
      { name: 'Deep Blue', hex: '#1e3a8a' },
      { name: 'Black', hex: '#18181b' },
      { name: 'Navy', hex: '#0f172a' },
    ],
    description:
      'The Water element represents wisdom, flow, and adaptability. In colors, it corresponds to black and blue, symbolizing depth, tranquility, and wisdom.',
    meaning:
      'Symbolizes wisdom, flow, and wealth (water represents wealth). Suitable for meditation, thinking, and communication.',
    applications: ['Meditation Space', 'Creative Work'],
    icon: <Droplets className="w-6 h-6" />,
    gradient: 'from-water via-star-dust to-bg-primary',
  },
  {
    id: 'fire',
    element: '火',
    colorName: 'Red / Purple',
    colors: [
      { name: 'Bright Red', hex: '#ef4444' },
      { name: 'Purple', hex: '#a855f7' },
      { name: 'Orange Red', hex: '#f97316' },
    ],
    description:
      'The Fire element represents passion, etiquette, and brightness. In colors, it corresponds to red, purple, and orange, symbolizing vitality, passion, and nobility.',
    meaning: 'Symbolizes passion, vitality, and fame. Suitable for boosting self-confidence and social charm.',
    applications: ['Social Events', 'Food & Beverage Industry'],
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-amber-glow via-cinnabar-red to-nebula-purple',
  },
  {
    id: 'earth',
    element: '土',
    colorName: 'Yellow / Brown',
    colors: [
      { name: 'Yellow', hex: '#eab308' },
      { name: 'Brown', hex: '#78350f' },
      { name: 'Off-White', hex: '#f5f5f4' },
    ],
    description:
      'The Earth element represents stability, inclusiveness, and bearing. In colors, it corresponds to yellow, brown, and beige, symbolizing steadiness, trust, and foundation.',
    meaning: 'Symbolizes stability, trust, and foundation. Suitable for building a sense of security and long-term planning.',
    applications: ['Bedroom Layout', 'Stability Planning'],
    icon: <Mountain className="w-6 h-6" />,
    gradient: 'from-gold-light via-earth to-amber-glow',
  },
];

// --- 子组件: 颜色标签 ---

const ColorBadge = ({
  hex,
  name,
}: {
  hex: string;
  name: string;
}) => (
  <div className="flex items-center gap-2 group cursor-default">
    <div
      className="w-8 h-8 rounded-full border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-200"
      style={{ backgroundColor: hex }}
      aria-label={name}
    />
    <span className="text-xs text-text-tertiary font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute ml-10 bg-bg-tertiary/90 px-2 py-1 rounded">
      {name}
    </span>
  </div>
);

// --- 主页面组件 ---

export default function ColorsPage() {
  const [activeId, setActiveId] = useState<string>('metal');
  const activeData =
    wuxingData.find((d) => d.id === activeId) || wuxingData[0];

  const isActive = (id: string) => activeId === id;

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary/30">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nebula-purple/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
        {/* 页面标题 */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-tertiary mb-4">
            <Palette className="w-3 h-3" />
            <span>Five Elements Color Theory</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary font-display">
            Five Elements Color Matching
          </h1>
          <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Explore the mysterious connections between the Five Elements (Metal, Wood, Water, Fire, Earth) and the Five Colors (White, Green, Black, Red, Yellow).
            Enhance your energy field and life fortune through color balance.
          </p>
        </div>

        {/* 核心展示区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧: 五行选择器 */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Choose Your Element
            </h2>
            <div className="space-y-3">
              {wuxingData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`w-full group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                    isActive(item.id)
                      ? 'bg-white/[0.05] border-gold-primary/50 shadow-[0_0_20px_rgba(212,168,83,0.1)]'
                      : 'bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  {/* 图标区域 */}
                  <div
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      isActive(item.id)
                        ? 'bg-gold-primary/20 text-gold-primary'
                        : 'bg-white/5 text-text-tertiary group-hover:text-text-secondary'
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* 文本区域 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-lg ${
                          isActive(item.id) ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                        }`}
                      >
                        {item.element}
                      </span>
                      {isActive(item.id) && (
                        <Sparkles className="w-4 h-4 text-gold-primary animate-pulse" />
                      )}
                    </div>
                    <span className="text-sm text-text-tertiary">
                      {item.colorName}
                    </span>
                  </div>

                  {/* 装饰性渐变条 */}
                  <div
                    className={`absolute right-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b opacity-0 transition-opacity duration-300 ${
                      isActive(item.id) ? 'opacity-100' : 'group-hover:opacity-50'
                    }`}
                    style={{
                      backgroundImage: `linear-gradient(to bottom, ${item.colors
                        .map((c) => c.hex)
                        .join(',')})`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 右侧: 详情展示 */}
          <div className="lg:col-span-7">
            <div className="relative h-full min-h-[600px] flex flex-col">
              {/* 玻璃拟态详情卡片 */}
              <div className="absolute inset-0 glass-card overflow-hidden">
                {/* 顶部光晕 */}
                <div
                  className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b opacity-30 transition-all duration-700 ${activeData.gradient}`}
                />

                <div className="relative p-8 md:p-12 h-full flex flex-col">
                  {/* 头部信息 */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-muted">
                        {activeData.element}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-medium text-text-secondary">
                        {activeData.element} Element
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                      {activeData.colorName}
                    </h3>
                    <p className="text-text-tertiary leading-relaxed">
                      {activeData.description}
                    </p>
                  </div>

                  {/* 颜色展示 */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                      Corresponding Colors
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      {activeData.colors.map((color) => (
                        <div key={color.name} className="group relative">
                          <div
                            className="w-20 h-20 rounded-2xl border border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="mt-2 text-center">
                            <div className="text-xs font-medium text-text-secondary">
                              {color.name}
                            </div>
                            <div className="text-[10px] text-text-muted font-mono">
                              {color.hex}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 风水寓意 */}
                  <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gold-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-text-secondary mb-2">
                          Feng Shui Meaning
                        </h4>
                        <p className="text-text-tertiary text-sm leading-relaxed">
                          {activeData.meaning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 适用场景 */}
                  <div className="mt-auto">
                    <h4 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
                      Suitable Scenarios
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeData.applications.map((app, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary hover:bg-white/10 hover:text-text-secondary transition-colors cursor-default"
                        >
                          {app}
                        </span>
                      ))}
                      {activeId === 'metal' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Office Environment
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Financial Industry
                          </span>
                        </>
                      )}
                      {activeId === 'wood' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Home Decoration
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Health & Wellness
                          </span>
                        </>
                      )}
                      {activeId === 'water' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Meditation Space
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Creative Work
                          </span>
                        </>
                      )}
                      {activeId === 'fire' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Social Events
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Food & Beverage Industry
                          </span>
                        </>
                      )}
                      {activeId === 'earth' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Bedroom Layout
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            Stability Planning
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
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
    </main>
  );
}
