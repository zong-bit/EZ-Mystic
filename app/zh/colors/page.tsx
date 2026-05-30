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
    colorName: '白/金色',
    colors: [
      { name:  '纯白', hex: '#ffffff' },
      { name:  '金色', hex: '#d4af37' },
      { name:  '银白', hex: '#c0c0c0' },
    ],
    description:
      '金元素代表收敛、肃杀与变革。在色彩中对应白色、金色和银色，象征纯洁、尊贵与财富。',
    meaning: '象征权威、秩序与财富。适合提升决策力与执行力。',
    applications: ['办公环境', '金融行业'],
    icon: <Sun className="w-6 h-6" />,
    gradient: 'from-gray-100 via-white to-gold-light',
  },
  {
    id: 'wood',
    element: '木',
    colorName:  '绿/青色',
    colors: [
      { name:  '翡翠绿', hex: '#10b981' },
      { name: 'Cyan', hex: '#06b6d4' },
      { name:  '深绿', hex: '#065f46' },
    ],
    description:
      '木元素代表生长、发展与仁德。在色彩中对应绿色和青色，象征生命、活力与健康。',
    meaning: '象征生长、健康与和谐。适合培养创造力与人际关系。',
    applications: ['家居装饰', '健康养生'],
    icon: <Wind className="w-6 h-6" />,
    gradient: 'from-aurora-green via-wood to-cosmic-blue',
  },
  {
    id: 'water',
    element: '水',
    colorName: 'Black / Blue',
    colors: [
      { name:  '深蓝', hex: '#1e3a8a' },
      { name: 'Black', hex: '#18181b' },
      { name:  '藏青', hex: '#0f172a' },
    ],
    description:
      '水元素代表智慧、流动与适应力。在色彩中对应黑色和蓝色，象征深邃、宁静与智慧。',
    meaning:
      'Symbolizes wisdom, flow, and wealth (water represents wealth). Suitable for meditation, thinking, and communication.',
    applications: ['冥想空间', '创意工作'],
    icon: <Droplets className="w-6 h-6" />,
    gradient: 'from-water via-star-dust to-bg-primary',
  },
  {
    id: 'fire',
    element: '火',
    colorName: 'Red / Purple',
    colors: [
      { name:  '正红', hex: '#ef4444' },
      { name: 'Purple', hex: '#a855f7' },
      { name:  '橙红', hex: '#f97316' },
    ],
    description:
      '火元素代表热情、礼仪与光耀。在色彩中对应红色、紫色和橙色，象征活力、热情与高贵。',
    meaning: 'Symbolizes passion, vitality, and fame. Suitable for boosting self-confidence and social charm.',
    applications: ['社交活动', '餐饮行业'],
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-amber-glow via-cinnabar-red to-nebula-purple',
  },
  {
    id: 'earth',
    element: '土',
    colorName: 'Yellow / Brown',
    colors: [
      { name:  '黄色', hex: '#eab308' },
      { name:  '棕色', hex: '#78350f' },
      { name:  '米白', hex: '#f5f5f4' },
    ],
    description:
      '土元素代表稳定、包容与承载。在色彩中对应黄色、棕色和米色，象征踏实、信任与根基。',
    meaning: '象征稳定、信任与根基。适合营造安全感和长期规划。',
    applications: ['卧室布局', '稳定规划'],
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
            <span>五行色彩理论</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary font-display">
            五行色彩匹配
          </h1>
          <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
            探索五行（金、木、水、火、土）与五色（白、绿、黑、红、黄）之间的神秘联系。
            通过色彩平衡提升能量场与运势。
          </p>
        </div>

        {/* 核心展示区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧: 五行选择器 */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              选择你的五行
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
                      对应色彩
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
                          风水寓意
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
                      适用场景
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
                            办公环境
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            金融行业
                          </span>
                        </>
                      )}
                      {activeId === 'wood' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            家居装饰
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            健康养生
                          </span>
                        </>
                      )}
                      {activeId === 'water' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            冥想空间
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            创意工作
                          </span>
                        </>
                      )}
                      {activeId === 'fire' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            社交活动
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            餐饮行业
                          </span>
                        </>
                      )}
                      {activeId === 'earth' && (
                        <>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            卧室布局
                          </span>
                          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-tertiary">
                            稳定规划
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
    </main>
  );
}
