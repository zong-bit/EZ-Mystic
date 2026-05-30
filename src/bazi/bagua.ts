// Bagua (八卦) — Eight Trigrams data for I Ching divination

export interface BaguaItem {
  name: string;       // Chinese name: 乾, 兑, etc.
  symbol: string;     // Unicode trigram: ☰, ☱, etc.
  element: string;    // Five elements (五行)
  direction: string;  // Traditional direction
  meaning: string;    // Core meaning
  nature: string;     // Natural element (天/泽/火/雷/风/水/山/地)
  lines: number[];    // 6 = solid (yang), 5 = broken (yin)
}

// Each trigram has 3 lines (top to bottom)
// 6 = solid line (yang), 5 = broken line (yin)
export const BAGUA: BaguaItem[] = [
  {
    name: '乾',
    symbol: '☰',
    element: '金',
    direction: '西北',
    meaning: 'Creative, Heaven, Strong',
    nature: '天',
    lines: [6, 6, 6],
  },
  {
    name: '兑',
    symbol: '☱',
    element: '金',
    direction: '西',
    meaning: 'Joyous, Lake, Open',
    nature: '泽',
    lines: [5, 6, 6],
  },
  {
    name: '离',
    symbol: '☲',
    element: '火',
    direction: '南',
    meaning: 'Clinging, Fire, Clarity',
    nature: '火',
    lines: [6, 5, 6],
  },
  {
    name: '震',
    symbol: '☳',
    element: '木',
    direction: '东',
    meaning: 'Arousing, Thunder, Movement',
    nature: '雷',
    lines: [5, 5, 6],
  },
  {
    name: '巽',
    symbol: '☴',
    element: '木',
    direction: '东南',
    meaning: 'Gentle, Wind, Penetration',
    nature: '风',
    lines: [6, 6, 5],
  },
  {
    name: '坎',
    symbol: '☵',
    element: '水',
    direction: '北',
    meaning: 'Abysmal, Water, Danger',
    nature: '水',
    lines: [5, 6, 5],
  },
  {
    name: '艮',
    symbol: '☶',
    element: '土',
    direction: '东北',
    meaning: 'Keeping Still, Mountain, Stillness',
    nature: '山',
    lines: [6, 5, 5],
  },
  {
    name: '坤',
    symbol: '☷',
    element: '土',
    direction: '西南',
    meaning: 'Receptive, Earth, Devotion',
    nature: '地',
    lines: [5, 5, 5],
  },
];

// Full hexagram (6 lines) = upper trigram + lower trigram
export interface Hexagram {
  upper: BaguaItem;
  lower: BaguaItem;
  name: string;
  description: string;
}

