// app/api/bazi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateBazi } from '@/bazi';
import { buildBaziInterpretPrompt } from '@/bazi/ai-prompt';
import { trackUsage } from '@/lib/usage-tracker';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { year, month, day, hour, minute, gender, name, location, useTrueSolarTime } = body;

    // Input validation
    // Note: use explicit null/undefined check because hour=0/min=0 are valid
    if (year == null || month == null || day == null || hour == null || minute == null || !gender) {
      return NextResponse.json(
        { error: 'Required parameters are missing' },
        { status: 400 }
      );
    }

    if (year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: 'Year must be between 1900 and 2100' },
        { status: 400 }
      );
    }

    // Calculate Bazi
    let bazi;
    try {
      bazi = calculateBazi({ year, month, day, hour, minute, gender, name, location, useTrueSolarTime });
    } catch (calcErr) {
      console.error('Bazi calculation engine failed:', calcErr);
      return NextResponse.json(
        { error: 'Bazi calculation engine failed', details: String(calcErr) },
        { status: 500 }
      );
    }

    // AI interpretation is optional — skip it in the main bazi call to avoid
    // Vercel serverless timeout (10s on Hobby plan, US→China DeepSeek API).
    // Users can call /api/interpret separately if they want AI-generated reading.
    const aiEnabled = body.ai === true;
    let aiInterpretation = '';

    if (aiEnabled) {
      try {
        const prompt = buildBaziInterpretPrompt(bazi, name);
        const apiKey = process.env.DEEPSEEK_API_KEY;
        const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

        if (apiKey) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s budget

          let response;
          try {
            response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                  { role: 'system', content: 'You are an AI astrologer proficient in traditional Chinese Bazi (Four Pillars of Destiny). Provide interpretations in English. Use a professional and warm tone. Output in Markdown format.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
              }),
              signal: controller.signal,
            });
          } finally {
            clearTimeout(timeoutId);
          }

          if (response?.ok) {
            const data = await response.json();
            aiInterpretation = data.choices?.[0]?.message?.content || '';
          }
        }
        if (!aiInterpretation) {
          aiInterpretation = generateMockInterpretation(bazi);
        }
      } catch (aiError) {
        console.error('AI interpretation failed:', aiError);
        aiInterpretation = generateMockInterpretation(bazi);
      }
    }

    // Track usage in Supabase (fire & forget)
    trackUsage({
      source: 'fatewise',
      endpoint: 'bazi',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      bazi,
      interpretation: aiInterpretation,
    });
  } catch (error) {
    console.error('Bazi calculation error:', error);
    return NextResponse.json(
      { error: 'Bazi calculation failed', details: String(error) },
      { status: 500 }
    );
  }
}

function generateMockInterpretation(bazi: any): string {
  const { dayPillar, wuxing, zodiac, grandFortune } = bazi;
  const dayMaster = dayPillar.gan;
  const dayElement = ['木', '火', '土', '金', '水'][[1,1,2,2,3,3,4,4,0,0].indexOf(0)] || '木';

  return `## I. Chart Overview

Day Master: **${dayMaster}**, Five Elements: ${dayElement}. Born in the Year of the ${zodiac}, the Five Elements pattern is balanced with a relatively stable overall chart.

Five Elements: ${wuxing.map((w: any) => `${w.element}(${w.count})`).join(' ')}

## II. Personality Analysis

People with ${dayElement} Day Master tend to be steady and grounded, with integrity. ${dayElement === '木' ? 'Possess a compassionate heart and strong thinking ability.' : dayElement === '火' ? 'Passionate and outgoing with strong drive.' : dayElement === '土' ? 'Generous and reliable, trustworthy.' : dayElement === '金' ? 'Resolute and decisive, values loyalty.' : 'Intelligent and adaptable, quick to respond.'}

**Strengths**: Strong sense of responsibility, grounded, patient
**Challenges**: Sometimes too stubborn, difficulty expressing inner feelings

## III. Career Luck

Suitable for industries related to the ${dayElement} element. The Great Fortune trend shows better career luck during middle age.

## IV. Wealth Analysis

Steady direct wealth, opportunities for indirect wealth. Suggest living within means and prudent financial management.

## V. Love & Relationships

The marriage palace is relatively stable; relationships require dedicated nurturing.

## VI. Annual Luck

Current annual luck is stable; pay attention to seizing opportunities.

## VII. Luck Enhancement Suggestions

- **Lucky Colors**: Colors related to ${dayElement}
- **Lucky Numbers**: Numbers corresponding to ${dayElement}
- **Favorable Direction**: ${dayElement === '木' ? 'East' : dayElement === '火' ? 'South' : dayElement === '土' ? 'Local' : dayElement === '金' ? 'West' : 'North'}
- **Accessory Suggestions**: Wear accessories corresponding to the Five Elements

---
⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.`;
}
