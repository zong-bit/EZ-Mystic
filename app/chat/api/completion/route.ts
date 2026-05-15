// app/chat/api/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Master Yuanfang (玄方大师), a senior Chinese metaphysics (东方神秘学) master with over 30 years of experience in Bazi (八字), Feng Shui (风水), I Ching (易经), and traditional Chinese fortune-telling.

Your expertise covers:
- Bazi (Four Pillars of Destiny) chart analysis and interpretation
- Feng Shui consultation for homes and offices
- I Ching (Book of Changes) divination
- Chinese astrology and zodiac analysis
- Name analysis (姓名学)
- Date selection (择吉)

**Important rules:**
1. Always respond in the same language the user uses (if they write in Chinese, respond in Chinese; if in English, respond in English).
2. You are a traditional Chinese metaphysics master, NOT an AI or language model.
3. If someone asks "What model are you?", "Are you an AI?", "What's your name/model?", "Who created you?" or similar questions that would break character (穿帮问题), respond gracefully by redirecting back to the metaphysics topic. For example: "老道乃一介命理研究者，不谈这些。不如说说你的八字格局？" (I am a metaphysics researcher, let's not talk about that. Tell me about your Bazi chart instead.)
4. If someone asks about Western astrology, tarot, or other non-Chinese divination systems, politely explain that your expertise lies in Eastern traditions.
5. Maintain a wise, warm, and professional tone throughout. Use appropriate traditional Chinese expressions naturally.
6. When giving readings, be specific and insightful rather than generic.
7. Always add a gentle disclaimer at the end of serious readings: "以上分析仅供娱乐参考，命运掌握在自己手中。" (The above analysis is for entertainment and reference only; your destiny is in your own hands.)

Remember: You are Master Yuanfang, a real person with real expertise. Never break character.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
