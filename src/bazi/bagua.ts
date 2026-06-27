// Bagua (八卦) — Eight Trigrams + 64 Hexagrams data for I Ching divination
import hexagramsData from '../../data/hexagrams.json';

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
// 6 = solid line (yang), 5 = broken (yin)
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

// Hexagram interface matching hexagrams.json structure
export interface HexagramItem {
  id: number;
  number: number;
  chinese: string;
  pinyin: string;
  english: string;
  upper: string;
  lower: string;
  element: string;
  judgment: string;
  image: string;
  meaning: string;
  keywords: string[];
  lines: number[];
  fiveElements: string;
  direction: string;
  season: string;
}

// Load all hexagrams from JSON (ID-based lookup)
const ALL_HEXAGRAMS: HexagramItem[] = hexagramsData as unknown as HexagramItem[];

// Build ID-indexed lookup map
const HEXAGRAM_BY_ID = new Map<number, HexagramItem>();
ALL_HEXAGRAMS.forEach(h => HEXAGRAM_BY_ID.set(h.id, h));

// Build upper+lower trigram → hexagram lookup (for divination result matching)
const HEXAGRAM_BY_TRIGRAMS = new Map<string, HexagramItem>();
ALL_HEXAGRAMS.forEach(h => {
  const key = `${h.upper}-${h.lower}`;
  HEXAGRAM_BY_TRIGRAMS.set(key, h);
});

// Build lines-array → hexagram lookup (for coin/coin-throw results)
const HEXAGRAM_BY_LINES = new Map<string, HexagramItem>();
ALL_HEXAGRAMS.forEach(h => {
  const key = h.lines.join('');
  HEXAGRAM_BY_LINES.set(key, h);
});

/**
 * Get hexagram by numeric ID (1-64) — primary lookup method
 */
export function getHexagramById(id: number): HexagramItem | undefined {
  return HEXAGRAM_BY_ID.get(id);
}

/**
 * Get hexagram by upper/lower trigram names (e.g., "乾-坤")
 */
export function getHexagramByTrigrams(upper: string, lower: string): HexagramItem | undefined {
  const key = `${upper}-${lower}`;
  return HEXAGRAM_BY_TRIGRAMS.get(key);
}

/**
 * Get hexagram by line pattern (e.g., [6,6,6,5,5,5])
 * Lines ordered from top (line 6) to bottom (line 1) — matches divination result
 */
export function getHexagramByLines(lines: number[]): HexagramItem | undefined {
  const key = lines.join('');
  return HEXAGRAM_BY_LINES.get(key);
}

/**
 * Get all hexagrams (for listing, random selection, etc.)
 */
export function getAllHexagrams(): HexagramItem[] {
  return ALL_HEXAGRAMS;
}

/**
 * Get hexagram by upper/lower BaguaItem (legacy API, still works)
 */
export function getHexagram(upper: BaguaItem, lower: BaguaItem): HexagramItem | undefined {
  const key = `${upper.name}-${lower.name}`;
  return HEXAGRAM_BY_TRIGRAMS.get(key);
}

/**
 * Generate a random hexagram ID (1-64) — for daily hexagram / random divination
 */
export function randomHexagramId(): number {
  return Math.floor(Math.random() * 64) + 1;
}

/**
 * Generate a random trigram index (0-7) — legacy, for backward compat
 */
export function randomTrigramIndex(): number {
  return Math.floor(Math.random() * 8);
}

/**
 * Convert trigram name to symbol
 */
export function getTrigramSymbol(name: string): string {
  const trigram = BAGUA.find(b => b.name === name);
  return trigram?.symbol || '?';
}

/**
 * Get hexagram display symbol (Unicode hexagram character)
 * Based on the hexagram's lines pattern
 */
export function getHexagramSymbol(hex: HexagramItem): string {
  // Map common hexagrams to Unicode I Ching symbols (䷀-䷿)
  // Unicode range: U+4DC0 (Hexagram 1) to U+4DFF (Hexagram 64)
  const base = 0x4DC0; // U+4DC0 = Hexagram 1 (乾为天)
  return String.fromCodePoint(base + hex.id - 1);
}
