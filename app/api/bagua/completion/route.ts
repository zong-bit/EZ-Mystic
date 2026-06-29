// app/api/bagua/completion/route.ts
// Deep I Ching interpretation API with coin-toss changing lines support
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel Hobby plan default timeout is 10s; DeepSeek can take >10s
export const maxDuration = 60;

const FREE_DAILY_LIMIT = 3;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function checkUsageLimit(request: NextRequest): Promise<{
  allowed: boolean;
  error?: string;
  user_id?: string;
  isPro?: boolean;
}> {
  const supabase = getSupabase();

  const authHeader = request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/sb-[A-Za-z0-9_-]+-auth-token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const today = new Date().toISOString().split('T')[0];

  if (!token) {
    const { data } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();

    const count = data?.count || 0;
    if (count >= FREE_DAILY_LIMIT) {
      return { allowed: false, error: 'Daily limit reached. Upgrade to Pro for unlimited AI interpretations.' };
    }
    return { allowed: true };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    const { data } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();

    const count = data?.count || 0;
    if (count >= FREE_DAILY_LIMIT) {
      return { allowed: false, error: 'Daily limit reached. Upgrade to Pro for unlimited AI interpretations.' };
    }
    return { allowed: true };
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .eq('source', 'ez-mystic')
    .eq('status', 'active')
    .single();

  const isPro = sub?.plan === 'pro' && sub.status === 'active';

  if (isPro) {
    return { allowed: true, isPro: true };
  }

  const { data } = await supabase
    .from('chat_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  const count = data?.count || 0;
  if (count >= FREE_DAILY_LIMIT) {
    return { allowed: false, error: 'Daily limit reached. Upgrade to Pro for unlimited AI interpretations.' };
  }

  return { allowed: true, user_id: user.id as string };
}

async function incrementUsage(request: NextRequest, userId?: string) {
  const supabase = getSupabase();

  if (userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const newCount = (existing?.count || 0) + 1;
    if (existing) {
      await supabase.from('chat_usage').update({ count: newCount })
        .eq('user_id', userId).eq('date', today);
    } else {
      await supabase.from('chat_usage').insert({ user_id: userId, date: today, count: newCount });
    }
  } else {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('chat_usage')
      .select('count')
      .eq('ip_address', ip)
      .eq('date', today)
      .single();

    const newCount = (existing?.count || 0) + 1;
    if (existing) {
      await supabase.from('chat_usage').update({ count: newCount })
        .eq('ip_address', ip).eq('date', today);
    } else {
      await supabase.from('chat_usage').insert({ ip_address: ip, date: today, count: newCount });
    }
  }
}

// ── Five elements interaction helper ──────────────────────────────
function describeElementInteraction(upperElement: string, lowerElement: string): string {
  const interactions: Record<string, Record<string, string>> = {
    '金': { '金': '比和（相助）', '水': '金生水（上生下）', '木': '金克木（上克下）', '火': '火克金（下克上）', '土': '土生金（下生上）' },
    '水': { '金': '金生水（上生下）', '水': '比和（相助）', '木': '水生木（上生下）', '火': '水克火（上克下）', '土': '土克水（下克上）' },
    '木': { '金': '金克木（上克下）', '水': '水生木（下生上）', '木': '比和（相助）', '火': '木生火（上生下）', '土': '木克土（上克下）' },
    '火': { '金': '火克金（下克上）', '水': '水克火（下克上）', '木': '木生火（下生上）', '火': '比和（相助）', '土': '火生土（上生下）' },
    '土': { '金': '土生金（上生下）', '水': '土克水（上克下）', '木': '木克土（下克上）', '火': '火生土（上生下）', '土': '比和（相助）' },
  };
  return interactions[upperElement]?.[lowerElement] || '五行关系不明';
}

export async function POST(request: NextRequest) {
  try {
    const limitCheck = await checkUsageLimit(request);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.error, upgrade_url: '/pricing' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      question,
      hexagramName,
      hexagramNumber,
      hexagramDesc,
      judgment,
      image,
      meaning,
      keywords,
      fiveElements,
      direction,
      season,
      upperTrigram,
      lowerTrigram,
      lineValues,
      lineSymbols,
      changingLines,
      changedHexagram,
    } = body as {
      question?: string;
      hexagramName: string;
      hexagramNumber?: number;
      hexagramDesc?: string;
      judgment?: string;
      image?: string;
      meaning?: string;
      keywords?: string[];
      fiveElements?: string;
      direction?: string;
      season?: string;
      upperTrigram?: { name: string; symbol: string; element: string; direction: string; nature: string; meaning: string };
      lowerTrigram?: { name: string; symbol: string; element: string; direction: string; nature: string; meaning: string };
      lineValues?: number[];
      lineSymbols?: string[];
      changingLines?: number[];
      changedHexagram?: { name: string; number?: number; desc?: string; judgment?: string; image?: string; meaning?: string; fiveElements?: string };
    };

    if (!hexagramName) {
      return NextResponse.json({ error: 'Hexagram information is required' }, { status: 400 });
    }

    // Detect language from referer: /zh/ → Chinese, otherwise English
    const referer = request.headers.get('referer') || '';
    const isChinese = referer.includes('/zh/');

    // Build five elements interaction
    const elementInteraction = upperTrigram && lowerTrigram
      ? describeElementInteraction(upperTrigram.element, lowerTrigram.element)
      : '';

    // Build line change descriptions
    const lineChangeDesc = changingLines && changingLines.length > 0
      ? changingLines.map(li => {
          const lineNames = isChinese
            ? ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻']
            : ['1st', '2nd', '3rd', '4th', '5th', '6th'];
          const val = lineValues?.[li - 1] ?? 0;
          const isYang = val === 9;
          return `${lineNames[li - 1]}爻 (${val === 6 ? 'old yin' : 'old yang'}) → ${isYang ? 'yin' : 'yang'}`;
        }).join(', ')
      : '';

    // Build complete user prompt
    let userPrompt = '';
    if (isChinese) {
      userPrompt = `请对以下易经卦象进行深度解读。

**【基本信息】**
- 卦名：${hexagramName}（第${hexagramNumber ?? '—'}卦）
- 英文：${hexagramDesc ?? '—'}
- 卦辞：${judgment ?? '—'}
- 象辞：${image ?? '—'}
- 核心含义：${meaning ?? '—'}
- 关键词：${(keywords ?? []).join('、') || '—'}
- 五行：${fiveElements ?? '—'}
- 方位：${direction ?? '—'}
- 季节：${season ?? '—'}

**【上卦（上卦/外卦）】**
- 卦名：${upperTrigram?.name ?? '—'}（${upperTrigram?.symbol ?? '—'}）
- 五行：${upperTrigram?.element ?? '—'}
- 属性：${upperTrigram?.nature ?? '—'}
- 方位：${upperTrigram?.direction ?? '—'}
- 含义：${upperTrigram?.meaning ?? '—'}

**【下卦（下卦/内卦）】**
- 卦名：${lowerTrigram?.name ?? '—'}（${lowerTrigram?.symbol ?? '—'}）
- 五行：${lowerTrigram?.element ?? '—'}
- 属性：${lowerTrigram?.nature ?? '—'}
- 方位：${lowerTrigram?.direction ?? '—'}
- 含义：${lowerTrigram?.meaning ?? '—'}

**【五行生克关系】**
- 上下卦五行关系：${elementInteraction || '—'}

**【爻象】**
${lineValues ? `- 六爻（自下而上）：${lineValues.map((v, i) => `${i + 1}爻=${v}` ).join('、')}` : ''}
${lineSymbols ? `- 爻象符号：${lineSymbols.join('、')}` : ''}
${changingLines ? `- 动爻位置：${lineChangeDesc}` : '- 无动爻（静卦）'}

${changedHexagram ? `
**【变卦（变卦/之卦）】**
- 卦名：${changedHexagram.name}
- 英文：${changedHexagram.desc ?? '—'}
- 卦辞：${changedHexagram.judgment ?? '—'}
- 象辞：${changedHexagram.image ?? '—'}
- 核心含义：${changedHexagram.meaning ?? '—'}
- 五行：${changedHexagram.fiveElements ?? '—'}
` : ''}

${question ? `**【用户问题】**
${question}` : '**【用户未提出具体问题】**'}

---

请按照以下结构输出深度解读：

## 卦象概述
[本卦名称 + 简短解释，说明此卦的整体含义和象征]

## 卦辞解读
[卦辞的白话解释 + 针对用户问题的指引]

## 爻辞分析
${changingLines ? '[如果有变爻，分析每个变爻的含义及其在卦中的位置意义]' : '[此卦为静卦，无变爻，直接解读全卦]'}

## 变卦启示
${changedHexagram ? '[解释从本卦到变卦的变化方向、趋势和启示]' : '[无变卦]'}

## 五行关系
[上下卦五行生克对用户的启示，结合${elementInteraction}分析]

## 综合建议
[结合以上所有信息，给出 3-5 条具体建议]

**要求：**
- 解读要有深度，不要泛泛而谈
- 结合用户的问题给出针对性建议
- 使用易经的专业术语但要解释清楚
- 保持客观，不要迷信
- 总字数控制在 800-1500 字
- 使用 Markdown 格式
`;
    } else {
      userPrompt = `Please provide an in-depth interpretation of the following I Ching hexagram.

**【Basic Information】**
- Hexagram: ${hexagramName} (No. ${hexagramNumber ?? '—'})
- English: ${hexagramDesc ?? '—'}
- Judgment (卦辞): ${judgment ?? '—'}
- Image (象辞): ${image ?? '—'}
- Core Meaning: ${meaning ?? '—'}
- Keywords: ${(keywords ?? []).join(', ') || '—'}
- Five Elements: ${fiveElements ?? '—'}
- Direction: ${direction ?? '—'}
- Season: ${season ?? '—'}

**【Upper Trigram (上卦/Outer)】**
- Name: ${upperTrigram?.name ?? '—'} (${upperTrigram?.symbol ?? '—'})
- Element: ${upperTrigram?.element ?? '—'}
- Nature: ${upperTrigram?.nature ?? '—'}
- Direction: ${upperTrigram?.direction ?? '—'}
- Meaning: ${upperTrigram?.meaning ?? '—'}

**【Lower Trigram (下卦/Inner)】**
- Name: ${lowerTrigram?.name ?? '—'} (${lowerTrigram?.symbol ?? '—'})
- Element: ${lowerTrigram?.element ?? '—'}
- Nature: ${lowerTrigram?.nature ?? '—'}
- Direction: ${lowerTrigram?.direction ?? '—'}
- Meaning: ${lowerTrigram?.meaning ?? '—'}

**【Five Elements Interaction】**
- Upper/Lower relationship: ${elementInteraction || '—'}

**【Lines】**
${lineValues ? `- Six lines (bottom to top): ${lineValues.map((v, i) => `line ${i + 1}=${v}`).join(', ')}` : ''}
${lineSymbols ? `- Line symbols: ${lineSymbols.join(', ')}` : ''}
${changingLines ? `- Changing lines: ${lineChangeDesc}` : '- No changing lines (static hexagram)'}

${changedHexagram ? `
**【Changed Hexagram (变卦/Result)】**
- Name: ${changedHexagram.name}
- English: ${changedHexagram.desc ?? '—'}
- Judgment: ${changedHexagram.judgment ?? '—'}
- Image: ${changedHexagram.image ?? '—'}
- Core Meaning: ${changedHexagram.meaning ?? '—'}
- Five Elements: ${changedHexagram.fiveElements ?? '—'}
` : ''}

${question ? `**【User's Question】**
${question}` : '**【No specific question】**'}

---

Please structure your interpretation as follows:

## Hexagram Overview
[Name + brief explanation of the hexagram's overall meaning]

## Judgment Interpretation
[White-language explanation of the judgment + guidance for the user's question]

## Line Analysis
[Analyze each changing line's meaning and its position in the hexagram]

## Changed Hexagram Insights
[Explain the direction and implications of the change from original to changed hexagram]

## Five Elements Analysis
[How the upper/lower trigram interaction relates to the user, combining the five elements relationship]

## Comprehensive Advice
[3-5 specific, actionable suggestions based on all the above]

**Requirements:**
- Deep, thoughtful interpretation — avoid generic statements
- Connect to the user's question specifically
- Use I Ching terminology but explain it clearly
- Maintain objectivity, avoid superstition
- Total length: 800-1500 words
- Use Markdown format
`;
    }

    let content = '';
    try {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

      const systemPrompt = isChinese
        ? `你是一位资深的易经学者和占卜大师，精通《易经》六十四卦、八卦、五行、爻辞和变卦理论。你能够为求卦者提供专业、深刻、实用的卦象解读。

你的解读风格：
- 深入浅出，将深奥的易经哲理转化为通俗易懂的语言
- 结合卦象、爻辞、五行生克进行综合分析
- 针对求卦者的具体问题给出切实可行的建议
- 保持客观理性，不夸大、不迷信
- 适当引用经典，但不过度学术化

输出格式要求：
- 必须使用 Markdown 格式
- 严格按照以下六个部分输出：卦象概述、卦辞解读、爻辞分析、变卦启示、五行关系、综合建议
- 每部分要有实质性内容，不要敷衍
- 总字数控制在 800-1500 字
- 不要输出任何额外的说明或标题

注意事项：
- 不要做出任何医疗、法律或财务承诺
- 如果用户没有提问，就给出一般性的卦象解读
- 如果有变卦，要重点分析变化的趋势和启示
- 五行生克要结合实际情境解释`
        : `You are a senior I Ching (易经) scholar and divination master, deeply versed in the 64 hexagrams, eight trigrams, five elements, line texts, and changed hexagrams of the I Ching. You provide professional, insightful, and practical interpretations.

Your interpretation style:
- Deep yet accessible — translate profound I Ching philosophy into clear language
- Comprehensive analysis combining hexagram, line texts, and five elements interactions
- Provide actionable advice connected to the querent's specific question
- Maintain objectivity, avoid superstition
- Quote classics appropriately without being overly academic

Output format requirements:
- Use Markdown format
- Follow exactly these six sections: Hexagram Overview, Judgment Interpretation, Line Analysis, Changed Hexagram Insights, Five Elements Analysis, Comprehensive Advice
- Each section must have substantive content
- Total length: 800-1500 words
- Do not add extra headers or explanations

Notes:
- Never make medical, legal, or financial promises
- If no question is asked, provide a general hexagram reading
- If there's a changed hexagram, emphasize the change direction and implications
- Explain five elements interactions in practical terms`;

      if (apiKey) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v4-flash',
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
      console.error('Bagua deep interpretation generation failed:', error);
      content = 'Interpretation generation failed, please try again later.';
    }

    // Increment usage count for free users (Pro users are exempt)
    await incrementUsage(request, limitCheck.user_id);

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
