// app/api/bagua/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Vercel Hobby plan default timeout is 10s; DeepSeek v4-pro can take >10s
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, upperTrigram, lowerTrigram, hexagramName, hexagramDesc } = body;

    if (!hexagramName) {
      return NextResponse.json({ error: 'Hexagram information is required' }, { status: 400 });
    }

    // Detect language from referer: /zh/ → Chinese, otherwise English
    const referer = request.headers.get('referer') || '';
    const isChinese = referer.includes('/zh/');

    let content = '';
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

      const systemPrompt = isChinese
        ? `你是一位资深的易经学者和占卜大师。你提供专业的、深刻的易经卦象解读。

规则：
- 使用中文 Markdown 格式回复
- 具体说明卦象含义、上下卦的构成及其相互作用
- 如果用户提出了问题，将解读与用户的问题联系起来
- 提供基于卦象智慧的实用建议
- 保持学术性但通俗易懂的语气
- 不要做出任何医疗、法律或财务承诺`
        : `You are a senior I Ching (易经) scholar and divination master. You provide professional, insightful interpretations of I Ching hexagrams.

Rules:
- Respond in Markdown format
- Be specific about the hexagram meaning, the trigrams involved, and their interactions
- Connect the interpretation to the user's question if provided
- Include practical advice grounded in the hexagram's wisdom
- Maintain a scholarly yet accessible tone
- Never make medical, legal, or financial promises`;

      const userPrompt = isChinese
        ? `请解读以下易经卦象：

**卦名：${hexagramName}**
${hexagramDesc ? `描述：${hexagramDesc}` : ''}

**上卦（乾/坤等）：${upperTrigram?.name} (${upperTrigram?.symbol})**
- 五行：${upperTrigram?.element}
- 属性：${upperTrigram?.nature}
- 方位：${upperTrigram?.direction}

**下卦（乾/坤等）：${lowerTrigram?.name} (${lowerTrigram?.symbol})**
- 五行：${lowerTrigram?.element}
- 属性：${lowerTrigram?.nature}
- 方位：${lowerTrigram?.direction}

${question ? `**用户问题：** ${question}` : '未提出具体问题。'}

请提供综合解读，涵盖：
1. 此卦的含义
2. 上下卦的相互作用
3. 对用户问题的指引（如有）
4. 针对当前情况的实用建议`
        : `Please interpret the following I Ching hexagram:

**Hexagram: ${hexagramName}**
${hexagramDesc ? `Description: ${hexagramDesc}` : ''}

**Upper Trigram (上卦): ${upperTrigram?.name} (${upperTrigram?.symbol})**
- Element: ${upperTrigram?.element}
- Nature: ${upperTrigram?.nature}
- Direction: ${upperTrigram?.direction}

**Lower Trigram (下卦): ${lowerTrigram?.name} (${lowerTrigram?.symbol})**
- Element: ${lowerTrigram?.element}
- Nature: ${lowerTrigram?.nature}
- Direction: ${lowerTrigram?.direction}

${question ? `**User's Question:** ${question}` : 'No specific question was asked.'}

Please provide a comprehensive interpretation covering:
1. The meaning of this hexagram
2. The interaction between the upper and lower trigrams
3. Guidance related to the user's question (if provided)
4. Practical advice for the situation`;

      if (apiKey) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v4-pro',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content || '';
        }
      } else {
        content = 'No interpretation available (please configure the DEEPSEEK_API_KEY environment variable).';
      }
    } catch (error) {
      console.error('Bagua interpretation generation failed:', error);
      content = 'Interpretation generation failed, please try again later.';
    }

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
