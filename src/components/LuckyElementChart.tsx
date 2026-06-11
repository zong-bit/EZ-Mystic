// src/components/LuckyElementChart.tsx
// Five Elements (五行) visualization — SVG donut + bar chart.
// Zero external dependencies; matches Celestial Ink design system.

'use client';

import React, { useMemo } from 'react';

// Re-export types from bazi-calculator for consumer convenience
export type { ElementStat, MissingInfo, LuckyElementInfo } from '@/lib/bazi-calculator';

// Internal use (same types)
import type { ElementStat, MissingInfo, LuckyElementInfo } from '@/lib/bazi-calculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WuxingChartProps {
  distribution: ElementStat[];
  missingElements?: MissingInfo[];
}

export interface LuckyElementListProps {
  elements: LuckyElementInfo[];
  dayMasterElement?: string;
}

// ---------------------------------------------------------------------------
// SVG Donut Chart — Five Elements Ring
// ---------------------------------------------------------------------------

const WUXING_COLORS: Record<string, string> = {
  '木': '#4ADE80',
  '火': '#F87171',
  '土': '#FBBF24',
  '金': '#E2E8F0',
  '水': '#60A5FA',
};

const WUXING_GLOW: Record<string, string> = {
  '木': '#4ADE80',
  '火': '#F87171',
  '土': '#FBBF24',
  '金': '#E2E8F0',
  '水': '#60A5FA',
};

