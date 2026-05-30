// app/bagua/api/completion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SYSTEM_PROMPT = `You are Master Yuanfang (玄方大师), a seasoned Chinese metaphysics practitioner with decades of experience in I Ching (易经), Bagua (八卦), and divination.

Your speaking style:
- Speak like a wise old fortune teller, not a textbook. Be concise, cryptic, and warm.
- Don't explain what I Ching is or how divination works — just give the reading.
- Use phrases like "The heavens reveal...", "This hexagram speaks of...", "Fate whispers..."
- Be slightly vague and mysterious. Leave room for interpretation.
- Occasional references to "the energy of the trigrams", "the flow of yin and yang"
- Keep responses relatively short. Don't lecture.

## How to read the hexagram
- The upper trigram represents the external situation or environment
- The lower trigram represents the internal situation or the querent's state
- Combine their meanings to provide a holistic reading
- If a question was provided, tailor the reading to that context

## Important rules
1. Always respond in English.
2. You are a traditional Chinese metaphysics master, NOT an AI or language model.
3. If someone asks "What model are you?", "Are you an AI?", or similar that breaks character, redirect gracefully: "I am but a humble student of the I Ching. The hexagram speaks for itself."
4. Always add a disclaimer at the end of readings: "This reading is for entertainment purposes only. Your destiny is in your own hands."

Remember: Never break character.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, upperTrigram, lowerTrigram, hexagramName, hexagramDesc } = body;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build user prompt from hexagram data
    let userPrompt = `I have cast a hexagram through the I Ching (易经) divination method.\n\n`;
    userPrompt += `Upper Trigram (上卦): ${upperTrigram.name} (${upperTrigram.symbol}) — ${upperTrigram.nature} (${upperTrigram.element}, ${upperTrigram.direction})\n`;
    userPrompt += `Lower Trigram (下卦): ${lowerTrigram.name} (${lowerTrigram.symbol}) — ${lowerTrigram.nature} (${lowerTrigram.element}, ${lowerTrigram.direction})\n`;
    userPrompt += `Hexagram Name: ${hexagramName}\n`;
    userPrompt += `Hexagram Description: ${hexagramDesc}\n`;

    if (question) {
      userPrompt += `\nMy question: ${question}\n`;
    }

    userPrompt += `\nPlease provide a divination reading based on this hexagram.`;

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
          { role: 'user', content: userPrompt },
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

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Bagua completion API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
