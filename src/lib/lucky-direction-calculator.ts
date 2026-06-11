// src/lib/lucky-direction-calculator.ts
// Kua Number (命卦) + 八宅方位 analysis for lucky-direction tool.

import type { ElementStat } from '@/lib/bazi-calculator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KuaResult {
  kuaNumber: number;
  trigram: string;       // 坎/坤...
  trigramEn: string;     // Kan/Kun...
  group: 'east' | 'west';

  directions: DirectionInfo[]; // all 8 directions, sorted by compass order
  bestDirection: DirectionInfo; // most beneficial (Sheng Qi)
}

export interface DirectionInfo {
  nameCn: string;       // 生气/天医...
  nameEn: string;       // Sheng Qi / Tian Yi ...
  direction: string;     // North, South-East...
  meaning: string;       // what this direction governs
}

// ---------------------------------------------------------------------------
// Kua Number Calculation
// ---------------------------------------------------------------------------

function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

export function calculateKuaNumber(year: number, gender: 'male' | 'female'): number {
  const lastTwo = year % 100;

  if (gender === 'male') {
    const digitSum = String(lastTwo).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    return reduceToSingle(11 - digitSum);
  } else {
    const digitSum = String(lastTwo).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    return reduceToSingle(digitSum + 5);
  }
}

// ---------------------------------------------------------------------------
// Trigram Mapping (Kua Number → trigram)
// ---------------------------------------------------------------------------

const TRIGRAM_MAP: Record<number, { cn: string; en: string }> = {
  1: { cn: '坎', en: 'Kan (Water)' },
  2: { cn: '坤', en: 'Kun (Earth)' },
  3: { cn: '震', en: 'Zhen (Wood)' },
  4: { cn: '巽', en: 'Xun (Wood)' },
  6: { cn: '乾', en: 'Qian (Metal)' },
  7: { cn: '兑', en: 'Dui (Metal)' },
  8: { cn: '艮', en: 'Gen (Earth)' },
  9: { cn: '离', en: 'Li (Fire)' },
};

// Kua 5 special case: male → Kun (坤), female → Gen (艮)
// Already resolved by the caller

function getGroup(kua: number): 'east' | 'west' {
  return [1, 3, 4, 9].includes(kua) ? 'east' : 'west';
}

// ---------------------------------------------------------------------------
// Eight Mansions — Kua Number → Direction Mapping (compass order)
// ---------------------------------------------------------------------------

/**
 * Each row = [N, NE, E, SE, S, SW, W, NW] directions in compass order.
 * Each entry is a tuple: [cnName, enName+meaning, description].
 */
const KUA_MAPS: Record<number, [string, string, string][]> = {
  // Kua 1 (Kan) — East Group: ShengQi=SE, TianYi=NE, YanNian=W, FuWei=N
  //                HuoHai=SW, LiuSha=NW, JueMing=S, PoYue=E
  1: [
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],           // N
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],           // NE
    ['', '', ''],                                                                        // E  — Po Yue (less common listing)
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],           // SE
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],          // S
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],         // SW
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // W
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                  // NW
  ],

  // Kua 3 (Zhen) — East Group: ShengQi=S, TianYi=W, YanNian=NE, FuWei=E
  //                HuoHai=NW, LiuSha=SW, JueMing=SE, PoYue=N
  3: [
    ['', '', ''],                                                                        // N
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // NE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // E
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // SE
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // S
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // SW
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // W
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // NW
  ],

  // Kua 4 (Xun) — East Group: ShengQi=W, TianYi=NE, YanNian=S, FuWei=SE
  //                HuoHai=E, LiuSha=NW, JueMing=SW, PoYue=N
  4: [
    ['', '', ''],                                                                        // N
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // NE
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // E
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // SE
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // S
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // SW
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // W
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // NW
  ],

  // Kua 9 (Li) — East Group: ShengQi=N, TianYi=SW, YanNian=SE, FuWei=S
  //              HuoHai=E, LiuSha=NW, JueMing=W, PoYue=NE
  9: [
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // N
    ['', '', ''],                                                                        // NE
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // E
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // SE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // S
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // SW
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // W
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // NW
  ],

  // Kua 2 (Kun) — West Group: ShengQi=SW, TianYi=NW, YanNian=S, FuWei=E
  //               HuoHai=SE, LiuSha=N, JueMing=W, PoYue=NE
  2: [
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // N
    ['', '', ''],                                                                        // NE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // E
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // S
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // SW
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // W
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // NW
  ],

  // Kua 6 (Qian) — West Group: ShengQi=NW, TianYi=NE, YanNian=S, FuWei=E
  //                HuoHai=SE, LiuSha=W, JueMing=SW, PoYue=N
  6: [
    ['', '', ''],                                                                        // N
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // NE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // E
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // S
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // SW
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // W
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // NW
  ],

  // Kua 7 (Dui) — West Group: ShengQi=W, TianYi=SW, YanNian=NW, FuWei=E
  //               HuoHai=S, LiuSha=NE, JueMing=N, PoYue=SE
  7: [
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // N
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // NE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // E
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // S
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // SW
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // W
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // NW
  ],

  // Kua 8 (Gen) — West Group: ShengQi=NE, TianYi=E, YanNian=NW, FuWei=S
  //               HuoHai=SW, LiuSha=W, JueMing=N, PoYue=SE
  8: [
    ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // N
    ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // NE
    ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // E
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
    ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // S
    ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SW
    ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // W
    ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // NW
  ],

  // Kua 5: male → Kun (same as Kua 2), female → Gen (same as Kua 8)
};

