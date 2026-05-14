// src/bazi/ai-prompt.ts
// Build structured prompt for DeepSeek to generate Bazi interpretation

import { WU_XING_MAP } from './ganzhi';
import type { BaziResult } from './types';

function getWuxingChar(gan: string): string {
  return WU_XING_MAP[gan] || '-';
}

export function buildBaziInterpretPrompt(bazi: BaziResult, name?: string): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, zodiac, wuxing, nayin, shichen } = bazi;

  const wuxingStr = wuxing.map((w) => `${w.element}(${w.count})`).join('、');

  const gf = bazi.grandFortune;

  return `你是一位精通中国传统八字命理的AI命理师。请根据以下八字排盘结果，生成一份专业、深入、有条理的命理解读。

## 命主信息
- 姓名：${name || '匿名'}
- 生肖：${zodiac}
- 时辰：${shichen}

## 四柱八字
| 柱 | 天干 | 地支 | 五行 | 纳音 |
|----|------|------|------|------|
| 年柱 | ${yearPillar.gan} | ${yearPillar.zhi} | ${getWuxingChar(yearPillar.gan)} | ${nayin[0]} |
| 月柱 | ${monthPillar.gan} | ${monthPillar.zhi} | ${getWuxingChar(monthPillar.gan)} | ${nayin[1]} |
| 日柱 | ${dayPillar.gan} | ${dayPillar.zhi} | 日主 | ${nayin[2]} |
| 时柱 | ${hourPillar.gan} | ${hourPillar.zhi} | ${getWuxingChar(hourPillar.gan)} | ${nayin[3]} |

## 五行统计
木${wuxing.find(w => w.element === '木')?.count || 0} 火${wuxing.find(w => w.element === '火')?.count || 0} 土${wuxing.find(w => w.element === '土')?.count || 0} 金${wuxing.find(w => w.element === '金')?.count || 0} 水${wuxing.find(w => w.element === '水')?.count || 0}

## 大运信息
- 起运年龄：${gf.startAge}岁
- 起运年份：${gf.startYear}年
- 排法：${gf.direction === 'forward' ? '顺排' : '逆排'}
- 大运走势：${gf.cycles.map(c => c.startAge + '-' + c.endAge + '岁' + c.stem + c.branch).join(' → ')}

## 要求
请按照以下结构输出解读（使用Markdown格式）：

### 一、命盘总览
简述日主、五行格局、命局特点

### 二、性格分析
日主性格特征、十神性格、优势与挑战

### 三、事业运势
适合的行业方向、事业发展趋势、大运事业分析

### 四、财运分析
正财/偏财格局、财运高峰期、理财建议

### 五、感情桃花
婚姻宫分析、桃花运、恋爱建议

### 六、流年运势
当前流年简评、下一年运势提示

### 七、开运建议
幸运颜色、幸运数字、有利方位、佩戴建议

请确保解读专业、客观、有深度。避免空泛的套话，要结合具体八字格局给出有针对性的分析。语气要温和、有智慧感。

---
⚠️ 本解读由AI生成，仅供参考和娱乐，不作为人生决策依据。`;
}

export function buildFateBookPrompt(bazi: BaziResult, name?: string): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, zodiac, wuxing, nayin, shichen } = bazi;
  const gf = bazi.grandFortune;

  return `你是一位资深八字命理师。请为以下命主撰写一份完整的《天命之书》命理报告。

## 命主信息
- 姓名：${name || '匿名'}
- 生肖：${zodiac}
- 时辰：${shichen}

## 四柱八字
年柱：${yearPillar.gan}${yearPillar.zhi} | 月柱：${monthPillar.gan}${monthPillar.zhi} | 日柱：${dayPillar.gan}${dayPillar.zhi} | 时柱：${hourPillar.gan}${hourPillar.zhi}

## 五行统计
木${wuxing.find(w => w.element === '木')?.count || 0} 火${wuxing.find(w => w.element === '火')?.count || 0} 土${wuxing.find(w => w.element === '土')?.count || 0} 金${wuxing.find(w => w.element === '金')?.count || 0} 水${wuxing.find(w => w.element === '水')?.count || 0}

## 大运
起运：${gf.startAge}岁 (${gf.startYear}年) | ${gf.direction === 'forward' ? '顺排' : '逆排'}

## 要求
请撰写一份约3000字的完整命书报告，包含以下章节：

1. **命盘总览** - 日主分析、五行格局、纳音解读
2. **性格深度分析** - 十神性格、天赋潜能、性格盲点
3. **事业与财运** - 适合行业、事业阶段、财富格局
4. **感情与婚姻** - 婚姻宫、桃花运、感情建议
5. **健康与养生** - 五行健康提示
6. **大运分析** - 各阶段运势解读
7. **流年运势** - 当年与下一年详细预测
8. **开运指南** - 颜色/数字/方位/饰品/风水建议
9. **附录** - 术语解释

要求：
- 语言优雅、专业、有深度
- 结合具体八字格局给出针对性分析
- 避免空泛套话
- 使用Markdown格式，适当使用emoji增强可读性

---
⚠️ 本解读由AI生成，仅供参考和娱乐，不作为人生决策依据。`;
}
