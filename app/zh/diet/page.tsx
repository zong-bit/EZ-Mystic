'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Droplets,
  Flame,
  Mountain,
  Wheat,
  UtensilsCrossed,
  HeartPulse,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

// --- 数据定义 ---

const ELEMENTS = [
  {
    key: 'metal',
    name: '金 (Metal)',
    color: 'text-metal-white',
    borderColor: 'border-metal-white/30',
    bgColor: 'bg-metal-white/10',
    icon: Mountain,
    season: '秋季',
    organ: '肺 / 大肠',
    flavor: '辛味（辛辣）',
    foods: [
      '白萝卜',
      '洋葱与大蒜',
      '杏仁与核桃',
      '白蘑菇',
      '鸡肉与猪肉',
    ],
    advice:
      '注重温热熟食以护肺气，避免过多生冷食物。',
  },
  {
    key: 'wood',
    name: '木 (Wood)',
    color: 'text-wood',
    borderColor: 'border-wood/30',
    bgColor: 'bg-wood/10',
    icon: Leaf,
    season: '春季',
    organ: '肝 / 胆',
    flavor: '酸味',
    foods: [
      '绿叶蔬菜（菠菜/羽衣甘蓝）',
      '柠檬与青柠',
      '十字花科蔬菜',
      '发酵食品（泡菜）',
      '荞麦',
    ],
    advice:
      '多吃新鲜芽菜类食物帮助排毒，适当酸味养肝。',
  },
  {
    key: 'water',
    name: '水 (Water)',
    color: 'text-water',
    borderColor: 'border-water/30',
    bgColor: 'bg-water/10',
    icon: Droplets,
    season: '冬季',
     organ: '肾 / 膀胱',
     flavor: '咸味',
    foods: [
       '黑豆与芝麻',
      '海藻与海带',
      '鱼类与海鲜',
       '黑巧克力',
       '骨汤',
    ],
    advice:
      '食用温热、咸味食物以藏精，避免过多冷饮耗伤肾精。',
  },
  {
    key: 'fire',
    name: '火 (Fire)',
    color: 'text-fire',
    borderColor: 'border-fire/30',
    bgColor: 'bg-fire/10',
    icon: Flame,
     season: '夏季',
     organ: '心 / 小肠',
     flavor: '苦味',
    foods: [
       '红莓与樱桃',
       '番茄与红椒',
       '苦瓜',
       '咖啡与深焙咖啡',
       '瘦牛肉',
    ],
    advice:
      '保持清凉补水，食用清淡苦味食物以清心火，避免过度辛辣。',
  },
  {
    key: 'earth',
    name: '土 (Earth)',
    color: 'text-earth',
    borderColor: 'border-earth-brown/30',
    bgColor: 'bg-earth/10',
    icon: Wheat,
     season: '长夏',
     organ: '脾 / 胃',
     flavor: '甜味',
    foods: [
       '南瓜与冬瓜',
       '红薯',
       '糙米与小米',
       '红枣与无花果',
       '生姜与姜黄',
    ],
    advice:
      '食用温热、熟食、易消化的餐食，避免生冷沙拉和过多乳制品以祛湿。',
  },
];

const getSeason = (month: number) => {
  if (month >= 2 && month <= 4) return 'wood';
  if (month >= 5 && month <= 7) return 'fire';
  if (month >= 8 && month <= 10) return 'metal';
  if (month >= 11 || month <= 1) return 'water';
  return 'earth';
};

// --- 子组件 ---

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] ${className}`}
  >
    {children}
  </div>
);

const TabButton = ({
  isActive,
  onClick,
  icon: Icon,
  label,
  colorClass,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  colorClass: string;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/10 text-white shadow-lg'
        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
    }`}
  >
    {isActive && (
      <div
        className={`absolute inset-0 rounded-xl border ${colorClass} bg-white/[0.03]`}
      />
    )}
    <Icon
      className={`h-5 w-5 ${
        isActive ? colorClass : 'text-zinc-500 group-hover:text-zinc-300'
      }`}
    />
    <span className="relative z-10">{label}</span>
  </button>
);

// --- 主页面组件 ---

export default function DietPage() {
  const [activeElement, setActiveElement] = useState<string>('metal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const currentSeason = getSeason(now.getMonth() + 1);
    setActiveElement(currentSeason);
  }, []);

  if (!mounted) return null;

  const currentData =
    ELEMENTS.find((el) => el.key === activeElement) || ELEMENTS[0];
  const Icon = currentData.icon;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary/30">
      {/* 背景装饰 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nebula-purple/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-primary/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 max-w-5xl">
        {/* 头部区域 */}
        <header className="text-center mb-16 space-y-6">
          <div>
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-gold-primary uppercase bg-gold-primary/10 rounded-full border border-gold-primary/20">
              五行饮食
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-4 font-display">
              滋养你的{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-amber-glow to-nebula-purple">
                Destiny
              </span>
            </h1>
            <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
              将饮食与五行宇宙节律相协调。
              发现哪些食物能支持你身体自然的能量流动
              基于当前季节。
            </p>
          </div>
        </header>

        {/* 导航选项卡 */}
        <nav className="flex flex-wrap justify-center gap-3 mb-12" role="tablist">
          {ELEMENTS.map((el) => {
            const EIcon = el.icon;
            return (
              <TabButton
                key={el.key}
                isActive={activeElement === el.key}
                onClick={() => setActiveElement(el.key)}
                icon={EIcon}
                label={el.name}
                colorClass={el.color}
              />
            );
          })}
        </nav>

        {/* 内容展示区 */}
        <div
          key={activeElement}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* 左侧：核心信息 */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-8 h-full flex flex-col justify-between border-t-4 border-t-transparent hover:border-t-gold-primary/50 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-3 rounded-xl ${currentData.bgColor} ${currentData.color}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary font-display">
                      {currentData.name}
                    </h2>
                    <p className="text-xs text-text-tertiary uppercase tracking-wider">
                      {currentData.season} Element
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-gold-primary" />
                      关联器官
                    </h3>
                    <p className="text-text-tertiary font-mono text-sm">
                      {currentData.organ}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-gold-primary" />
                      主要口味
                    </h3>
                    <p className="text-text-tertiary font-mono text-sm">
                      {currentData.flavor}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">
                  饮食原则
                </h3>
                <p className="text-text-tertiary leading-relaxed text-sm">
                  &quot;{currentData.advice}&quot;
                </p>
              </div>
            </GlassCard>
          </div>

          {/* 右侧：推荐食物列表 */}
          <div className="lg:col-span-7">
            <GlassCard className="p-8 h-full">
              <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${currentData.color}`} />
                推荐食物
              </h3>
              <ul className="space-y-4">
                {currentData.foods.map((food, index) => (
                  <li
                    key={food}
                    className={`group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-default`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${currentData.bgColor.replace('/10', '')} ${currentData.color.replace('text-', 'bg-')}`}
                      />
                      <span className="text-text-secondary font-medium">
                        {food}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-16 text-center">
          <p className="text-text-muted text-sm">
            Based on Traditional Chinese Medicine (TCM) principles. Consult a
            healthcare professional for personalized advice.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
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
    </div>
  );
}
