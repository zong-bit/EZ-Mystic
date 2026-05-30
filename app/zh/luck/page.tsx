'use client';

import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  MapPin,
  Palette,
  Hash,
  Sparkles,
  ShieldAlert,
  Leaf,
  Gem,
  Coffee,
  ArrowRight,
  Calendar,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Mock Data & Logic
// -----------------------------------------------------------------------------

const getDailyLuck = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const seed = (day * 31 + month * 17) % 100;

  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const currentElement = elements[seed % 5];

  const attributes: Record<
    string,
    {
      luckyColors: string[];
      luckyNumbers: number[];
      luckyDirection: string;
      luckyItem: string;
      luckyIcon: React.ElementType;
      avoid: string;
      tip: string;
    }
  > = {
    Wood: {
      luckyColors: ['#22c55e', '#16a34a'],
      luckyNumbers: [3, 8],
      luckyDirection: 'East',
      luckyItem: 'Bamboo Plant',
      luckyIcon: Leaf,
      avoid: 'White/Metal (Chopping Wood)',
      tip: 'Great day for growth and new beginnings.',
    },
    Fire: {
      luckyColors: ['#ef4444', '#f97316'],
      luckyNumbers: [2, 7],
      luckyDirection: 'South',
      luckyItem: 'Candle Light',
      luckyIcon: Sun,
      avoid: 'Black/Water (Extinguishing Fire)',
      tip: 'High energy day. Ideal for social activities.',
    },
    Earth: {
      luckyColors: ['#854d0e', '#a8a29e'],
      luckyNumbers: [5, 0],
      luckyDirection: 'Center / Southwest',
      luckyItem: 'Ceramic Vase',
      luckyIcon: Gem,
      avoid: 'Green/Wood (Roots in Earth)',
      tip: 'Stability is key. Focus on grounding exercises.',
    },
    Metal: {
      luckyColors: ['#f5f5f4', '#94a3b8'],
      luckyNumbers: [4, 9],
      luckyDirection: 'West',
      luckyItem: 'Silver Jewelry',
      luckyIcon: ShieldAlert,
      avoid: 'Red/Fire (Melting Metal)',
      tip: 'Time for precision and decision making.',
    },
    Water: {
      luckyColors: ['#1e3a8a', '#3b82f6'],
      luckyNumbers: [1, 6],
      luckyDirection: 'North',
      luckyItem: 'Sea Salt Bowl',
      luckyIcon: Moon,
      avoid: 'Yellow/Earth (Blocking Water)',
      tip: 'Trust your intuition today. Good for planning.',
    },
  };

  return {
    element: currentElement,
    ...attributes[currentElement],
    dateStr: date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  };
};

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const GlassCard = ({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl transition-all duration-300 ${
      hover && 'hover:border-white/20 hover:bg-white/[0.05] hover:translate-y-[-2px]'
    } ${className}`}
  >
    {children}
  </div>
);

const LuckyItemCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  colorHex,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  colorHex?: string;
}) => (
  <GlassCard className="p-6 flex flex-col items-start gap-4 group cursor-default">
    <div className="flex items-center gap-3 w-full">
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-secondary group-hover:text-gold-primary group-hover:border-gold-primary/30 transition-colors">
        <Icon size={24} />
      </div>
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </span>
    </div>

    <div className="w-full">
      <h3 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
        {value}
      </h3>
      {subtext && (
        <p className="text-sm text-text-tertiary">{subtext}</p>
      )}
    </div>

    {colorHex && (
      <div className="flex gap-2 mt-2">
        {colorHex.split(',').map((c, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: c.trim() }}
          />
        ))}
      </div>
    )}
  </GlassCard>
);

// -----------------------------------------------------------------------------
// Main Page Component
// -----------------------------------------------------------------------------

export default function LuckPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [luckData, setLuckData] = useState<ReturnType<typeof getDailyLuck> | null>(null);

  useEffect(() => {
    setLuckData(getDailyLuck(currentDate));
  }, [currentDate]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  if (!luckData) return null;

  const LuckyIcon = luckData.luckyIcon;

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary/30 selection:text-gold-light pb-20">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-nebula-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gold-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
        {/* Header Section */}
        <header className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gold-primary mb-4">
            <Sparkles size={12} />
            <span>Daily Fortune</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-4 font-display">
            Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-amber-glow to-nebula-purple">
              Daily Luck
            </span>
          </h1>

          <p className="text-lg text-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Align your actions with the flow of the universe. Discover your lucky
            elements, directions, and colors for the day.
          </p>
        </header>

        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-full hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Previous day"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-text-muted uppercase tracking-widest mb-1">
              Date
            </span>
            <span className="text-xl font-semibold text-text-primary font-display">
              {currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-full hover:bg-white/5 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Next day"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Core Element Card */}
          <GlassCard className="md:col-span-1 p-8 flex flex-col justify-between bg-gradient-to-br from-white/[0.03] to-transparent">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-gold-primary/10 text-gold-primary border border-gold-primary/20">
                  <LuckyIcon size={28} />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                    Dominant Element
                  </h2>
                  <p className="text-2xl font-bold text-text-primary">
                    {luckData.element}
                  </p>
                </div>
              </div>

              <p className="text-text-tertiary leading-relaxed mb-6">
                {luckData.tip}
              </p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Element Cycle</span>
                <span className="text-gold-primary font-mono">Active</span>
              </div>
            </div>
          </GlassCard>

          {/* Lucky Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <LuckyItemCard
              icon={Palette}
              label="Lucky Colors"
              value="Wear These"
              colorHex={luckData.luckyColors.join(',')}
            />
            <LuckyItemCard
              icon={Hash}
              label="Lucky Numbers"
              value={luckData.luckyNumbers.join(' - ')}
              subtext="Use for decisions"
            />
            <LuckyItemCard
              icon={MapPin}
              label="Lucky Direction"
              value={luckData.luckyDirection}
              subtext="Face this way"
            />
            <LuckyItemCard
              icon={Gem}
              label="Open Wealth Item"
              value={luckData.luckyItem}
              subtext="Keep nearby"
            />
          </div>
        </div>

        {/* Warning / Advice Section */}
        <GlassCard className="p-6 md:p-8 mb-8 border-l-4 border-l-cinnabar-red/50 bg-cinnabar-red/5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-cinnabar-red/10 text-cinnabar-red shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Things to Avoid
              </h3>
              <p className="text-text-tertiary leading-relaxed">
                Today, the energy of{' '}
                <strong className="text-text-secondary">
                  {luckData.element}
                </strong>{' '}
                is strong. Avoid colors like{' '}
                <strong className="text-text-secondary">
                  {luckData.avoid.split('/')[0]}
                </strong>{' '}
                as they may clash with your personal resonance. Be cautious
                with financial decisions in the{' '}
                <strong className="text-text-secondary">North</strong> sector.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Footer / Call to Action */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Coffee size={16} />
            <span>Pro tip: Drink water facing North to enhance clarity.</span>
          </div>

          <button className="group relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-gold-primary to-gold-secondary px-8 font-medium text-ink-black shadow-[0_10px_20px_rgba(212,168,83,0.2)] transition-all hover:from-gold-light hover:to-gold-primary hover:shadow-[0_15px_25px_rgba(212,168,83,0.3)] active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              Unlock Full Fortune Report
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>

        {/* AI Master CTA */}
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
      </div>
    </main>
  );
}
