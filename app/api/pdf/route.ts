// app/api/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import type { BaziResult } from '@/bazi/types';

// Load Noto Sans SC fonts (server-side only, cached at module level)
const fontRegularPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Regular.ttf');
const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansSC-Bold.ttf');

const fontRegularBase64 = fs.readFileSync(fontRegularPath, 'base64');
const fontBoldBase64 = fs.readFileSync(fontBoldPath, 'base64');

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 天干五行映射：甲乙→木, 丙丁→火, 戊己→土, 庚辛→金, 壬癸→水
const TIAN_GAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'] as const;

function getDayMasterElement(gan: string): string {
  const idx = TIAN_GAN.indexOf(gan as typeof TIAN_GAN[number]);
  return idx >= 0 ? TIAN_GAN_WUXING[idx] : '木';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, name, interpretation, title = '天命之书' } = body;

    if (!bazi) {
      return NextResponse.json({ error: '缺少八字数据' }, { status: 400 });
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Register Chinese fonts
    doc.addFileToVFS('NotoSansSC-Regular.ttf', fontRegularBase64);
    doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal');
    doc.addFileToVFS('NotoSansSC-Bold.ttf', fontBoldBase64);
    doc.addFont('NotoSansSC-Bold.ttf', 'NotoSansSC', 'bold');

    // 标题
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(212, 168, 83); // 金色
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // 副标题
    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`ez-mystic · FateWise`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // 分隔线
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // 命主信息
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('命主信息', margin, y);
    y += 8;

    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const dayMasterElement = getDayMasterElement(bazi.dayPillar.gan);
    const info = [
      `姓名：${name || '匿名'}`,
      `生肖：${bazi.zodiac}`,
      `日主：${bazi.dayPillar.gan}（${((bazi.wuxing as any)?.find((w: any) => w.element === dayMasterElement) as any)?.element || dayMasterElement}）`,
    ];
    for (const line of info) {
      doc.text(line, margin, y);
      y += 6;
    }
    y += 5;

    // 四柱八字
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('四柱八字', margin, y);
    y += 8;

    // 表格头
    doc.setFillColor(240, 235, 225);
    doc.rect(margin, y, contentWidth / 4 - 1, 7, 'F');
    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('年柱', margin + 3, y + 5);
    doc.text('月柱', margin + contentWidth / 4 + 3, y + 5);
    doc.text('日柱', margin + (contentWidth / 4) * 2 + 3, y + 5);
    doc.text('时柱', margin + (contentWidth / 4) * 3 + 3, y + 5);
    y += 7;

    // 表格内容
    doc.setDrawColor(200, 200, 200);
    const pillars = [
      `${bazi.yearPillar.gan}${bazi.yearPillar.zhi}`,
      `${bazi.monthPillar.gan}${bazi.monthPillar.zhi}`,
      `${bazi.dayPillar.gan}${bazi.dayPillar.zhi}`,
      `${bazi.hourPillar.gan}${bazi.hourPillar.zhi}`,
    ];
    for (let i = 0; i < 4; i++) {
      doc.setFont('NotoSansSC', 'bold');
      doc.setFontSize(14);
      doc.text(pillars[i], margin + (contentWidth / 4) * i + contentWidth / 8, y + 5, { align: 'center' });
    }
    y += 12;

    // 五行统计
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('五行统计', margin, y);
    y += 8;

    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const wx = bazi.wuxing.map((w: any) => `${w.element}(${w.count})`).join('  ');
    doc.text(wx, margin, y);
    y += 12;

    // AI 解读
    if (interpretation) {
      // 分割解读内容
      const paragraphs = interpretation.split('\n').filter((p: string) => p.trim());
      doc.setFont('NotoSansSC', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text('AI 解读', margin, y);
      y += 8;

      doc.setFont('NotoSansSC', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      for (const line of paragraphs) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        // 处理标题行
        if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
          const titleText = line.replace(/[#\s]+/g, '');
          doc.setFont('NotoSansSC', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(212, 168, 83);
          const splitTitle = doc.splitTextToSize(titleText, contentWidth);
          doc.text(splitTitle, margin, y);
          y += splitTitle.length * 6 + 4;
          doc.setFont('NotoSansSC', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          const text = line.substring(2);
          const splitText = doc.splitTextToSize(text, contentWidth - 5);
          doc.text(`• ${splitText[0]}`, margin + 5, y);
          y += 5;
        } else if (line.includes('|')) {
          // 表格行
          const cells = line.split('|').filter((c: string) => c.trim());
          let x = margin;
          for (const cell of cells) {
            if (cell.trim()) {
              doc.text(cell.trim().substring(0, 20), x, y);
              x += 30;
            }
          }
          y += 6;
        } else if (line.trim()) {
          const splitText = doc.splitTextToSize(line.trim(), contentWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * 5 + 2;
        } else {
          y += 3;
        }
      }
      y += 5;
    }

    // 免责声明
    doc.setFont('NotoSansSC', 'normal');
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('⚠️ 本解读由AI生成，仅供参考和娱乐，不作为人生决策依据。', pageWidth / 2, y, { align: 'center' });
    doc.text(`ez-mystic.com · ${new Date().toLocaleDateString('zh-CN')}`, pageWidth / 2, y + 5, { align: 'center' });

    // 生成 PDF 并返回
    const pdfBlob = doc.output('blob');
    const pdfBase64 = await blobToBase64(pdfBlob);

    return NextResponse.json({
      success: true,
      pdfBase64,
      filename: `fatebook-${name || 'anonymous'}-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  } catch (error) {
    console.error('PDF 生成失败:', error);
    return NextResponse.json(
      { error: 'PDF 生成失败' },
      { status: 500 }
    );
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
