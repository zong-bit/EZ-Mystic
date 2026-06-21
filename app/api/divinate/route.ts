// app/api/divinate/route.ts
// I Ching (易经) divination API — coin, number, and time methods
import { NextRequest, NextResponse } from 'next/server';
import { BAGUA, getHexagram, randomTrigramIndex } from '@/bazi/bagua';
import type { BaguaItem } from '@/bazi/bagua';

// Vercel default timeout is 10s; let's allow a bit more
export const maxDuration = 30;

// ── Hexagram line values (coin toss) ─────────────────────────────
// 3 coins: 3 heads=9(yang moving), 2 heads+1 tail=8(yin),
//           1 head+2 tails=7(yang),   3 tails=6(yin moving)
// Convention: head=3, tail=2 → sum = 6/7/8/9
//   6 → old yin (changing)  ⚋�变化阴
//   7 → young yang          ⚊
//   8 → young yin           ⚋
//   9 → old yang (changing) ⚊�变化阳

const LINE_SYMBOLS: Record<number, string> = {
  6: '⚋⏎', // old yin → becomes yang
  7: '⚊',  // young yang
  8: '⚋',  // young yin
  9: '⚊⏎', // old yang → becomes yin
};

const LINE_NAMES: Record<number, string> = {
  6: '老阴 (Old Yin)',
  7: '少阳 (Young Yang)',
  8: '少阴 (Young Yin)',
  9: '老阳 (Old Yang)',
};

// ── Helper: toss 3 coins → line value ────────────────────────────
function tossThreeCoins(): number {
  const coins = [Math.random() < 0.5 ? 3 : 2, Math.random() < 0.5 ? 3 : 2, Math.random() < 0.5 ? 3 : 2];
  const sum = coins[0] + coins[1] + coins[2];
  return sum; // 6, 7, 8, or 9
}

// ── Helper: build 6 lines (bottom → top) from array of values ────
function buildLines(values: number[]): { index: number; value: number; symbol: string; name: string; changing: boolean }[] {
  return values.map((v, i) => ({
    index: i + 1, // 1-based line number (bottom = line 1)
    value: v,
    symbol: LINE_SYMBOLS[v] || '未知',
    name: LINE_NAMES[v] || '未知',
    changing: v === 6 || v === 9,
  }));
}

// ── Helper: derive upper/lower trigrams from 6 lines ─────────────
// Lines are stored bottom→top (line 1 = bottom).
// Lower trigram: lines 1-3 (bottom), Upper trigram: lines 4-6 (top).
// Each trigram line (3 lines): bottom, middle, top.
function extractTrigrams(lines: { value: number }[]): { upper: BaguaItem; lower: BaguaItem } {
  // Lower trigram: lines[0], lines[1], lines[2] → bottom, mid, top of lower
  const lowerValues = [lines[0].value, lines[1].value, lines[2].value];
  // Upper trigram: lines[3], lines[4], lines[5] → bottom, mid, top of upper
  const upperValues = [lines[3].value, lines[4].value, lines[5].value];

  // Find matching trigram by line pattern
  const matchTrigram = (values: number[]): BaguaItem => {
    for (const t of BAGUA) {
      // t.lines is [top, mid, bottom] — reverse for comparison
      const reversed = [...t.lines].reverse(); // [bottom, mid, top]
      if (reversed[0] === values[0] && reversed[1] === values[1] && reversed[2] === values[2]) {
        return t;
      }
    }
    // Fallback: try exact match without reversal
    for (const t of BAGUA) {
      if (t.lines[0] === values[2] && t.lines[1] === values[1] && t.lines[2] === values[0]) {
        return t;
      }
    }
    // Last resort: default to 坤 (all broken lines = 5)
    return BAGUA[7]; // 坤
  };

  return {
    upper: matchTrigram(upperValues),
    lower: matchTrigram(lowerValues),
  };
}

