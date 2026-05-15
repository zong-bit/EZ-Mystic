// src/bazi/ai-prompt.ts
// Build structured prompt for DeepSeek to generate Bazi interpretation

import { WU_XING_MAP } from './ganzhi';
import type { BaziResult } from './types';

function getWuxingChar(gan: string): string {
  return WU_XING_MAP[gan] || '-';
}

export function buildBaziInterpretPrompt(bazi: BaziResult, name?: string): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, zodiac, wuxing, nayin, shichen } = bazi;

  const wuxingStr = wuxing.map((w) => `${w.element}(${w.count})`).join(', ');

  const gf = bazi.grandFortune;

  return `You are a senior Bazi (Four Pillars of Destiny) master. Based on the following Bazi chart, generate a professional, in-depth, and well-structured destiny interpretation.

## Subject Information
- Name: ${name || 'Anonymous'}
- Chinese Zodiac: ${zodiac}
- Shichen (Time Period): ${shichen}

## Four Pillars (Bazi)
| Pillar | Heavenly Stem | Earthly Branch | Five Element | Nayin (Melodic Element) |
|--------|---------------|----------------|--------------|-------------------------|
| Year   | ${yearPillar.gan} | ${yearPillar.zhi} | ${getWuxingChar(yearPillar.gan)} | ${nayin[0]} |
| Month  | ${monthPillar.gan} | ${monthPillar.zhi} | ${getWuxingChar(monthPillar.gan)} | ${nayin[1]} |
| Day    | ${dayPillar.gan} | ${dayPillar.zhi} | Day Master | ${nayin[2]} |
| Hour   | ${hourPillar.gan} | ${hourPillar.zhi} | ${getWuxingChar(hourPillar.gan)} | ${nayin[3]} |

## Five Elements (Wu Xing) Count
Wood: ${wuxing.find(w => w.element === '木')?.count || 0} | Fire: ${wuxing.find(w => w.element === '火')?.count || 0} | Earth: ${wuxing.find(w => w.element === '土')?.count || 0} | Metal: ${wuxing.find(w => w.element === '金')?.count || 0} | Water: ${wuxing.find(w => w.element === '水')?.count || 0}

## Great Fortune (Da Yun) Info
- Starting Age: ${gf.startAge} years old
- Starting Year: ${gf.startYear}
- Direction: ${gf.direction === 'forward' ? 'Forward (顺排)' : 'Reverse (逆排)'}
- Fortune Cycles: ${gf.cycles.map(c => c.startAge + '-' + c.endAge + ' yrs | ' + c.stem + c.branch).join(' → ')}

## Requirements
Please structure your interpretation according to the following outline (in Markdown format):

### I. Chart Overview
Brief analysis of the Day Master, Five Elements pattern, and overall chart characteristics

### II. Personality Analysis
Day Master personality traits, Ten Deity personality analysis, strengths and challenges

### III. Career & Wealth
Suitable career directions, career development trends, Great Fortune career analysis

### IV. Wealth Analysis
Direct/indirect wealth pattern, peak wealth periods, financial management advice

### V. Love & Relationships
Marriage palace analysis, romance luck, relationship guidance

### VI. Annual Luck
Current year overview, upcoming year predictions

### VII. Luck Enhancement Suggestions
Lucky colors, lucky numbers, favorable directions, accessory recommendations

Ensure your interpretation is professional, objective, and insightful. Avoid generic statements — provide targeted analysis based on the specific Bazi pattern. The tone should be warm and wise.

---
⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.`;
}

export function buildFateBookPrompt(bazi: BaziResult, name?: string): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, zodiac, wuxing, nayin, shichen } = bazi;
  const gf = bazi.grandFortune;

  return `You are a senior Bazi (Four Pillars of Destiny) master. Please write a complete "Destiny Book" report for the following subject.

## Subject Information
- Name: ${name || 'Anonymous'}
- Chinese Zodiac: ${zodiac}
- Shichen (Time Period): ${shichen}

## Four Pillars (Bazi)
Year: ${yearPillar.gan}${yearPillar.zhi} | Month: ${monthPillar.gan}${monthPillar.zhi} | Day: ${dayPillar.gan}${dayPillar.zhi} | Hour: ${hourPillar.gan}${hourPillar.zhi}

## Five Elements (Wu Xing) Count
Wood: ${wuxing.find(w => w.element === '木')?.count || 0} | Fire: ${wuxing.find(w => w.element === '火')?.count || 0} | Earth: ${wuxing.find(w => w.element === '土')?.count || 0} | Metal: ${wuxing.find(w => w.element === '金')?.count || 0} | Water: ${wuxing.find(w => w.element === '水')?.count || 0}

## Great Fortune (Da Yun)
Starting: ${gf.startAge} years old (${gf.startYear}) | ${gf.direction === 'forward' ? 'Forward (顺排)' : 'Reverse (逆排)'}

## Requirements
Write a comprehensive Destiny Book report of approximately 3000 words, covering the following chapters:

1. **Chart Overview** - Day Master analysis, Five Elements pattern, Nayin (Melodic Element) interpretation
2. **In-Depth Personality Analysis** - Ten Deity personality, innate talents, personality blind spots
3. **Career & Wealth** - Suitable industries, career phases, wealth pattern
4. **Love & Marriage** - Marriage palace, romance luck, relationship guidance
5. **Health & Wellness** - Five Elements health insights
6. **Great Fortune Analysis** - Life phase fortune interpretations
7. **Annual Luck** - Detailed predictions for the current and upcoming year
8. **Luck Enhancement Guide** - Colors, numbers, directions, accessories, feng shui tips
9. **Appendix** - Glossary of Bazi terminology

Requirements:
- Elegant, professional, and insightful language
- Provide targeted analysis based on the specific Bazi pattern
- Avoid generic clichés
- Use Markdown format, with appropriate emoji for readability

---
⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.`;
}