// For Kua 5: use gender-specific map
const KUA_5_MALE_MAP: [string, string, string][] = [ // same as Kua 2 (Kun)
  ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // N
  ['', '', ''],                                                                        // NE
  ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // E
  ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
  ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // S
  ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // SW
  ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // W
  ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // NW
];

const KUA_5_FEMALE_MAP: [string, string, string][] = [ // same as Kua 8 (Gen)
  ['绝命', 'Jue Ming · Challenges', 'Strong challenges. Use with caution.'],           // N
  ['生气', 'Sheng Qi · Wealth', 'Vitality and wealth. Best for business.'],            // NE
  ['天医', 'Tian Yi · Health', 'Health and healing. Ideal for bedrooms.'],             // E
  ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SE
  ['伏位', 'Fu Wei · Calm', 'Personal growth and calm. Good for study.'],             // S
  ['祸害', 'Huo Hai · Minor Obstacles', 'Minor conflicts. Avoid decisions.'],          // SW
  ['六煞', 'Liu Sha · Stress', 'Emotional turbulence. Keep clear.'],                   // W
  ['延年', 'Yan Nian · Career', 'Career advancement. Great for office.'],             // NW
];

// Compass direction labels in order: N, NE, E, SE, S, SW, W, NW
const COMPASS_LABELS = ['北 N', '东北 NE', '东 E', '东南 SE', '南 S', '西南 SW', '西 W', '西北 NW'];

/**
 * Get all 8 directions for a given Kua Number.
 */
function getDirectionsForKua(kuaNumber: number, gender: 'male' | 'female'): DirectionInfo[] {
  let mapData: [string, string, string][];

  if (kuaNumber === 5) {
    mapData = gender === 'male' ? KUA_5_MALE_MAP : KUA_5_FEMALE_MAP;
  } else {
    mapData = KUA_MAPS[kuaNumber as keyof typeof KUA_MAPS] || KUA_MAPS[1];
  }

  // Convert each compass position to DirectionInfo (skip empty entries)
  const directions: DirectionInfo[] = [];
  for (let i = 0; i < mapData.length && i < COMPASS_LABELS.length; i++) {
    const [cn, en, meaning] = mapData[i];
    if (cn) { // skip empty entries
      directions.push({ nameCn: cn, nameEn: en, direction: COMPASS_LABELS[i], meaning });
    }
  }

  return directions;
}

// ---------------------------------------------------------------------------
// Full Kua Result with Bazi integration
// ---------------------------------------------------------------------------

/**
 * Calculate complete lucky direction analysis combining Bazi + Kua Number.
 */
export function calculateLuckyDirections(
  year: number, month: number, day: number, hour: number, minute: number,
  gender: 'male' | 'female',
): KuaResult {
  const kuaNum = calculateKuaNumber(year, gender);
  const group = getGroup(kuaNum === 5 ? (gender === 'male' ? 2 : 8) : kuaNum);
  const trigram = TRIGRAM_MAP[kuaNum] || { cn: '寄宫', en: 'Special' };

  const directions = getDirectionsForKua(kuaNum, gender);
  const bestDirection = directions.find((d) => d.nameCn === '生气') || directions[0];

  return {
    kuaNumber: kuaNum,
    trigram: trigram.cn,
    trigramEn: trigram.en,
    group,
    directions,
    bestDirection,
  };
}

// ---------------------------------------------------------------------------
// Direction metadata for SVG compass rendering
// ---------------------------------------------------------------------------

export interface CompassDirection {
  label: string;       // English abbreviation (N, NE, E...)
  labelCn: string;     // Chinese name (北, 东北, 东...)
  degree: number;      // center degree (0=N, 90=E, etc.)
}

export const COMPASS_DIRECTIONS: CompassDirection[] = [
  { label: 'N', labelCn: '北', degree: 0 },
  { label: 'NE', labelCn: '东北', degree: 45 },
  { label: 'E', labelCn: '东', degree: 90 },
  { label: 'SE', labelCn: '东南', degree: 135 },
  { label: 'S', labelCn: '南', degree: 180 },
  { label: 'SW', labelCn: '西南', degree: 225 },
  { label: 'W', labelCn: '西', degree: 270 },
  { label: 'NW', labelCn: '西北', degree: 315 },
];

/** Map a direction label to compass center degree. */
export function getDegreeFromLabel(label: string): number | null {
  const degreeMap: Record<string, number> = {
    '北 N': 0, '东北 NE': 45, '东 E': 90, '东南 SE': 135,
    '南 S': 180, '西南 SW': 225, '西 W': 270, '西北 NW': 315,
  };
  return degreeMap[label] ?? null;
}