// Map (upper, lower) → full hexagram name & description
const HEXAGRAM_MAP: Record<string, { name: string; description: string }> = {
  '乾-乾': { name: '乾为天', description: 'The Creative — Pure creative power, heaven above heaven. Supreme success.' },
  '兑-兑': { name: '兑为泽', description: 'The Joyous — Lake above lake, joy and harmony.' },
  '离-离': { name: '离为火', description: 'The Clinging — Fire above fire, clarity and illumination.' },
  '震-震': { name: '震为雷', description: 'The Arousing — Thunder above thunder, shock and awakening.' },
  '巽-巽': { name: '巽为风', description: 'The Gentle — Wind above wind, gentle penetration.' },
  '坎-坎': { name: '坎为水', description: 'The Abysmal — Water above water, danger upon danger.' },
  '艮-艮': { name: '艮为山', description: 'Keeping Still — Mountain above mountain, stillness and meditation.' },
  '坤-坤': { name: '坤为地', description: 'The Receptive — Earth above earth, perfect devotion.' },
  '乾-兑': { name: '泽天夬', description: 'Breakthrough — Lake over heaven, decisive action.' },
  '乾-离': { name: '火天大有', description: 'Great Possession — Fire over heaven, abundance and prosperity.' },
  '乾-震': { name: '天雷无妄', description: 'Innocence — Thunder under heaven, natural spontaneity.' },
  '乾-巽': { name: '风天小畜', description: 'Small Taming — Wind over heaven, gentle restraint.' },
  '乾-坎': { name: '水天需', description: 'Waiting — Water over heaven, patience and nourishment.' },
  '乾-艮': { name: '山天大畜', description: 'Great Taming — Mountain over heaven, great accumulation.' },
  '乾-坤': { name: '天地否', description: 'Standstill — Earth over heaven, obstruction and withdrawal.' },
  '兑-离': { name: '泽火革', description: 'Revolution — Lake over fire, transformation and change.' },
  '兑-震': { name: '泽雷随', description: 'Following — Thunder under lake, adaptation and compliance.' },
  '兑-巽': { name: '泽风大过', description: 'Preponderance of the Great — Lake over wind, exceptional weight.' },
  '兑-坎': { name: '泽水困', description: 'Oppression — Water under lake, exhaustion and testing.' },
  '兑-艮': { name: '泽山咸', description: 'Influence — Mountain under lake, mutual attraction.' },
  '兑-坤': { name: '泽地萃', description: 'Gathering Together — Earth under lake, convergence and gathering.' },
  '离-乾': { name: '火天大有', description: 'Great Possession — Fire over heaven, abundance and prosperity.' },
  '离-兑': { name: '泽火革', description: 'Revolution — Lake over fire, transformation and change.' },
  '离-震': { name: '火雷噬嗑', description: 'Biting Through — Thunder under fire, justice and enforcement.' },
  '离-巽': { name: '火风鼎', description: 'The Cauldron — Wind under fire, cultivation and transformation.' },
  '离-坎': { name: '火水未济', description: 'Before Completion — Water under fire, transition and potential.' },
  '离-艮': { name: '火山旅', description: 'The Wanderer — Mountain under fire, travel and impermanence.' },
  '离-坤': { name: '地火明夷', description: 'Darkening of the Light — Earth over fire, obscured brilliance.' },
  '震-乾': { name: '天雷无妄', description: 'Innocence — Thunder under heaven, natural spontaneity.' },
  '震-兑': { name: '泽雷随', description: 'Following — Thunder under lake, adaptation and compliance.' },
  '震-离': { name: '火雷噬嗑', description: 'Biting Through — Thunder under fire, justice and enforcement.' },
  '震-巽': { name: '雷风恒', description: 'Duration — Wind under thunder, constancy and endurance.' },
  '震-坎': { name: '雷水解', description: 'Deliverance — Water under thunder, release and liberation.' },
  '震-艮': { name: '雷山小过', description: 'Preponderance of the Small — Mountain over thunder, careful moderation.' },
  '震-坤': { name: '雷地豫', description: 'Enthusiasm — Earth under thunder, joy and readiness.' },
  '巽-乾': { name: '风天小畜', description: 'Small Taming — Wind over heaven, gentle restraint.' },
  '巽-兑': { name: '泽风大过', description: 'Preponderance of the Great — Lake over wind, exceptional weight.' },
  '巽-离': { name: '火风鼎', description: 'The Cauldron — Wind under fire, cultivation and transformation.' },
  '巽-震': { name: '雷风恒', description: 'Duration — Wind under thunder, constancy and endurance.' },
  '巽-坎': { name: '风水涣', description: 'Dispersion — Water over wind, dissolution and renewal.' },
  '巽-艮': { name: '风山渐', description: 'Development — Mountain under wind, gradual progress.' },
  '巽-坤': { name: '风地观', description: 'Contemplation — Earth under wind, observation and insight.' },
  '坎-乾': { name: '水天需', description: 'Waiting — Water over heaven, patience and nourishment.' },
  '坎-兑': { name: '泽水困', description: 'Oppression — Water under lake, exhaustion and testing.' },
  '坎-离': { name: '火水未济', description: 'Before Completion — Water under fire, transition and potential.' },
  '坎-震': { name: '雷水解', description: 'Deliverance — Water under thunder, release and liberation.' },
  '坎-巽': { name: '风水涣', description: 'Dispersion — Water over wind, dissolution and renewal.' },
  '坎-艮': { name: '山水蒙', description: 'Youthful Folly — Mountain over water, ignorance and learning.' },
  '坎-坤': { name: '地水师', description: 'The Army — Earth over water, organization and discipline.' },
  '艮-乾': { name: '山天大畜', description: 'Great Taming — Mountain over heaven, great accumulation.' },
  '艮-兑': { name: '泽山咸', description: 'Influence — Mountain under lake, mutual attraction.' },
  '艮-离': { name: '火山旅', description: 'The Wanderer — Mountain under fire, travel and impermanence.' },
  '艮-震': { name: '雷山小过', description: 'Preponderance of the Small — Mountain over thunder, careful moderation.' },
  '艮-巽': { name: '风山渐', description: 'Development — Mountain under wind, gradual progress.' },
  '艮-坎': { name: '山水蒙', description: 'Youthful Folly — Mountain over water, ignorance and learning.' },
  '艮-坤': { name: '山地剥', description: 'Splitting Apart — Earth over mountain, decline and erosion.' },
  '坤-乾': { name: '天地否', description: 'Standstill — Earth over heaven, obstruction and withdrawal.' },
  '坤-兑': { name: '泽地萃', description: 'Gathering Together — Earth under lake, convergence and gathering.' },
  '坤-离': { name: '地火明夷', description: 'Darkening of the Light — Earth over fire, obscured brilliance.' },
  '坤-震': { name: '雷地豫', description: 'Enthusiasm — Earth under thunder, joy and readiness.' },
  '坤-巽': { name: '风地观', description: 'Contemplation — Earth under wind, observation and insight.' },
  '坤-坎': { name: '地水师', description: 'The Army — Earth over water, organization and discipline.' },
  '坤-艮': { name: '山地剥', description: 'Splitting Apart — Earth over mountain, decline and erosion.' },
};

// Default to "unknown" hexagram name
const UNKNOWN_HEX = { name: '未知卦象', description: 'Hexagram not found in standard mapping.' };

export function getHexagram(upper: BaguaItem, lower: BaguaItem): Hexagram {
  const key = `${upper.name}-${lower.name}`;
  const info = HEXAGRAM_MAP[key] || UNKNOWN_HEX;
  return {
    upper,
    lower,
    name: info.name,
    description: info.description,
  };
}

// Generate a random trigram index (0-7)
export function randomTrigramIndex(): number {
  return Math.floor(Math.random() * 8);
}
