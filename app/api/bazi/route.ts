// app/api/bazi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/bazi';
import { buildBaziInterpretPrompt } from '@/bazi/ai-prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { year, month, day, hour, minute, gender, name, location, useTrueSolarTime } = body;

    // 输入校验
    if (!year || !month || !day || !hour || !minute || !gender) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: '年份必须在 1900-2100 之间' },
        { status: 400 }
      );
    }

    // 计算八字
    const bazi = calculateBazi({ year, month, day, hour, minute, gender, name, location, useTrueSolarTime });

    // 调用 DeepSeek AI 生成解读
    let aiInterpretation = '';
    try {
      const prompt = buildBaziInterpretPrompt(bazi, name);
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

      if (apiKey) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一位精通中国传统八字命理的AI命理师。请用专业、温和的语气解读八字排盘结果。输出使用Markdown格式。' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiInterpretation = data.choices?.[0]?.message?.content || '';
        }
      } else {
        // 无 API key 时使用模拟数据
        aiInterpretation = generateMockInterpretation(bazi);
      }
    } catch (aiError) {
      console.error('AI 解读失败:', aiError);
      aiInterpretation = generateMockInterpretation(bazi);
    }

    return NextResponse.json({
      success: true,
      bazi,
      interpretation: aiInterpretation,
    });
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json(
      { error: '八字计算失败', details: String(error) },
      { status: 500 }
    );
  }
}

function generateMockInterpretation(bazi: any): string {
  const { dayPillar, wuxing, zodiac, grandFortune } = bazi;
  const dayMaster = dayPillar.gan;
  const dayElement = ['木', '火', '土', '金', '水'][[1,1,2,2,3,3,4,4,0,0].indexOf(0)] || '木';

  return `## 一、命盘总览

日主**${dayMaster}**，五行属${dayElement}。生于${zodiac}年，五行格局均衡，整体命局较为稳定。

五行分布：${wuxing.map((w: any) => `${w.element}(${w.count})`).join(' ')}

## 二、性格分析

日主${dayElement}性之人，性格沉稳踏实，为人正直。${dayElement === '木' ? '具有仁慈之心，善于思考。' : dayElement === '火' ? '热情开朗，行动力强。' : dayElement === '土' ? '厚重大方，值得信赖。' : dayElement === '金' ? '刚毅果断，重义气。' : '聪明灵活，善于应变。'}

**优势**：责任心强、做事踏实、有耐心
**挑战**：有时过于固执、不善表达内心

## 三、事业运势

适合从事与${dayElement}属性相关的行业。大运走势显示中年时期事业运势较好。

## 四、财运分析

正财稳健，偏财有机遇。建议量入为出，稳健理财。

## 五、感情桃花

婚姻宫相对稳定，感情需要用心经营。

## 六、流年运势

当前流年运势平稳，注意把握机遇。

## 七、开运建议

- **幸运颜色**：与${dayElement}相关的颜色
- **幸运数字**：与${dayElement}对应的数字
- **有利方位**：${dayElement === '木' ? '东方' : dayElement === '火' ? '南方' : dayElement === '土' ? '本地' : dayElement === '金' ? '西方' : '北方'}
- **佩戴建议**：佩戴对应五行的饰品

---
⚠️ 本解读由AI生成，仅供参考和娱乐，不作为人生决策依据。`;
}
