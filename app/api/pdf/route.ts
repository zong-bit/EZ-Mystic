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

// Heavenly Stem Five Elements mapping: 甲乙→木, 丙丁→火, 戊己→土, 庚辛→金, 壬癸→水
const TIAN_GAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'] as const;

function getDayMasterElement(gan: string): string {
  const idx = TIAN_GAN.indexOf(gan as typeof TIAN_GAN[number]);
  return idx >= 0 ? TIAN_GAN_WUXING[idx] : '木';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bazi, name, interpretation, title = 'Destiny Book' } = body;

    if (!bazi) {
      return NextResponse.json({ error: 'Bazi data is required' }, { status: 400 });
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

    // Title
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(212, 168, 83); // gold
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Subtitle
    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`BornChart · FateWise`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Divider line
    doc.setDrawColor(212, 168, 83);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Subject info
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Subject Information', margin, y);
    y += 8;

    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const dayMasterElement = getDayMasterElement(bazi.dayPillar.gan);
    const info = [
      `Name: ${name || 'Anonymous'}`,
      `Zodiac: ${bazi.zodiac}`,
      `Day Master: ${bazi.dayPillar.gan} (${((bazi.wuxing as any)?.find((w: any) => w.element === dayMasterElement) as any)?.element || dayMasterElement})`,
    ];
    for (const line of info) {
      doc.text(line, margin, y);
      y += 6;
    }
    y += 5;

    // Four Pillars
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Four Pillars', margin, y);
    y += 8;

    // Table header
    doc.setFillColor(240, 235, 225);
    doc.rect(margin, y, contentWidth / 4 - 1, 7, 'F');
    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('Year Pillar', margin + 3, y + 5);
    doc.text('Month Pillar', margin + contentWidth / 4 + 3, y + 5);
    doc.text('Day Pillar', margin + (contentWidth / 4) * 2 + 3, y + 5);
    doc.text('Hour Pillar', margin + (contentWidth / 4) * 3 + 3, y + 5);
    y += 7;

    // Table content
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

    // Five Elements stats
    doc.setFont('NotoSansSC', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Five Elements (Wu Xing)', margin, y);
    y += 8;

    doc.setFont('NotoSansSC', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const wx = bazi.wuxing.map((w: any) => `${w.element}(${w.count})`).join('  ');
    doc.text(wx, margin, y);
    y += 12;

    // AI Interpretation
    if (interpretation) {
      const paragraphs = interpretation.split('\n').filter((p: string) => p.trim());
      doc.setFont('NotoSansSC', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text('AI Interpretation', margin, y);
      y += 8;

      doc.setFont('NotoSansSC', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      for (const line of paragraphs) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        // Handle heading lines
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
          // Table row
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

    // Disclaimer
    doc.setFont('NotoSansSC', 'normal');
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.', pageWidth / 2, y, { align: 'center' });
    doc.text(`bornchart.app · ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, y + 5, { align: 'center' });

    // Generate PDF and return
    const pdfBlob = doc.output('blob');
    const pdfBase64 = await blobToBase64(pdfBlob);

    return NextResponse.json({
      success: true,
      pdfBase64,
      filename: `fatebook-${name || 'anonymous'}-${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
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
