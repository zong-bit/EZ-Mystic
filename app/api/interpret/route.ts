// app/api/interpret/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildFateBookPrompt } from '@/bazi/ai-prompt';
import type { BaziResult } from '@/bazi/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, name } = body;

    if (!bazi) {
      return NextResponse.json({ error: '缺少八字数据' }, { status: 400 });
    }

    // 调用 DeepSeek 生成完整命书
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
              { role: 'system', content: '你是一位资深八字命理师，请撰写专业的命理报告。使用Markdown格式。' },
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
        fullContent = '暂无命书内容（请配置 DEEPSEEK_API_KEY 环境变量）';
      }
    } catch (error) {
      console.error('命书生成失败:', error);
      fullContent = '命书生成失败，请稍后重试。';
    }

    return NextResponse.json({
      success: true,
      content: fullContent,
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