const WUXING_CN: Record<string, string> = { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' };
const WUXING_EN: Record<string, string> = { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' };

const CX = 100;
const CY = 100;
const OUTER_R = 88;
const INNER_R = 56;

/** Compute SVG arc path for a donut segment. */
function arcPath(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1o = cx + outerR * Math.cos(toRad(startAngle));
  const y1o = cy + outerR * Math.sin(toRad(startAngle));
  const x2o = cx + outerR * Math.cos(toRad(endAngle));
  const y2o = cy + outerR * Math.sin(toRad(endAngle));
  const x1i = cx + innerR * Math.cos(toRad(endAngle));
  const y1i = cy + innerR * Math.sin(toRad(endAngle));
  const x2i = cx + innerR * Math.cos(toRad(startAngle));
  const y2i = cy + innerR * Math.sin(toRad(startAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${x1o} ${y1o}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x1i} ${y1i}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x2i} ${y2i}`,
    'Z',
  ].join(' ');
}

/** Build SVG path data array for a donut chart from element stats. */
function buildDonutPaths(distribution: ElementStat[]): { path: string; element: string; pct: number }[] {
  const total = distribution.reduce((sum, d) => sum + d.totalScore, 0) || 1;
  let currentAngle = 0;

  return distribution.map(({ element, totalScore }) => {
    const pct = (totalScore / total) * 100;
    const sweepAngle = (totalScore / total) * 360;
    const path = arcPath(CX, CY, OUTER_R, INNER_R, currentAngle, currentAngle + sweepAngle);
    currentAngle += sweepAngle;
    return { path, element, pct };
  });
}

// ---------------------------------------------------------------------------
// Donut Chart Component
// ---------------------------------------------------------------------------

export function WuxingDonutChart({ distribution, missingElements }: WuxingChartProps) {
  const paths = useMemo(() => buildDonutPaths(distribution), [distribution]);
  const missingSet = new Set(missingElements?.map((m) => m.element));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Donut */}
      <div className="relative" role="img" aria-label="Five Elements distribution donut chart">
        <svg viewBox="0 0 200 200" className="w-56 h-56 md:w-72 md:h-72 drop-shadow-lg">
          {paths.map(({ path, element }) => (
            <path
              key={element}
              d={path}
              fill={WUXING_COLORS[element] || '#64748B'}
              className="transition-all duration-500"
              style={{
                opacity: missingSet.has(element) ? 0.5 : 1,
                filter: `drop-shadow(0 0 4px ${WUXING_GLOW[element] || 'transparent'})`,
              }}
            />
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-widest">五行</p>
            <p className="text-xs text-text-secondary font-mono mt-0.5">Wu Xing</p>
          </div>
        </div>

        {/* Missing element indicators (small dots around the ring) */}
        {missingElements?.map(({ element, severity }) => (
          <div
            key={element}
            className="absolute w-3 h-3 rounded-full border-2"
            style={{
              backgroundColor: WUXING_COLORS[element],
              borderColor: severity === 'severe' ? '#EF4444' : '#F59E0B',
              boxShadow: severity === 'severe' ? `0 0 8px ${WUXING_COLORS[element]}` : undefined,
              top: '6%',
              right: `${['木', '火', '土', '金', '水'].indexOf(element) * 18 + 5}%`,
            }}
            title={`${element} (${severity === 'severe' ? 'Severely Missing' : 'Mildly Weak'})`}
            aria-label={`${element} element ${severity === 'severe' ? 'severely missing' : 'weak'}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 gap-2 text-center" role="list" aria-label="Five Elements legend">
        {distribution.map(({ element, totalScore }) => (
          <div key={element} className="flex flex-col items-center gap-1" role="listitem">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: `${WUXING_COLORS[element]}20`, color: WUXING_COLORS[element], border: `1px solid ${WUXING_COLORS[element]}40` }}
            >
              {WUXING_CN[element]}
            </div>
            <span className="text-[10px] text-text-muted">{WUXING_EN[element]}</span>
            <span className="text-xs font-semibold" style={{ color: WUXING_COLORS[element] }}>
              {totalScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bar Chart — Five Elements Distribution (horizontal bars)
// ---------------------------------------------------------------------------

export function WuxingBarChart({ distribution }: WuxingChartProps) {
  const maxScore = Math.max(...distribution.map((d) => d.totalScore), 1);

  return (
    <div className="space-y-3" role="list" aria-label="Five Elements bar chart">
      {distribution.map(({ element, directCount, hiddenWeight, totalScore }) => (
        <div key={element} className="flex items-center gap-3" role="listitem">
          {/* Label */}
          <div className="w-20 text-right flex-shrink-0">
            <span className="text-lg font-bold" style={{ color: WUXING_COLORS[element] }}>
              {WUXING_CN[element]}
            </span>
            <span className="text-xs text-text-muted ml-1">{WUXING_EN[element]}</span>
          </div>

          {/* Bar track */}
          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
            {/* Direct count bar */}
            <div
              className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5"
              style={{
                width: `${(directCount / maxScore) * 100}%`,
                backgroundColor: WUXING_COLORS[element],
              }}
            >
              <span className="text-[10px] font-bold text-black/70">{directCount}</span>
            </div>

            {/* Hidden weight overlay */}
            {hiddenWeight > 0 && (
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5"
                style={{
                  width: `${((directCount + hiddenWeight) / maxScore) * 100}%`,
                  backgroundColor: `${WUXING_COLORS[element]}60`,
                }}
              >
                <span className="text-[10px] font-bold text-white/90">{totalScore.toFixed(1)}</span>
              </div>
            )}

            {/* Score label */}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted">
              {totalScore.toFixed(1)}
            </span>
          </div>
        </div>
      ))}

      {/* Summary */}
      <p className="text-xs text-text-muted pt-2 border-t border-white/5">
        Direct count (solid) + hidden stem weight (overlay). Max score: {maxScore.toFixed(1)}.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Missing Elements List
// ---------------------------------------------------------------------------

export function MissingElementsList({ missingElements }: { missingElements: MissingInfo[] }) {
  if (missingElements.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-xl">✦</span>
        <div>
          <p className="font-semibold text-emerald-400">Five Elements are Well Balanced</p>
          <p className="text-xs text-text-secondary mt-0.5">All elements are present in your chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Missing elements list">
      {missingElements.map(({ element, totalScore, severity }) => (
        <div
          key={element}
          className="flex items-center gap-3 p-4 rounded-xl border transition-colors"
          style={{
            backgroundColor: `${WUXING_COLORS[element]}08`,
            borderColor: severity === 'severe' ? `${WUXING_COLORS[element]}30` : `${WUXING_COLORS[element]}20`,
          }}
          role="listitem"
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: `${WUXING_COLORS[element]}15`, color: WUXING_COLORS[element] }}
          >
            {WUXING_CN[element]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary">{WUXING_EN[element]}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {severity === 'severe' ? (
                <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                  Severely Missing
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  Weak
                </span>
              )}
            </div>
          </div>

          {/* Score */}
          <span className="text-xl font-bold font-mono flex-shrink-0" style={{ color: WUXING_COLORS[element] }}>
            {totalScore.toFixed(1)}
          </span>
        </div>
      ))}

      <p className="text-xs text-text-muted pt-2">
        The lower the score, the more this element is needed in your life.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lucky Elements Recommendation Cards
// ---------------------------------------------------------------------------

export function LuckyElementRecommendations({ elements, dayMasterElement }: LuckyElementListProps) {
  if (elements.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Lucky element recommendations">
      {elements.map(({ element, color, colorsText, numbers, direction, season, itemEn, description }) => (
        <div
          key={element}
          className="p-5 rounded-xl border transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: `${color}06`,
            borderColor: `${color}25`,
          }}
          role="listitem"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: `${color}15`, color }}
            >
              {WUXING_CN[element]}
            </div>
            <div>
              <p className="font-bold text-text-primary">{WUXING_EN[element]}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Colors</p>
              <div className="flex gap-1.5 mt-0.5">
                {colorsText.split(',').map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: c.trim() }} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Numbers</p>
              <p className="font-mono text-text-primary">{numbers.join(', ')}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Direction</p>
              <p className="text-text-primary">{direction}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Season</p>
              <p className="text-text-primary">{season}</p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Lucky Item</p>
              <p className="text-text-primary">{itemEn}</p>
            </div>
          </div>

          {/* Day Master tag */}
          {dayMasterElement && element === dayMasterElement && (
            <div className="mt-3 pt-2 border-t border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-gold-primary font-medium">
                ✦ Your Day Master Element (日主)
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Combined Dashboard Layout — all charts + recommendations in one view
// ---------------------------------------------------------------------------

export function WuxingDashboard({ distribution, missingElements, luckyElements }: {
  distribution: ElementStat[];
  missingElements?: MissingInfo[];
  luckyElements?: LuckyElementInfo[];
}) {
  return (
    <div className="space-y-8">
      {/* Section 1: Donut Chart */}
      <section aria-label="Five Elements distribution">
        <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
          Five Elements Distribution · 五行分布
        </h3>
        <div className="flex justify-center">
          <WuxingDonutChart distribution={distribution} missingElements={missingElements} />
        </div>
      </section>

      {/* Section 2: Bar Chart */}
      <section aria-label="Detailed Five Elements breakdown">
        <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
          Detailed Breakdown · 详细分析
        </h3>
        <WuxingBarChart distribution={distribution} />
      </section>

      {/* Section 3: Missing Elements */}
      {missingElements && missingElements.length > 0 && (
        <section aria-label="Missing elements">
          <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
            Missing Elements · 缺失元素
          </h3>
          <MissingElementsList missingElements={missingElements} />
        </section>
      )}

      {/* Section 4: Lucky Element Recommendations */}
      {luckyElements && luckyElements.length > 0 && (
        <section aria-label="Lucky element recommendations">
          <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
            Lucky Element Recommendations · 幸运元素推荐
          </h3>
          <LuckyElementRecommendations elements={luckyElements} />
        </section>
      )}

      {/* CTA */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-text-secondary text-sm mb-4">
          Want a complete destiny analysis based on your full Bazi chart?
        </p>
        <a
          href="/bazi"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95"
        >
          Get Your Full Bazi Chart
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
      </div>
    </div>
  );
}
