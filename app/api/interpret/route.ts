// app/api/interpret/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildFateBookPrompt } from '@/bazi/ai-prompt';
import type { BaziResult } from '@/bazi/types';
import { trackUsage } from '@/lib/usage-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, name } = body;

    if (!bazi) {
      return NextResponse.json({ error: 'Bazi data is required' }, { status: 400 });
    }

    // Call DeepSeek to generate the full Destiny Book
    let fullContent = '';
    try {
      const prompt = buildFateBookPrompt(bazi as BaziResult, name);
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
              { role: 'system', content: 'You are a senior Bazi (Four Pillars of Destiny) master. Please write a professional destiny report in Markdown format.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          fullContent = data.choices?.[0]?.message?.content || '';
        }
      } else {
        fullContent = 'No Destiny Book content available (please configure the DEEPSEEK_API_KEY environment variable).';
      }
    } catch (error) {
      console.error('Destiny book generation failed:', error);
      fullContent = 'Destiny book generation failed, please try again later.';
    }

    // Track usage in Supabase (fire & forget)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    trackUsage({
      source: 'fatewise',
      endpoint: 'interpret',
      ip,
    });

    return NextResponse.json({
      success: true,
      content: fullContent,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
