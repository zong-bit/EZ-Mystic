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
    season: 'Autumn',
    organ: 'Lungs / Large Intestine',
    flavor: 'Pungent (Spicy)',
    foods: [
      'White Radish (Daikon)',
      'Onions & Garlic',
      'Almonds & Walnuts',
      'White Mushrooms',
      'Chicken & Pork',
    ],
    advice:
      'Focus on warming, cooked foods to protect lung energy. Avoid excessive raw/cold foods.',
  },
  {
    key: 'wood',
    name: '木 (Wood)',
    color: 'text-wood',
    borderColor: 'border-wood/30',
    bgColor: 'bg-wood/10',
    icon: Leaf,
    season: 'Spring',
    organ: 'Liver / Gallbladder',
    flavor: 'Sour',
    foods: [
      'Leafy Greens (Spinach/Kale)',
      'Lemons & Lime',
      'Cruciferous Vegetables',
      'Fermented Foods (Kimchi)',
      'Buckwheat',
    ],
    advice:
      'Eat fresh, sprouting foods to support detoxification. Incorporate sour flavors to nourish the liver.',
  },
  {
    key: 'water',
    name: '水 (Water)',
    color: 'text-water',
    borderColor: 'border-water/30',
    bgColor: 'bg-water/10',
    icon: Droplets,
    season: 'Winter',
    organ: 'Kidneys / Bladder',
    flavor: 'Salty',
    foods: [
      'Black Beans & Sesame',
      'Seaweed & Kelp',
      'Fish & Seafood',
      'Dark Chocolate',
      'Bone Broth',
    ],
    advice:
      'Consume warming, salty foods to store energy. Avoid excessive cold drinks that drain kidney essence.',
  },
  {
    key: 'fire',
    name: '火 (Fire)',
    color: 'text-fire',
    borderColor: 'border-fire/30',
    bgColor: 'bg-fire/10',
    icon: Flame,
    season: 'Summer',
    organ: 'Heart / Small Intestine',
    flavor: 'Bitter',
    foods: [
      'Red Berries & Cherries',
      'Tomatoes & Red Peppers',
      'Bitter Melon',
      'Coffee & Dark Roast',
      'Lean Beef',
    ],
    advice:
      'Keep cool and hydrated. Eat light, bitter foods to clear heart heat. Avoid overly spicy foods.',
  },
  {
    key: 'earth',
    name: '土 (Earth)',
    color: 'text-earth',
    borderColor: 'border-earth-brown/30',
    bgColor: 'bg-earth/10',
    icon: Wheat,
    season: 'Late Summer',
    organ: 'Spleen / Stomach',
    flavor: 'Sweet',
    foods: [
      'Squash & Pumpkin',
      'Sweet Potatoes',
      'Brown Rice & Millet',
      'Dates & Figs',
      'Ginger & Turmeric',
    ],
    advice:
      'Eat warm, cooked, easy-to-digest meals. Avoid raw salads and excessive dairy that creates dampness.',
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
              Five Elements Diet
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-4 font-display">
              Nourish Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-amber-glow to-nebula-purple">
                Destiny
              </span>
            </h1>
            <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
              Align your diet with the cosmic rhythms of the Five Elements.
              Discover which foods support your body&apos;s natural energy flow
              based on the current season.
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
                      Associated Organs
                    </h3>
                    <p className="text-text-tertiary font-mono text-sm">
                      {currentData.organ}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-gold-primary" />
                      Primary Flavor
                    </h3>
                    <p className="text-text-tertiary font-mono text-sm">
                      {currentData.flavor}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">
                  Dietary Principle
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
                Recommended Foods
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
    </div>
  );
}