// ── Helper: build changed (变卦) hexagram ────────────────────────
function buildChangedHexagram(lines: { value: number }[]): { index: number; original: number; changed: number; symbol: string }[] {
  return lines.map((l, i) => ({
    index: i + 1,
    original: l.value,
    changed: l.value === 6 ? 7 : l.value === 9 ? 8 : l.value, // old yin→young yang, old yang→young yin
    symbol: LINE_SYMBOLS[l.value === 6 ? 7 : l.value === 9 ? 8 : l.value] || '—',
  }));
}

// ── Reading generation (deterministic, no AI) ────────────────────
function generateReading(hexagram: { name: string; description: string }, lines: { value: number }[], changingLines: number[]): string {
  const parts: string[] = [];

  // Core hexagram reading
  parts.push(`**卦象：${hexagram.name}**`);
  parts.push(hexagram.description);
  parts.push('');

  // Line-by-line breakdown
  const lineSymbols = ['初', '二', '三', '四', '五', '上'];
  parts.push('**爻辞解析：**');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const prefix = lineSymbols[i];
    if (l.value === 6 || l.value === 9) {
      parts.push(`${prefix}爻 ${LINE_NAMES[l.value]} — 此爻变动，${l.value === 6 ? '阴转化为阳' : '阳转化为阴'}，主事态将发生变化。`);
    } else {
      parts.push(`${prefix}爻 ${LINE_NAMES[l.value]} — 此爻稳定，象征当前状态持续。`);
    }
  }
  parts.push('');

  // Changing lines interpretation
  if (changingLines.length > 0) {
    parts.push(`**动爻提示：** 第${changingLines.map((n) => `${lineSymbols[n - 1]}爻`).join('、')}爻动，${changingLines.length === 1 ? '以变卦为主' : '综合变卦参考'}。`);
    parts.push('动爻代表事物变化的关键点，是易经给出的核心指引。');

    // Summary of change
    const changedLineNames = changingLines.map((n) => LINE_NAMES[lines[n - 1].value] || '');
    parts.push(`变化：${changedLineNames.join('、')} → 转化。提示当前局面中有 ${changingLines.length} 处正在发生转变，顺应变化即可。`);
  } else {
    parts.push('**静卦：** 无动爻，卦象稳定。直接以本卦解读即可。');
  }

  // Philosophical guidance
  const guidance = getPhilosophicalGuidance(hexagram.name, changingLines.length);
  parts.push('');
  parts.push(guidance);

  return parts.join('\n\n');
}

function getPhilosophicalGuidance(hexName: string, movingLines: number): string {
  const guidanceMap: Record<string, string> = {
    '乾为天': '刚健中正，自强不息。此时宜主动进取，但需保持谦逊。',
    '坤为地': '厚德载物，顺势而为。此时宜守不宜攻，以柔克刚。',
    '坎为水': '重险之中，宜谨慎行事。水流不息，坚持即可度过难关。',
    '离为火': '光明附丽，借势而行。依附正道，光明自现。',
    '震为雷': '震动惊醒，宜迅速行动。雷声一过，万物复苏。',
    '巽为风': '柔顺渗透，潜移默化。如风无孔不入，以柔韧达成目标。',
    '艮为山': '止于当止，静观其变。如山之稳重，知止而后安。',
    '兑为泽': '和悦交流，以诚待人。泽水滋润，和谐生财。',
  };

  if (guidanceMap[hexName]) {
    return `**🔮 易经指引：** ${guidanceMap[hexName]}`;
  }

  if (movingLines > 0) {
    return `**🔮 易经指引：** ${hexName} 卦动，变化之中藏有转机。顺应爻变之象，及时调整策略，自可化险为夷。`;
  }

  return `**🔮 易经指引：** ${hexName} 卦静，局势稳定。保持当前方向，静待时机。`;
}

// ── Number method: user input number → hexagram ──────────────────
function numberToHexagram(inputNumber: number) {
  // Use the number to derive 6 line values
  const seed = Math.abs(inputNumber);
  const lineValues: number[] = [];
  let n = seed;

  for (let i = 0; i < 6; i++) {
    const mod = n % 4 + 6; // map to 6-9 range
    lineValues.push(mod);
    n = Math.floor(n / 4);
  }

  return lineValues;
}

