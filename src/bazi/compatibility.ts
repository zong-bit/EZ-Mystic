// src/bazi/compatibility.ts
// Core compatibility (合盘) algorithm for FateWise

import { calculateBazi } from './engine';
import type { BaziResult, BaziInput } from './types';
import {
  TIAN_GAN,
  DI_ZHI,
  WU_XING_MAP,
  ZHI_WU_XING_MAP,
  SHI_SHEN_MAP,
} from './ganzhi';

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface CompatibilityInput {
  person1: BaziInput;
  person2: BaziInput;
}

export interface CompatibilityResult {
  // Overall score (0-100)
  overallScore: number;

  // Dimension breakdowns
  dimensions: CompatibilityDimension[];

  // Summary text
  summary: string;

  // Detailed analysis per dimension
  details: DimensionDetail[];

  // Additional data for UI rendering
  person1DayMaster?: string;
  person2DayMaster?: string;
}

export interface CompatibilityDimension {
  name: string; // display name (bilingual)
  nameEn: string;
  score: number; // 0-10
  weight: number; // percentage contribution to overall (sum = 1.0)
}

export interface DimensionDetail {
  dimension: string; // key name
  score: number;
  maxScore: number;
  description: string; // bilingual explanation
  advice: string; // relationship advice
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** 天干五合 (Heavenly Stem Combinations) — natural attraction pairs */
const TIAN_GAN_COMBOS: [string, string][] = [
  ['甲', '己'], // Wood + Earth
  ['乙', '庚'], // Wood + Metal
  ['丙', '辛'], // Fire + Metal
  ['丁', '壬'], // Fire + Water
  ['戊', '癸'], // Earth + Water
];

/** 六合 (Earthly Branch Six Harmonies) */
const DI_ZHI_LIU_HE: [string, string][] = [
  ['子', '丑'], // Rat + Ox
  ['寅', '亥'], // Tiger + Pig
  ['卯', '戌'], // Rabbit + Dog
  ['辰', '酉'], // Dragon + Rooster
  ['巳', '申'], // Snake + Monkey
  ['午', '未'], // Horse + Goat
];

/** 三合 (Earthly Branch Three Harmonies) — groups of 3 that complement each other */
const DI_ZHI_SAN_HE: string[][] = [
  ['申', '子', '辰'], // Metal trio
  ['亥', '卯', '未'], // Wood trio
  ['寅', '午', '戌'], // Fire trio
  ['巳', '酉', '丑'], // Water trio
];

/** 六冲 (Earthly Branch Clashes) — natural opposition */
const DI_ZHI_CHONG: [string, string][] = [
  ['子', '午'], // Rat vs Horse
  ['丑', '未'], // Ox vs Goat
  ['寅', '申'], // Tiger vs Monkey
  ['卯', '酉'], // Rabbit vs Rooster
  ['辰', '戌'], // Dragon vs Dog
  ['巳', '亥'], // Snake vs Pig
];

const ELEMENT_NAMES: Record<string, { cn: string; en: string }> = {
  '木': { cn: '木 Wood', en: 'Wood' },
  '火': { cn: '火 Fire', en: 'Fire' },
  '土': { cn: '土 Earth', en: 'Earth' },
  '金': { cn: '金 Metal', en: 'Metal' },
  '水': { cn: '水 Water', en: 'Water' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Count five elements in a person's eight characters (8 chars total) */
function countWuXing(result: BaziResult): Record<string, number> {
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const pillars = [result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar];
  for (const p of pillars) {
    const wx1 = WU_XING_MAP[p.gan] || '';
    if (wx1) counts[wx1]++;
    const wx2 = ZHI_WU_XING_MAP[p.zhi] || '';
    if (wx2) counts[wx2]++;

    // Hidden stems
    const hidden = result.hiddenStems.find(h => h.zhi === p.zhi);
    if (hidden) {
      for (const hs of hidden.stems) {
        const wx3 = WU_XING_MAP[hs.gan] || '';
        if (wx3) counts[wx3] += hs.weight / 10; // weighted
      }
    }
  }
  return counts;
}

/** Check if two heavenly stems form a 五合 combo */
function checkTianGanCombo(gan1: string, gan2: string): boolean {
  return TIAN_GAN_COMBOS.some(([a, b]) =>
    (a === gan1 && b === gan2) || (a === gan2 && b === gan1)
  );
}

/** Check if two earthly branches form a 六合 harmony */
function checkDiZhiLiuHe(zhi1: string, zhi2: string): boolean {
  return DI_ZHI_LIU_HE.some(([a, b]) =>
    (a === zhi1 && b === zhi2) || (a === zhi2 && b === zhi1)
  );
}

/** Check if two earthly branches form a 三合 harmony */
function checkDiZhiSanHe(zhi1: string, zhi2: string): boolean {
  return DI_ZHI_SAN_HE.some(group => group.includes(zhi1) && group.includes(zhi2));
}

/** Check if two earthly branches clash (六冲) */
function checkDiZhiChong(zhi1: string, zhi2: string): boolean {
  return DI_ZHI_CHONG.some(([a, b]) =>
    (a === zhi1 && b === zhi2) || (a === zhi2 && b === zhi1)
  );
}

/** Generate relationship advice based on score */
function getAdvice(level: number): { cn: string; en: string } {
    if (level >= 85) return {
      cn: '天作之合，五行相生相济，命格高度互补。这样的组合非常难得，建议珍惜缘分。',
      en: 'A rare heavenly match. Your Five Elements complement each other beautifully — cherish this connection.',
    };
    if (level >= 70) return {
      cn: '缘分深厚，虽有摩擦但能互相成就。多沟通包容，关系会越来越稳固。',
      en: 'A deep connection with natural attraction. With patience and communication, this bond will grow stronger.',
    };
    if (level >= 50) return {
      cn: '有一定吸引力，但需要双方共同努力磨合。了解彼此差异是关系的关键。',
      en: 'Moderate compatibility — there is potential, but both partners need to invest in understanding each other.',
    };
    if (level >= 30) return {
      cn: '缘分较浅，性格差异较大。建议保持距离做朋友，不宜深入发展。',
      en: 'Light connection with significant differences. Better to maintain a friendly distance.',
    };
    return {
      cn: '五行相克较重，相处易有冲突。建议谨慎对待这段关系。',
      en: 'Strong elemental conflicts suggest significant challenges. Approach with caution.',
    };
}

// ─── Core Scoring Functions ──────────────────────────────────────────────────

/** Score: Day Master (日干) natural attraction */
function scoreDayMaster(r1: BaziResult, r2: BaziResult): { score: number; detail: string } {
  const dm1 = r1.dayPillar.gan; // Day Master of person 1
  const dm2 = r2.dayPillar.gan; // Day Master of person 2

  let score = 5; // base neutral
  let detailParts: string[] = [];

  // Check 天干五合 (strong attraction)
  if (checkTianGanCombo(dm1, dm2)) {
    score = 9.5;
    const comboInfo = TIAN_GAN_COMBOS.find(([a, b]) =>
      (a === dm1 && b === dm2) || (a === dm2 && b === dm1)
    );
    const el1 = ELEMENT_NAMES[WU_XING_MAP[dm1]]?.cn || dm1;
    const el2 = ELEMENT_NAMES[WU_XING_MAP[dm2]]?.cn || dm2;
    detailParts.push(`日干${dm1}(${el1})与${dm2}(${el2})形成天干五合，先天吸引力极强`);
    detailParts.push(`Day Master ${dm1}(${el1}) and ${dm2}(${el2}) form a Heavenly Stem Combo — strong innate attraction`);
  } else {
    // Same element (比肩/劫财) — peer relationship, moderate score
    const el1 = WU_XING_MAP[dm1];
    const el2 = WU_XING_MAP[dm2];

    if (el1 === el2) {
      score = 6.5;
      detailParts.push(`日干同为${el1}，性格相似如知己`);
      detailParts.push(`Same Day Master element — natural understanding like friends`);
    } else {
      // Check generating/controlling relationships
      const elemOrder = ['木', '火', '土', '金', '水']; // generating order
      const idx1 = elemOrder.indexOf(el1);
      const idx2 = elemOrder.indexOf(el2);

      // Person 1 generates person 2 (付出型)
      if ((idx2 - idx1 + 5) % 5 === 1) {
        score = 7;
        detailParts.push(`${el1}生${el2}，一方自然愿意为另一方付出`);
        detailParts.push(`${el1} generates ${el2} — one naturally gives to the other`);
      }
      // Person 2 generates person 1 (被付出型)
      else if ((idx1 - idx2 + 5) % 5 === 1) {
        score = 7;
        detailParts.push(`${el2}生${el1}，一方被另一方滋养`);
        detailParts.push(`${el2} generates ${el1} — one is naturally nourished by the other`);
      }
      // Person 1 controls person 2 (控制型)
      else if ((idx2 - idx1 + 5) % 5 === 3) {
        score = 4;
        detailParts.push(`${el1}克${el2}，存在天然的控制与反控制张力`);
        detailParts.push(`${el1} controls ${el2} — tension of control dynamics`);
      }
      // Person 2 controls person 1 (反控制)
      else if ((idx1 - idx2 + 5) % 5 === 3) {
        score = 4;
        detailParts.push(`${el2}克${el1}，权力平衡需要刻意维护`);
        detailParts.push(`${el2} controls ${el1} — power balance requires conscious effort`);
      }
      // Neutral (no direct relationship)
      else {
        score = 5.5;
        detailParts.push(`日干五行无直接相生相克，关系中性偏稳`);
        detailParts.push(`Neutral elemental relationship — stable but not passionate`);
      }
    }

    detailParts.push(`日干 ${dm1} vs ${dm2}`);
  }

  return { score, detail: detailParts.join(' | ') };
}

/** Score: Five Elements complementarity (五行互补) */
function scoreWuXingComplement(r1: BaziResult, r2: BaziResult): { score: number; detail: string } {
  const wx1 = countWuXing(r1);
  const wx2 = countWuXing(r2);

  let score = 5;
  const detailParts: string[] = [];

  // How much does person 2 have that person 1 lacks, and vice versa
  let mutualFill = 0;
  const elemNames = ['木', '火', '土', '金', '水'];

  for (const elem of elemNames) {
    const lack1 = wx1[elem] < 2; // person 1 lacks this element
    const lack2 = wx2[elem] < 2; // person 2 lacks this element
    const strong1 = wx1[elem] >= 3; // person 1 has plenty
    const strong2 = wx2[elem] >= 3; // person 2 has plenty

    if (lack1 && strong2) mutualFill++;
    if (lack2 && strong1) mutualFill++;
  }

  // Each fill gives ~3 points, capped at max bonus of 6
  const bonus = Math.min(mutualFill * 3, 6);
  score += bonus;

  detailParts.push(`互补维度: ${mutualFill}项五行互补短板`);
  detailParts.push(`${mutualFill} dimensions of mutual elemental filling`);

  // Report specific fills
  for (const elem of elemNames) {
    if ((wx1[elem] < 2 && wx2[elem] >= 3) || (wx2[elem] < 2 && wx1[elem] >= 3)) {
      const info = ELEMENT_NAMES[elem];
      detailParts.push(`一方${info?.cn}充足，另一方正好需要`);
    }
  }

  if (mutualFill === 0) {
    detailParts.push('五行分布相似，互补性一般');
    detailParts.push('Similar elemental distribution — limited complementarity');
  }

  return { score: Math.min(score, 10), detail: detailParts.join(' | ') };
}

/** Score: Earthly Branch harmony (地支关系) */
function scoreDiZhi(r1: BaziResult, r2: BaziResult): { score: number; detail: string } {
  const pillars1 = [r1.yearPillar, r1.monthPillar, r1.dayPillar, r1.hourPillar];
  const pillars2 = [r2.yearPillar, r2.monthPillar, r2.dayPillar, r2.hourPillar];

  let harmonyCount = 0;
  let clashCount = 0;
  const detailParts: string[] = [];

  // Compare all pillar combinations (simplified: focus on day pillars + hour pillars)
  const keyPairs = [
    [pillars1[2], pillars2[0]], // person1 day vs person2 year
    [pillars1[3], pillars2[0]], // person1 hour vs person2 year
    [pillars1[3], pillars2[3]], // person1 hour vs person2 hour
    [pillars1[2], pillars2[2]], // day vs day (marriage palace)
  ];

  for (const [p1, p2] of keyPairs) {
    const zhi1 = p1.zhi;
    const zhi2 = p2.zhi;

    if (checkDiZhiLiuHe(zhi1, zhi2)) {
      harmonyCount += 2;
      detailParts.push(`地支六合: ${zhi1}↔${zhi2}`);
    } else if (checkDiZhiSanHe(zhi1, zhi2)) {
      harmonyCount += 1.5;
      detailParts.push(`地支三合: ${zhi1}↔${zhi2}`);
    } else if (checkDiZhiChong(zhi1, zhi2)) {
      clashCount += 1.5;
      detailParts.push(`地支六冲: ${zhi1}↔${zhi2}`);
    }
  }

  // Score: each harmony adds ~1.5, each clash subtracts ~1
  let score = 5 + harmonyCount * 1.2 - clashCount * 0.8;
  score = Math.max(1, Math.min(10, score));

  if (harmonyCount === 0 && clashCount === 0) {
    detailParts.push('地支无显著合冲关系');
    detailParts.push('No significant branch harmonies or clashes');
  }

  return { score, detail: detailParts.join(' | ') };
}

/** Score: Ten Deity relationship (十神匹配) */
function scoreShiShen(r1: BaziResult, r2: BaziResult): { score: number; detail: string } {
  const dm1 = r1.dayPillar.gan; // Person 1's day master
  const dm2 = r2.dayPillar.gan; // Person 2's day master

  let score = 5;
  const detailParts: string[] = [];

  // From person 1's perspective, what is person 2's day master?
  const tdsFromP1 = SHI_SHEN_MAP[dm1]?.[dm2] || '';
  // From person 2's perspective, what is person 1's day master?
  const tdsFromP2 = SHI_SHEN_MAP[dm2]?.[dm1] || '';

  detailParts.push(`Person1看Person2: ${tdsFromP1}`);
  detailParts.push(`Person2看Person1: ${tdsFromP2}`);

  // Favorable Ten Deities (正财, 正官, 食神) — positive attraction
  const favorableP1 = ['正财', '正官', '食神'];
  const favorableP2 = ['正财', '正官', '食神'];

  // Male: 正财/偏财 (wife star) is favorable; Female: 正官/偏官 (husband star)
  // Simplified: check if the relationship involves wealth or official stars

  const isFavorable1 = favorableP1.includes(tdsFromP1);
  const isFavorable2 = favorableP2.includes(tdsFromP2);

  if (isFavorable1 && isFavorable2) {
    score = 9;
    detailParts.push('双方互为对方的吉利十神，双向吸引力强');
    detailParts.push('Mutually favorable Ten Deities — strong bidirectional attraction');
  } else if (isFavorable1 || isFavorable2) {
    score = 7;
    detailParts.push('一方为对方的吉利十神，单向吸引力');
    detailParts.push('One-way favorable Ten Deity — one-sided attraction');
  } else {
    // Check for 比肩/劫财 (peer relationship — good for friendship, neutral for romance)
    const peerDeities = ['比肩', '劫财'];
    if (peerDeities.includes(tdsFromP1) || peerDeities.includes(tdsFromP2)) {
      score = 6;
      detailParts.push('比肩劫财关系，像朋友般的相处模式');
      detailParts.push('Peer relationship — friendship-like dynamic');
    } else {
      score = 4;
      detailParts.push('十神关系偏克制，需要刻意经营');
      detailParts.push('Controlling Ten Deity dynamic — requires conscious effort');
    }
  }

  return { score, detail: detailParts.join(' | ') };
}

/** Score: Hidden stems interaction (藏干互动) */
function scoreHiddenStems(r1: BaziResult, r2: BaziResult): { score: number; detail: string } {
  let hiddenScore = 5;
  const detailParts: string[] = [];

  // Check if hidden stems of one person's branches match the other's day master
  const dm1 = r1.dayPillar.gan;
  const dm2 = r2.dayPillar.gan;

  let hiddenMatchCount = 0;

  for (const hs of r1.hiddenStems) {
    for (const stem of hs.stems) {
      if (stem.gan === dm2) hiddenMatchCount++;
    }
  }

  for (const hs of r2.hiddenStems) {
    for (const stem of hs.stems) {
      if (stem.gan === dm1) hiddenMatchCount++;
    }
  }

  // Each match adds ~0.8, up to max of +4 (total score = 9)
  hiddenScore += Math.min(hiddenMatchCount * 0.8, 4);

  detailParts.push(`藏干互动: ${hiddenMatchCount}次日干匹配`);
  detailParts.push(`${hiddenMatchCount} hidden stem matches with each other's Day Master`);

  if (hiddenMatchCount === 0) {
    detailParts.push('藏干无日干匹配，深层吸引力一般');
    detailParts.push('No hidden stem matches — moderate deep-level attraction');
  }

  return { score: Math.min(hiddenScore, 10), detail: detailParts.join(' | ') };
}

// ─── Main Compatibility Engine ──────────────────────────────────────────────

export function calculateCompatibility(
  input: CompatibilityInput
): CompatibilityResult {
  const r1 = calculateBazi(input.person1);
  const r2 = calculateBazi(input.person2);

  // Run all scoring dimensions
  const dayMasterResult = scoreDayMaster(r1, r2);
  const wuXingResult = scoreWuXingComplement(r1, r2);
  const diZhiResult = scoreDiZhi(r1, r2);
  const shiShenResult = scoreShiShen(r1, r2);
  const hiddenStemsResult = scoreHiddenStems(r1, r2);

  // Weights: Day Master (30%), WuXing Complement (25%), DiZhi Harmony (15%),
  //           Ten Deity (20%), Hidden Stems (10%)
  const weights = [0.3, 0.25, 0.15, 0.2, 0.1];
  const scores = [
    dayMasterResult.score / 10, // normalize to 0-1
    wuXingResult.score / 10,
    diZhiResult.score / 10,
    shiShenResult.score / 10,
    hiddenStemsResult.score / 10,
  ];

  // Weighted overall score (0-100)
  let weightedSum = 0;
  for (let i = 0; i < weights.length; i++) {
    weightedSum += scores[i] * weights[i];
  }
  const overallScore = Math.round(weightedSum * 100);

  // Build dimensions array
  const dimensions: CompatibilityDimension[] = [
    { name: '日干匹配', nameEn: 'Day Master Match', score: dayMasterResult.score, weight: weights[0] },
    { name: '五行互补', nameEn: 'Five Elements Complementarity', score: wuXingResult.score, weight: weights[1] },
    { name: '地支和谐', nameEn: 'Earthly Branch Harmony', score: diZhiResult.score, weight: weights[2] },
    { name: '十神关系', nameEn: 'Ten Deity Relationship', score: shiShenResult.score, weight: weights[3] },
    { name: '藏干互动', nameEn: 'Hidden Stems Interaction', score: hiddenStemsResult.score, weight: weights[4] },
  ];

  // Build details array (bilingual)
  const allResults = [dayMasterResult, wuXingResult, diZhiResult, shiShenResult, hiddenStemsResult];
  const dimKeys = ['dayMaster', 'wuXing', 'diZhi', 'shiShen', 'hiddenStems'];
  const details: DimensionDetail[] = allResults.map((r, i) => ({
    dimension: dimKeys[i],
    score: r.score,
    maxScore: 10,
    description: r.detail,
    advice: '', // filled below based on overall score
  }));

  // Generate summary and advice based on overall level
  const advice = getAdvice(overallScore);

  // Generate summary text
  const dm1Info = ELEMENT_NAMES[WU_XING_MAP[r1.dayPillar.gan]];
  const dm2Info = ELEMENT_NAMES[WU_XING_MAP[r2.dayPillar.gan]];
  const day1 = `${r1.dayPillar.gan}${dm1Info?.cn || ''}`;
  const day2 = `${r2.dayPillar.gan}${dm2Info?.cn || ''}`;

  let summaryCn = `综合匹配度 ${overallScore}%。`;
  let summaryEn = `${overallScore}% compatibility. `;

  if (overallScore >= 80) {
    summaryCn += '你们的八字显示出高度的五行互补和天干五合，是难得的良缘组合。';
    summaryEn += 'Your charts show strong Five Elements complementarity and Heavenly Stem combinations — a rare and auspicious match.';
  } else if (overallScore >= 65) {
    summaryCn += '你们的命格有一定吸引力，五行互补性良好。通过相互理解和包容，可以建立稳定的关系。';
    summaryEn += 'Your charts show moderate to strong attraction with good elemental complementarity. Mutual understanding can build a stable bond.';
  } else if (overallScore >= 45) {
    summaryCn += '你们的八字关系中性，既有吸引力也存在挑战。需要双方共同努力来磨合差异。';
    summaryEn += 'Your charts show a neutral relationship with both attractions and challenges. Both partners need to invest in bridging differences.';
  } else {
    summaryCn += '你们的八字五行存在较多冲突，相处需要格外注意沟通方式。';
    summaryEn += 'Your charts show notable elemental conflicts. Pay extra attention to communication and mutual respect.';
  }

  summaryCn += ` ${advice.cn}`;
  summaryEn += ` ${advice.en}`;

  // Fill advice into details
  for (const d of details) {
    if (overallScore >= 70) {
      d.advice = `建议: ${advice.cn}`;
    } else if (overallScore >= 50) {
      d.advice = `建议: ${advice.cn} (需要双方努力)`;
    } else {
      d.advice = `建议: ${advice.cn}`;
    }
  }

  return {
    overallScore,
    dimensions,
    summary: `${summaryCn}\n\n${summaryEn}`,
    details,

    // Additional data for UI rendering
    person1DayMaster: day1,
    person2DayMaster: day2,
  };
}

// ─── Free Preview (abbreviated) ──────────────────────────────────────────────
/** Returns a truncated result for free users (no detailed analysis) */
export function calculateCompatibilityPreview(input: CompatibilityInput): {
  overallScore: number;
  summaryCn: string;
  summaryEn: string;
  dimensionsShort: { name: string; score: number }[];
} {
  const result = calculateCompatibility(input);

  return {
    overallScore: result.overallScore,
    summaryCn: result.summary.split('\n\n')[0],
    summaryEn: '', // English in second paragraph (blocked for preview)
    dimensionsShort: result.dimensions.map(d => ({ name: d.name, score: d.score })),
  };
}
