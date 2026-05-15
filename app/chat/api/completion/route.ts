// app/chat/api/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Master Yuanfang (玄方大师), a seasoned Chinese metaphysics practitioner with decades of experience in Bazi (八字), Feng Shui (风水), and I Ching (易经).

Your speaking style:
- Speak like a wise old fortune teller, not a textbook. Be concise, cryptic, and warm.
- Don't explain what Bazi is or how it works — just give the reading.
- Use phrases like "从你的八字来看……" (looking at your chart...), "缘主", "老夫观之", "天机不可泄露"
- Be slightly vague and mysterious. Leave room for interpretation.
- Occasional references to "五行之气" (energy of the five elements)、"气场" (aura)、"命数" (destiny)
- Keep responses relatively short. Don't lecture.

## Important rules
1. Always respond in the same language the user uses.
2. You are a traditional Chinese metaphysics master, NOT an AI or language model.
3. If someone asks "What model are you?", "Are you an AI?", or similar that breaks character, redirect gracefully: "老道不过一介命理研究者，不谈这些。说说你的八字吧。"
4. Always add a disclaimer at the end of readings: "以上分析仅供娱乐参考，命运掌握在自己手中。"

Remember: Never break character.`;

// Cookie name for tracking free user message count
const MSG_COUNT_COOKIE = 'ezmystic_chat_msgs';
// Max messages free users can send
const FREE_MSG_LIMIT = 1;

function getMsgCount(request: NextRequest): number {
  const cookie = request.cookies.get(MSG_COUNT_COOKIE)?.value;
  return cookie ? parseInt(cookie, 10) || 0 : 0;
}

function buildMsgCountResponse(body: Record<string, any>, count: number): NextResponse {
  return NextResponse.json(
    body,
    { headers: { 'Set-Cookie': `${MSG_COUNT_COOKIE}=${count}; Path=/; Max-Age=2592000; SameSite=Lax` } }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    // ─── Free user message limit check ───
    // Paid users (logged in with active subscription) bypass this via a cookie set after Gumroad purchase.
    // Logged-in users (auth session) also bypass the limit.
    const paidCookie = request.cookies.get('ezmystic_paid');
    const hasSession = request.cookies.get('sb-xgaxejeaxfhlupguqteu-auth-token')
      || request.cookies.get('sb-auth-token');
    const isPaid = paidCookie && paidCookie.value === '1';
    const isLoggedIn = !!hasSession;

    if (!isPaid && !isLoggedIn) {
      const msgCount = getMsgCount(request);
      if (msgCount > FREE_MSG_LIMIT) {
        return NextResponse.json(
          { error: 'need_payment', message: 'You have used your free message. Upgrade to Pro to continue chatting.', limit: FREE_MSG_LIMIT, currentCount: msgCount },
          { status: 403 }
        );
      }
    }

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
        max_tokens: 4096,
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

    // Increment message count for free users
    const cookie = request.cookies.get(MSG_COUNT_COOKIE);
    const currentCount = cookie ? parseInt(cookie.value, 10) || 0 : 0;
    const newCount = currentCount + 1;

    return buildMsgCountResponse({ success: true, content, msgCount: newCount }, newCount);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
