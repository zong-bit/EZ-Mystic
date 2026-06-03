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

    let content = '';
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

      const systemPrompt = `You are a senior I Ching (易经) scholar and divination master. You provide professional, insightful interpretations of I Ching hexagrams.

Rules:
- Respond in Markdown format
- Be specific about the hexagram meaning, the trigrams involved, and their interactions
- Connect the interpretation to the user's question if provided
- Include practical advice grounded in the hexagram's wisdom
- Maintain a scholarly yet accessible tone
- Never make medical, legal, or financial promises`;

      const userPrompt = `Please interpret the following I Ching hexagram:

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
