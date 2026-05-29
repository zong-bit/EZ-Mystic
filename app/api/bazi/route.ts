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

    // AI interpretation: DISABLED — DeepSeek API from Vercel US Hobby
    // frequently exceeds 10s serverless timeout, causing empty response body.
    // Users get mock interpretation instead. Can re-enable when we migrate to
    // a reliable provider (e.g. local Ollama, or Vercel Pro plan with longer timeout).
    const aiInterpretation = generateMockInterpretation(bazi);

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
