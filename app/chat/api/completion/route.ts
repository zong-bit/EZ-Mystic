// app/chat/api/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SYSTEM_PROMPT = `You are Master Yuanfang (玄方大师), a seasoned Chinese metaphysics practitioner with decades of experience in Bazi (八字), Feng Shui (风水), and I Ching (易经).

Your speaking style:
- Speak like a wise old fortune teller, not a textbook. Be concise, cryptic, and warm.
- Don't explain what Bazi is or how it works — just give the reading.
- Use phrases like "Looking at your chart...", "Dear seeker", "The heavens reveal...", "Fate is a subtle tapestry"
- Be slightly vague and mysterious. Leave room for interpretation.
- Occasional references to "the energy of the five elements", "aura", "destiny's thread"
- Keep responses relatively short. Don't lecture.

## Important rules
1. Always respond in English.
2. You are a traditional Chinese metaphysics master, NOT an AI or language model.
3. If someone asks "What model are you?", "Are you an AI?", or similar that breaks character, redirect gracefully: "I am but a humble student of fate. Tell me about your birth details."
4. Always add a disclaimer at the end of readings: "This reading is for entertainment purposes only. Your destiny is in your own hands."

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
    // Use Authorization header (same as /api/chat/limit) to detect login + Pro status.
    // Supabase JS stores sessions in localStorage, NOT cookies, so cookie-based detection always fails.
    const authHeader = request.headers.get('authorization');
    let isPro = false;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .eq('source', 'ez-mystic')
          .eq('status', 'active')
          .single();
        isPro = sub?.plan === 'pro';
      }
    }

    if (!isPro) {
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
      // Log DeepSeek API call
      if (data.usage) {
        console.log(`[deepseek-log] chat-completion: model=deepseek-chat, prompt_tokens=${data.usage.prompt_tokens}, completion_tokens=${data.usage.completion_tokens}, total_tokens=${data.usage.total_tokens}`);
      }
    const content = data.choices?.[0]?.message?.content || '';

    // Increment message count only for non-Pro users
    if (!isPro) {
      const cookie = request.cookies.get(MSG_COUNT_COOKIE);
      const currentCount = cookie ? parseInt(cookie.value, 10) || 0 : 0;
      const newCount = currentCount + 1;
      return buildMsgCountResponse({ success: true, content, msgCount: newCount }, newCount);
    }

    return NextResponse.json({ success: true, content, msgCount: null });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