// ── Time method: current time → hexagram ─────────────────────────
function timeToHexagram(): number[] {
  const now = new Date();
  // Use year, month, day, hour, minute as seed
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const h = now.getHours();
  const min = now.getMinutes();

  // Combine into a large seed
  const seed = y * 1000000 + m * 10000 + d * 100 + h;
  const lineValues: number[] = [];

  let n = seed;
  for (let i = 0; i < 6; i++) {
    const mod = n % 4 + 6; // map to 6-9
    lineValues.push(mod);
    n = Math.floor(n / 4);
  }

  return lineValues;
}

// ── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, number } = body as { method?: string; number?: number };

    // Validate method
    const divinationMethod = (method || 'coin').toLowerCase() as string;
    if (!['coin', 'number', 'time'].includes(divinationMethod)) {
      return NextResponse.json(
        { error: `Invalid method: ${method}. Use "coin", "number", or "time".` },
        { status: 400 }
      );
    }

    let lineValues: number[] = [];

    switch (divinationMethod) {
      case 'coin': {
        // 3 coins × 6 lines = 18 coin tosses (traditional method)
        const allTosses: number[] = [];
        for (let line = 0; line < 6; line++) {
          // Each line: toss 3 coins
          const lineTosses = [tossThreeCoins(), tossThreeCoins(), tossThreeCoins()];
          // Average the 3 tosses for a smoother result (closer to traditional probability)
          const avg = Math.round((lineTosses[0] + lineTosses[1] + lineTosses[2]) / 3);
          // Clamp to valid range
          allTosses.push(Math.min(9, Math.max(6, avg)));
        }
        lineValues = allTosses;
        break;
      }

      case 'number': {
        if (typeof number !== 'number' || !Number.isInteger(number)) {
          return NextResponse.json(
            { error: 'Number method requires an integer parameter. Provide a number (e.g., 42).' },
            { status: 400 }
          );
        }
        lineValues = numberToHexagram(number);
        break;
      }

      case 'time': {
        lineValues = timeToHexagram();
        break;
      }
    }

    // Build lines (bottom → top)
    const lines = buildLines(lineValues);

    // Extract trigrams and get hexagram info
    const { upper, lower } = extractTrigrams(lines);
    const hexagram = getHexagram(upper, lower);

    // Find changing lines (values 6 or 9)
    const changingLines = lines.filter((l) => l.value === 6 || l.value === 9).map((l) => l.index);

    // Build changed hexagram (变卦)
    const changedHexagramData = buildChangedHexagram(lines);
    const changedLines = changedHexagramData.map((c) => ({ value: c.changed, index: c.index }));
    const { upper: changedUpper, lower: changedLower } = extractTrigrams(changedLines);
    const changedHexagram = getHexagram(changedUpper, changedLower);

    // Generate reading
    const reading = generateReading(hexagram, lines, changingLines);

    // Response
    return NextResponse.json({
      success: true,
      method: divinationMethod,
      hexagram: {
        name: hexagram.name,
        description: hexagram.description,
        upperTrigram: { name: upper.name, symbol: upper.symbol, nature: upper.nature },
        lowerTrigram: { name: lower.name, symbol: lower.symbol, nature: lower.nature },
      },
      lines: lines.map((l) => ({
        line: l.index,
        value: l.value,
        symbol: l.symbol,
        name: l.name,
        changing: l.changing,
      })),
      changedHexagram: {
        name: changedHexagram.name,
        description: changedHexagram.description,
        upperTrigram: { name: changedUpper.name, symbol: changedUpper.symbol },
        lowerTrigram: { name: changedLower.name, symbol: changedLower.symbol },
      },
      changingLines: changingLines.length > 0 ? changingLines : undefined,
      reading,
    });
  } catch (error) {
    console.error('Divination error:', error);
    return NextResponse.json(
      { error: 'Divination failed. Please try again.' },
      { status: 500 }
    );
  }
}
