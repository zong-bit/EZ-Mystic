import type { Metadata } from 'next';
import { WU_XING_MAP } from '@/bazi/ganzhi';

// ─── Metadata ────────────────────────────────────────────────────────────────

export function generateMetadata(): Metadata {
  return {
    title: 'FateWise — Heavenly Stems Compatibility · Five Elements Matching',
    description:
      'Explore the Five Elements (Wu Xing) compatibility between the 10 Heavenly Stems. Discover your best matches and compatibility percentages based on traditional Chinese metaphysics.',
    keywords: [
      'heavenly stems compatibility',
      'Wu Xing matching',
      'Five Elements compatibility',
      'Bazi compatibility',
      'Chinese astrology matching',
      'Tian Gan matching',
      '五行匹配',
      '天干合婚',
    ],
    authors: [{ name: 'FateWise' }],
    creator: 'FateWise',
    publisher: 'FateWise',
    metadataBase: new URL('https://bornchart.app'),
    alternates: {
      canonical: 'https://bornchart.app/compatibility',
    },
    openGraph: {
      title: 'FateWise — Heavenly Stems Compatibility · Five Elements Matching',
      description:
        'Explore the Five Elements compatibility between the 10 Heavenly Stems. Discover your best matches based on traditional Chinese metaphysics.',
      url: 'https://bornchart.app/compatibility',
      siteName: 'FateWise',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'FateWise - Heavenly Stems Compatibility',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FateWise — Heavenly Stems Compatibility · Five Elements Matching',
      description:
        'Explore the Five Elements compatibility between the 10 Heavenly Stems. Discover your best matches based on traditional Chinese metaphysics.',
      images: ['/og-image.png'],
      creator: '@fatewise',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

interface Match {
  stem: string;
  percentage: number;
}

interface StemCompatibility {
  stem: string;
  element: string;
  elementColor: string;
  matches: Match[];
}

const COMPATIBILITY_DATA: StemCompatibility[] = [
  {
    stem: '甲',
    element: '木',
    elementColor: 'text-wood',
    matches: [
      { stem: '戊', percentage: 70 },
      { stem: '庚', percentage: 60 },
      { stem: '丙', percentage: 80 },
    ],
  },
  {
    stem: '乙',
    element: '木',
    elementColor: 'text-wood',
    matches: [
      { stem: '己', percentage: 75 },
      { stem: '辛', percentage: 55 },
      { stem: '丁', percentage: 85 },
    ],
  },
  {
    stem: '丙',
    element: '火',
    elementColor: 'text-fire',
    matches: [
      { stem: '甲', percentage: 80 },
      { stem: '戊', percentage: 75 },
      { stem: '庚', percentage: 65 },
    ],
  },
  {
    stem: '丁',
    element: '火',
    elementColor: 'text-fire',
    matches: [
      { stem: '乙', percentage: 85 },
      { stem: '己', percentage: 70 },
      { stem: '辛', percentage: 60 },
    ],
  },
  {
    stem: '戊',
    element: '土',
    elementColor: 'text-earth',
    matches: [
      { stem: '丙', percentage: 75 },
      { stem: '庚', percentage: 80 },
      { stem: '壬', percentage: 70 },
    ],
  },
  {
    stem: '己',
    element: '土',
    elementColor: 'text-earth',
    matches: [
      { stem: '丁', percentage: 70 },
      { stem: '辛', percentage: 75 },
      { stem: '癸', percentage: 65 },
    ],
  },
  {
    stem: '庚',
    element: '金',
    elementColor: 'text-metal',
    matches: [
      { stem: '戊', percentage: 80 },
      { stem: '壬', percentage: 85 },
      { stem: '甲', percentage: 60 },
    ],
  },
  {
    stem: '辛',
    element: '金',
    elementColor: 'text-metal',
    matches: [
      { stem: '己', percentage: 75 },
      { stem: '癸', percentage: 80 },
      { stem: '乙', percentage: 55 },
    ],
  },
  {
    stem: '壬',
    element: '水',
    elementColor: 'text-water',
    matches: [
      { stem: '庚', percentage: 85 },
      { stem: '甲', percentage: 70 },
      { stem: '丙', percentage: 65 },
    ],
  },
  {
    stem: '癸',
    element: '水',
    elementColor: 'text-water',
    matches: [
      { stem: '辛', percentage: 80 },
      { stem: '乙', percentage: 75 },
      { stem: '丁', percentage: 60 },
    ],
  },
];

const ELEMENT_NAMES: Record<string, { cn: string; en: string }> = {
  '木': { cn: '木 Wood', en: 'Wood' },
  '火': { cn: '火 Fire', en: 'Fire' },
  '土': { cn: '土 Earth', en: 'Earth' },
  '金': { cn: '金 Metal', en: 'Metal' },
  '水': { cn: '水 Water', en: 'Water' },
};

function getPercentageColor(pct: number): string {
  if (pct >= 80) return 'text-gold-primary';
  if (pct >= 70) return 'text-yi-green';
  if (pct >= 60) return 'text-text-primary';
  return 'text-text-secondary';
}

function getPercentageBg(pct: number): string {
  if (pct >= 80) return 'bg-gold-primary/15 border-gold-primary/30';
  if (pct >= 70) return 'bg-yi-green/10 border-yi-green/20';
  if (pct >= 60) return 'bg-white/5 border-white/10';
  return 'bg-white/5 border-white/5';
}

function getBarColor(pct: number): string {
  if (pct >= 80) return 'bg-gold-primary';
  if (pct >= 70) return 'bg-yi-green';
  if (pct >= 60) return 'bg-text-primary';
  return 'bg-text-secondary';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StemCard({ data }: { data: StemCompatibility }) {
  const bestMatch = data.matches[0];
  const elementInfo = ELEMENT_NAMES[data.element];

  return (
    <div className="glass-card p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-display font-bold ${data.elementColor}`}>
            {data.stem}
          </span>
          <div>
            <div className="text-sm font-medium text-text-primary">{elementInfo?.cn}</div>
            <div className="text-xs text-text-tertiary">Best match</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getPercentageColor(bestMatch.percentage)}`}>
            {bestMatch.percentage}%
          </div>
          <div className="text-xs text-text-tertiary">top match</div>
        </div>
      </div>

      {/* Best match highlight */}
      <div className="mb-4 px-4 py-3 rounded-xl border bg-gold-primary/5 border-gold-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-display font-bold ${data.elementColor}`}>{data.stem}</span>
            <span className="text-text-tertiary text-sm">↔</span>
            <span className={`text-xl font-display font-bold text-gold-primary`}>{bestMatch.stem}</span>
          </div>
          <span className="text-gold-primary font-bold text-lg">{bestMatch.percentage}%</span>
        </div>
      </div>

      {/* All matches */}
      <div className="space-y-2.5 flex-grow">
        {data.matches.map((match, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg border ${getPercentageBg(match.percentage)}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${data.elementColor}`}>{data.stem}</span>
                <span className="text-text-tertiary text-xs">↔</span>
                <span className={`text-sm font-medium ${getPercentageColor(match.percentage)}`}>{match.stem}</span>
              </div>
              <span className={`text-sm font-bold ${getPercentageColor(match.percentage)}`}>
                {match.percentage}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(match.percentage)}`}
                style={{ width: `${match.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CompatibilityPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
          <div className="mb-3">
            <span className="text-gold-primary text-sm font-display tracking-widest">✦ WU XING MATCHING ✦</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3 text-gold-glow">
            Heavenly Stems Compatibility
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            Explore the Five Elements (Wu Xing) compatibility between the 10 Heavenly Stems. Discover your best matches based on traditional Chinese metaphysics.
          </p>
        </div>
      </section>

      {/* ─── Element Legend ─── */}
      <section className="px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-text-tertiary text-xs uppercase tracking-wider">Elements:</span>
            {Object.entries(ELEMENT_NAMES).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`font-bold ${
                  key === '木' ? 'text-wood' :
                  key === '火' ? 'text-fire' :
                  key === '土' ? 'text-earth' :
                  key === '金' ? 'text-metal' :
                  'text-water'
                }`}>{key}</span>
                <span className="text-text-tertiary text-xs">{val.en}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* 10 Stem Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {COMPATIBILITY_DATA.map((data) => (
              <StemCard key={data.stem} data={data} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center text-text-muted text-xs py-8">
            ⚠️ Based on traditional Chinese metaphysics and Five Elements theory, for reference and entertainment only.
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <div className="inline-block glass-card px-8 py-6 border-gold-primary/30">
              <p className="text-text-secondary mb-3">
                Want personalized compatibility analysis?
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
      </section>
    </div>
  );
}
