// src/lib/bazi-calculator.ts
// Five Elements analysis for lucky-element-finder tool.
// Reuses constants from src/bazi/ganzhi.ts; no API calls needed (pure frontend).

import {
  WU_XING_MAP,
  ZHI_WU_XING_MAP,
  ZHI_CANG_GAN,
} from '@/bazi/ganzhi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ElementStat {
  element: string;        // 木/火/土/金/水
  directCount: number;    // count from 4 stems + 4 branches (0-8)
  hiddenWeight: number;   // weighted contribution from hidden stems (0-2.5)
  totalScore: number;     // directCount + hiddenWeight, rounded to 1dp
}

export type MissingSeverity = 'severe' | 'mild';

export interface MissingInfo {
  element: string;
  totalScore: number;
  severity: MissingSeverity; // severe = 0, mild = <2.5
}

export interface LuckyElementInfo {
  element: string;
  color: string;
  colorsText: string;
  numbers: number[];
  direction: string;
  season: string;
  itemEn: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants — traditional Chinese metaphysical associations
// ---------------------------------------------------------------------------

const ELEMENT_META: Record<string, LuckyElementInfo> = {
  '木': {
    element: '木', color: '#4ADE80', colorsText: '#2D8B57, #16a34a',
    numbers: [3, 8], direction: 'East (东)', season: 'Spring (春)',
    itemEn: 'Bamboo / Plants',
    description: 'Wood represents growth, vitality, and expansion. Enhance with green tones, wooden objects, or spending time in nature.',
  },
  '火': {
    element: '火', color: '#F87171', colorsText: '#DC2626, #ef4444',
    numbers: [2, 7], direction: 'South (南)', season: 'Summer (夏)',
    itemEn: 'Candle / Lantern',
    description: 'Fire embodies passion, transformation, and social energy. Boost with red accents, candles, or south-facing spaces.',
  },
  '土': {
    element: '土', color: '#FBBF24', colorsText: '#92400E, #a8a29e',
    numbers: [5, 10], direction: 'Center / SW (西南)', season: 'Late Summer',
    itemEn: 'Ceramic Stone',
    description: 'Earth symbolizes stability, nourishment, and groundedness. Strengthen with earth tones, ceramics, or crystals.',
  },
  '金': {
    element: '金', color: '#E2E8F0', colorsText: '#94a3b8, #f5f5f4',
    numbers: [4, 9], direction: 'West (西)', season: 'Autumn (秋)',
    itemEn: 'Silver Metal',
    description: 'Metal represents clarity, precision, and decisiveness. Enhance with white/silver tones, metal objects, or western exposure.',
  },
  '水': {
    element: '水', color: '#60A5FA', colorsText: '#1e3a8a, #3b82f6',
    numbers: [1, 6], direction: 'North (北)', season: 'Winter (冬)',
    itemEn: 'Crystal / Sea Salt',
    description: 'Water embodies wisdom, flow, and introspection. Boost with blue tones, water features, or northern placement.',
  },
};

// Generation cycle: what produces this element (its "parent")
const GENERATION_PARENT: Record<string, string> = {
  '木': '水', // Water → Wood
  '火': '木', // Wood → Fire
  '土': '火', // Fire → Earth
  '金': '土', // Earth → Metal
  '水': '金', // Metal → Water
};

// ---------------------------------------------------------------------------
// Five Elements Distribution Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the Five Elements distribution from a Bazi chart.
 * Direct count = each stem/branch contributes 1 point for its element.
 * Hidden weight = weighted contribution from hidden stems in earthly branches (weight / 8).
 */
export function calcWuxingDistribution(
  allStems: string[], // e.g. ['甲', '丙', '戊', '庚']
  allZhis: string[],  // e.g. ['巳', '子', '寅', '午']
): ElementStat[] {
  const elements = ['木', '火', '土', '金', '水'];

  const directCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const hiddenWeight: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // Direct: stems (4) + branches (4)
  for (const g of allStems) {
    const wx = WU_XING_MAP[g];
    if (wx) directCount[wx]++;
  }
  for (const z of allZhis) {
    const wx = ZHI_WU_XING_MAP[z];
    if (wx) directCount[wx]++;
  }

  // Hidden: cang gan in each earthly branch, weighted by /8
  for (const z of allZhis) {
    const cangGan = ZHI_CANG_GAN[z] || [];
    for (const { gan, weight } of cangGan) {
      const wx = WU_XING_MAP[gan];
      if (wx && weight) {
        hiddenWeight[wx] += weight / 8; // normalize: max ~0.5 per branch
      }
    }
  }

  return elements.map((el) => ({
    element: el,
    directCount: directCount[el],
    hiddenWeight: Math.round(hiddenWeight[el] * 10) / 10,
    totalScore: Math.round((directCount[el] + hiddenWeight[el]) * 10) / 10,
  }));
}

// ---------------------------------------------------------------------------
// Missing Elements Identification
// ---------------------------------------------------------------------------

/**
 * Identify elements missing or weak in the chart, sorted by severity.
 */
export function findMissingElements(distribution: ElementStat[]): MissingInfo[] {
  return distribution
    .filter((d) => d.totalScore < 2.5) // threshold: score below 2.5 = needs attention
    .map((d): MissingInfo => ({
      element: d.element,
      totalScore: d.totalScore,
      severity: d.totalScore <= 0.5 ? 'severe' : 'mild',
    }))
    .sort((a, b) => a.totalScore - b.totalScore); // ascending: most missing first
}

// ---------------------------------------------------------------------------
// Lucky Element Determination
// ---------------------------------------------------------------------------

/**
 * Determine lucky elements for this chart.
 * Priority: missing elements first, then the element that produces the Day Master (印星/resource).
 */
export function determineLuckyElements(
  dayMasterElement: string, // from Day Stem (日干) — e.g. '木'
  missingElements: MissingInfo[],
): LuckyElementInfo[] {
  const luckySet = new Set<string>();

  // Priority 1: missing elements (need supplementation)
  for (const m of missingElements) {
    luckySet.add(m.element);
  }

  // Priority 2: the element that generates the Day Master (印星/resource)
  const resourceElement = GENERATION_PARENT[dayMasterElement];
  if (resourceElement) {
    luckySet.add(resourceElement);
  }

  // If no missing elements, fallback: resource + Day Master itself (比劫/companion)
  if (luckySet.size === 0) {
    luckySet.add(dayMasterElement);
    if (resourceElement) luckySet.add(resourceElement);
  }

  return Array.from(luckySet).map((el) => ELEMENT_META[el]).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Day Master Element from Heavenly Stem
// ---------------------------------------------------------------------------

export function getDayMasterElement(dayStem: string): string {
  return WU_XING_MAP[dayStem] || '土';
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

export function getElementMeta(element: string): LuckyElementInfo {
  return ELEMENT_META[element] || ELEMENT_META['土'];
}

export function getElementColor(element: string): string {
  return ELEMENT_META[element]?.color || '#94a3b8';
}
