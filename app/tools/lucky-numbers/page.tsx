'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ElementStat, MissingInfo, LuckyElementInfo } from '@/lib/bazi-calculator';
import { calcWuxingDistribution, findMissingElements, determineLuckyElements, getDayMasterElement } from '@/lib/bazi-calculator';
import { getElementColor } from '@/lib/bazi-calculator';
import {
  Calendar, Clock, Sparkles, Sun, ArrowRight, Hash, Gem,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types & Helpers (same as lucky-direction)
// ---------------------------------------------------------------------------

interface BaziApiResponse { success: boolean; bazi: { yearPillar:{gan:string;zhi:string}; monthPillar:{gan:string;zhi:string}; dayPillar:{gan:string;zhi:string}; hourPillar:{gan:string;zhi:string} } }

const TIMEZONE_MAP: Record<string, { offset:number; label:string }> = {
  'New York':{offset:-4,label:'EST'},'Los Angeles':{offset:-7,label:'PST'},
  'Chicago':{offset:-5,label:'CST'},'London':{offset:1,label:'BST'},
  'Paris':{offset:2,label:'CET'},'Tokyo':{offset:9,label:'JST'},
  'Sydney':{offset:10,label:'AEST'},'Beijing':{offset:8,label:'CST'},
};

interface FormData { year:string; month:string; day:string; hour:string; minute:string; gender:'male'|'female'; city:string }
const DEFAULT_FORM: FormData = { year:'1995',month:'6',day:'15',hour:'14',minute:'30',gender:'male',city:'Beijing' };

// ---------------------------------------------------------------------------
// Luo Shu Nine Stars — 洛书九星 mapping: number → element + meaning
// ---------------------------------------------------------------------------

interface LuoShuInfo {
  number: number;
  element: string;      // 五行
  meaningEn: string;    // English description
  meaningZh: string;
  usageTip: string;     // How to use this number for luck
}

const LUO_SHU: LuoShuInfo[] = [
  { number:1, element:'水', meaningEn:'Wisdom & Flow — Water star brings intelligence, adaptability and career fluidity.',
    meaningZh:'智慧与流动——一白贪狼星，主智慧、变通与事业顺遂。',
    usageTip:'Best for communication, travel, and water-related business. Use in passwords or phone numbers.' },
  { number:2, element:'土', meaningEn:'Wealth & Harvest — Earth star governs material abundance and nurturing energy.',
    meaningZh:'财富与收获——二黑巨门星，主物质丰饶与滋养之力。',
    usageTip:'Ideal for real estate, agriculture, and resource industries. Good for bank account numbers.' },
  { number:3, element:'木', meaningEn:'Growth & Vitality — Wood star drives expansion, creativity and sibling harmony.',
    meaningZh:'成长与活力——三碧禄存星，主扩张、创造力与人缘。',
    usageTip:'Great for startups, education, and creative projects. Use in product codes or brand names.' },
  { number:4, element:'木', meaningEn:'Culture & Romance — Wood star of arts, learning and romantic relationships.',
    meaningZh:'文化与浪漫——四绿文曲星，主文艺、学业与桃花。',
    usageTip:'Perfect for arts, music, writing, and education. Excellent for social media handles.' },
  { number:5, element:'土', meaningEn:'Power & Transformation — Central Earth star of authority and major life changes.',
    meaningZh:'权力与变革——五黄廉贞星，主权力和重大人生转折。',
    usageTip:'Use with caution — powerful but volatile. Best for leadership roles and strategic decisions.' },
  { number:6, element:'金', meaningEn:'Authority & Protection — Metal star of leadership, nobility and celestial help.',
    meaningZh:'权威与守护——六白武曲星，主权势、贵人运和天助。',
    usageTip:'Strong for management, law enforcement, and military. Good for car license plates.' },
  { number:7, element:'金', meaningEn:'Action & Competition — Metal star of decisiveness, sports and legal matters.',
    meaningZh:'行动与竞争——七赤破军星，主决断、运动和诉讼。',
    usageTip:'Use for competitive fields, sports and legal work. Good for competition entry numbers.' },
  { number:8, element:'土', meaningEn:'Prosperity & Stability — Earth star of current era abundance, real estate and longevity.',
    meaningZh:'繁荣与稳定——八白左辅星，主当运财运、房产和长寿。',
    usageTip:'The most auspicious number currently. Best for financial accounts, addresses and business names.' },
  { number:9, element:'火', meaningEn:'Fame & Vision — Fire star of recognition, technology and future prosperity.',
    meaningZh:'名声与远见——九紫右弼星，主名誉、科技和未来繁荣。',
    usageTip:'Ideal for branding, technology and public-facing work. Excellent for domain name endings.' },
];

// ---------------------------------------------------------------------------
// Number Grid Component — 3×3 Luo Shu layout (traditional)
// ---------------------------------------------------------------------------

function NumberGrid({ luckyNumbers, allResults }: {
  luckyNumbers: number[];
  allResults: (LuoShuInfo & { priority: 'primary' | 'secondary' })[];
}) {
  // Luo Shu magic square layout: rows are [4,9,2], [3,5,7], [8,1,6]
  const gridRows = [[4,9,2],[3,5,7],[8,1,6]];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto" role="grid" aria-label="Luo Shu nine stars grid">
      {gridRows.flat().map(num => {
        const info = LUO_SHU.find(l => l.number === num)!;
        const isLucky = luckyNumbers.includes(num);

        return (
          <div key={num} role="gridcell" className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${
            isLucky ? 'border-gold-primary/40 bg-gold-primary/10' : 'border-white/5 bg-white/[0.02]'
          }`}>
            {/* Number */}
            <span className={`text-2xl md:text-3xl font-bold ${isLucky ? 'text-gold-primary' : info.element === '水' ? '#60A5FA' :
              info.element === '火' ? '#F87171' :
              info.element === '土' ? '#FBBF24' :
              info.element === '金' ? '#E2E8F0' : '#4ADE80'}`}>
              {num}
            </span>

            {/* Element */}
            <span className="text-[10px] text-text-muted mt-0.5">{info.element}</span>

            {/* Lucky badge */}
            {isLucky && (
              <span className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full bg-gold-primary/20 text-gold-primary font-medium">
                ✦ Lucky
              </span>
            )}
          </div>
        );
      })}

      {/* Luo Shu label */}
      <div className="col-span-3 text-center pt-2">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">洛书九星 · Luo Shu Nine Stars</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Number Detail Card
// ---------------------------------------------------------------------------

function NumberDetailCard({ info, priority }: { info: LuoShuInfo; priority: 'primary' | 'secondary' }) {
  const color = getElementColor(info.element);

  return (
    <div className="p-4 rounded-xl border transition-all hover:-translate-y-0.5 group"
         style={{ backgroundColor: `${color}06`, borderColor: `${color}20` }}>
      <div className="flex items-center gap-3 mb-3">
        {/* Number badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
             style={{ backgroundColor: `${color}15`, color }}>
          {info.number}
        </div>

        <div className="flex-1">
          <p className="font-bold text-text-primary">{info.element} — {priority === 'primary' ? 'Primary Lucky · 主幸运' : 'Secondary Lucky · 次幸运'}</p>
          <p className="text-xs text-text-muted mt-0.5">{info.meaningEn}</p>
        </div>

        {/* Element icon */}
        <span className="text-2xl font-bold opacity-30 group-hover:opacity-60 transition-opacity" style={{ color }}>
          {info.element}
        </span>
      </div>

      {/* Usage tip */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <p className="text-[10px] uppercase tracking-wider text-gold-primary mb-1">💡 How to use this number</p>
        <p className="text-sm text-text-secondary leading-relaxed">{info.usageTip}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LuckyNumbersPage() {
  const pathname = usePathname();
  const isZh = pathname.startsWith('/zh');
  const t = (zh: string, en: string) => isZh ? zh : en;

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [dayMasterElement, setDayMasterElement] = useState('');
  const [luckyNumbersPrimary, setLuckyNumbersPrimary] = useState<number[]>([]);
  const [luckyNumbersSecondary, setLuckyNumbersSecondary] = useState<number[]>([]);
  const [distribution, setDistribution] = useState<ElementStat[]>([]);
  const [missingElements, setMissingElements] = useState<MissingInfo[]>([]);

  const update = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const updateRaw = (fieldStr: string, value: string) => {
    setForm((p) => ({ ...p, [fieldStr]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true); setError(null);
    try {
      const year = parseInt(form.year, 10), month = parseInt(form.month, 10), day = parseInt(form.day, 10);
      const hour = parseInt(form.hour, 10), minute = parseInt(form.minute, 10);
      if (year < 1900 || year > 2100) { setError(t('年份必须在 1900–2100', 'Year must be between 1900 and 2100')); setLoading(false); return; }

      const res = await fetch('/api/bazi', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, minute, gender: form.gender, location: { city: form.city } }),
      });
      if (!res.ok) throw new Error(t('网络请求失败', 'Network request failed'));
      const data: BaziApiResponse = await res.json();
      if (!data.success) throw new Error(t('八字计算失败', 'Bazi calculation failed'));

      // Five Elements distribution
      const allStems = [data.bazi.yearPillar.gan, data.bazi.monthPillar.gan, data.bazi.dayPillar.gan, data.bazi.hourPillar.gan];
      const allZhis = [data.bazi.yearPillar.zhi, data.bazi.monthPillar.zhi, data.bazi.dayPillar.zhi, data.bazi.hourPillar.zhi];
      const dist = calcWuxingDistribution(allStems, allZhis);

      // Missing elements
      const missing = findMissingElements(dist);

      // Lucky elements from bazi-calculator
      const dmElement = getDayMasterElement(data.bazi.dayPillar.gan);

      // Map lucky elements → Luo Shu numbers
      const { determineLuckyElements, getElementMeta } = await import('@/lib/bazi-calculator');
      const luckyEls = determineLuckyElements(dmElement, missing);

      // Element → numbers mapping (洛书九星)
      const elToNumbers: Record<string, number[]> = { '木': [3,4], '火': [9], '土': [2,5,8], '金': [6,7], '水': [1] };

      // Deduplicate using simple loop to avoid Set spread issues
      const seenPrimary = new Map<number, boolean>();
      const seenSecondary = new Map<number, boolean>();

      for (const el of luckyEls) {
        const nums = elToNumbers[el.element] || [];
        for (const n of nums) {
          if (!seenPrimary.has(n)) seenPrimary.set(n, true);
        }
      }

      const allSeen = new Map<number, boolean>();
      for (const el of luckyEls) {
        const nums = elToNumbers[el.element] || [];
        for (const n of nums) {
          if (!allSeen.has(n)) allSeen.set(n, true);
        }
      }

      setDayMasterElement(dmElement);
      setDistribution(dist);
      setMissingElements(missing);

      const pNums: number[] = [];
      seenPrimary.forEach((_, n) => { if (pNums.indexOf(n) === -1) pNums.push(n); });
      setLuckyNumbersPrimary(pNums.sort((a,b)=>a-b));

      const sNums: number[] = [];
      seenSecondary.forEach((_, n) => { if (sNums.indexOf(n) === -1) sNums.push(n); });
      setLuckyNumbersSecondary(sNums.sort((a,b)=>a-b));

    } catch (err) {
      setError(err instanceof Error ? err.message : t('未知错误', 'Unknown error'));
    } finally { setLoading(false); }
  };

  // ---------------------------------------------------------------------------
  // Render — Form (no results)
  // ---------------------------------------------------------------------------

  if (!distribution.length && !loading) {
    return (
      <main className="min-h-screen bg-bg-base text-text-primary selection:bg-gold-primary/30 selection:text-gold-light pb-16">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gold-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
          <header className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold-primary/20 text-xs font-medium text-gold-primary">
              <Sparkles size={12} />{t('免费工具', 'FREE TOOL')}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
              {t('你的幸运数字是？', 'What Are Your Lucky Numbers?')}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-primary">{t('洛书九星', 'Luo Shu Nine Stars')}</span>
            </h1>

            <p className="text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              {t(
                '输入你的出生信息，基于八字五行和洛书九星计算你的幸运数字。每个数字都有独特的寓意和使用建议。',
                'Enter your birth details to calculate your lucky numbers based on Bazi Five Elements and the Luo Shu Nine Stars. Each number carries unique meaning and usage guidance.'
              )}
            </p>

            {/* 3×3 Luo Shu preview */}
            <div className="pt-2">
              <NumberGrid luckyNumbers={[]} allResults={[]} />
            </div>
          </header>

          <div className="glass-card p-6 md:p-8 space-y-6">
            {/* Row 1: Date */}
            <div className="grid grid-cols-3 gap-4">
              {[{id:'bazi-year',label:t('年 · Year','Year'),min:'1900',max:'2100'},{id:'bazi-month',label:t('月 · Month','Month'),min:'1',max:'12'},{id:'bazi-day',label:t('日 · Day','Day'),min:'1',max:'31'}].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{f.label}</label>
                  <input id={f.id} type="number" min={f.min} max={f.max} value={(form as any)[f.id.replace('bazi-','')]}
                    onChange={e => updateRaw(f.id.replace('bazi-',''), e.target.value)} className="input-field" />
                </div>
              ))}
            </div>

            {/* Row 2: Time + Gender */}
            <div className="grid grid-cols-3 gap-4">
              {[{id:'bazi-hour',label:t('时 · Hour','Hour'),min:'0',max:'23'},{id:'bazi-minute',label:t('分 · Minute','Minute'),min:'0',max:'59'},{id:'bazi-gender',label:t('性别 · Gender','Gender'),isSelect:true}].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{f.label}</label>
                  {f.isSelect ? (
                    <select id={f.id} value={form.gender} onChange={e=>update('gender',e.target.value)} className="input-field">
                      <option value="male">{t('男 · Male','Male')}</option><option value="female">{t('女 · Female','Female')}</option>
                    </select>
                  ) : (
                    <input id={f.id} type="number" min={f.min} max={f.max} value={(form as any)[f.id.replace('bazi-','')]}
                      onChange={e=>updateRaw(f.id.replace('bazi-',''), e.target.value)} className="input-field" />
                  )}
                </div>
              ))}
            </div>

            {/* Row 3: City */}
            <div>
              <label htmlFor="bazi-city" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{t('出生城市 · Birth City','Birth City')}</label>
              <select id="bazi-city" value={form.city} onChange={e=>update('city',e.target.value)} className="input-field">
                {Object.keys(TIMEZONE_MAP).map(c=><option key={c} value={c}>{c} ({TIMEZONE_MAP[c].label})</option>)}
              </select>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <button onClick={handleCalculate} disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
                  {t('分析中...', 'Analyzing...')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">✦ {t('分析幸运数字 · Find Lucky Numbers','Find Lucky Numbers')}</span>
              )}
            </button>
          </div>

          {/* SEO Content */}
          <section className="mt-16 space-y-6 text-sm text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-gold-primary">{t('什么是洛书九星？', 'What is the Luo Shu Nine Stars?')}</h2>
            <p>{t(
              '洛书九星是中国古代数字哲学体系，将1-9每个数字与五行和命运领域对应。在八字命理中，每个人的出生时间决定了幸运数字——这些数字会影响你的财运、健康和人际关系。',
              'The Luo Shu Nine Stars is an ancient Chinese numerical philosophy system that maps numbers 1-9 to the Five Elements and life domains. In Bazi destiny analysis, your birth time determines lucky numbers — these influence wealth, health and relationships.'
            )}</p>

            {/* 3x3 grid preview */}
            <div className="flex justify-center py-4">
              <NumberGrid luckyNumbers={[]} allResults={[]} />
            </div>

            {/* Number meanings table */}
            <h2 className="text-xl font-bold text-gold-primary">{t('数字寓意速查', 'Number Meanings Quick Reference')}</h2>
            <div className="grid grid-cols-3 gap-2 max-w-[400px] mx-auto">
              {LUO_SHU.map(n => (
                <div key={n.number} className="p-2 rounded-lg border text-center" style={{ borderColor: `${getElementColor(n.element)}15` }}>
                  <span className="text-lg font-bold" style={{ color: getElementColor(n.element) }}>{n.number}</span>
                  <p className="text-[10px] text-text-muted mt-0.5">{n.element}</p>
                </div>
              ))}
            </div>

            {/* Cross-links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/tools/lucky-element-finder" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Gem size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的五行缺什么？', 'What Elements Are Missing?')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看五行分析 →', 'Check Five Elements →')}</p>
              </Link>

              <Link href="/tools/lucky-direction" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Hash size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的幸运方位', 'Your Lucky Directions')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看幸运方位 →', 'Check Lucky Directions →')}</p>
              </Link>
            </div>

            <div className="glass-card p-6 text-center">
              <p className="text-text-secondary mb-3">{t('想要完整的命盘分析？', 'Want a complete destiny analysis?')}</p>
              <Link href="/bazi" className="text-gold-primary font-semibold hover:text-gold-light transition-colors">
                {t('生成完整八字命盘 →', 'Generate Full Bazi Chart →')}
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — Results
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-bg-base text-text-primary selection:bg-gold-primary/30 selection:text-gold-light pb-16">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gold-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-12 md:pt-20">
        <header className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold-primary/20 text-xs font-medium text-gold-primary">
            <Sparkles size={12} />{t('分析结果 · Results', 'Analysis Results')}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            {t('你的幸运数字', 'Your Lucky Numbers')}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-primary">{t('分析', 'Analysis')}</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Calendar size={14}/> {form.year}/{String(form.month).padStart(2,'0')}/{String(form.day).padStart(2,'0')}</span>
            <span className="flex items-center gap-1.5"><Clock size={14}/> {form.hour}:{String(form.minute).padStart(2,'0')}</span>
          </div>

          {dayMasterElement && (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-primary/10 border border-gold-primary/25">
              <Sun size={18} className="text-gold-primary"/>
              <div>
                <span className="text-xs text-text-muted">{t('日主 · Day Master', 'Day Master')}</span>
                <p className="font-bold text-gold-primary" style={{ fontSize: 20 }}>
                  {dayMasterElement} <span className="text-sm font-normal text-text-secondary">({getElementColor(dayMasterElement)})</span>
                </p>
              </div>
            </div>
          )}

          <button onClick={() => setDistribution([])} className="text-xs text-text-muted hover:text-gold-primary transition-colors underline">
            {t('← 重新输入', '← Enter New Date')}
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="w-16 h-16 text-gold-primary/50 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            <p className="text-gold-primary">{t('正在分析五行...', 'Analyzing Five Elements...')}</p>
          </div>
        ) : (
          <div className="glass-card p-6 md:p-8 space-y-10">

            {/* Luo Shu Grid */}
            <section aria-label="Luo Shu nine stars">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4 text-center">
                {t('洛书九星盘 · Luo Shu Grid', 'Luo Shu Nine Stars')}
              </h3>

              {/* All numbers with lucky highlight */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                {LUO_SHU.map(n => {
                  const isPrimary = luckyNumbersPrimary.includes(n.number);
                  const isSecondary = luckyNumbersSecondary.includes(n.number);
                  const color = getElementColor(n.element);

                  return (
                    <div key={n.number} className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 ${
                      isPrimary ? 'border-gold-primary/40 bg-gold-primary/15 scale-105' :
                      isSecondary ? 'border-emerald-500/30 bg-emerald-500/8' :
                      'border-white/5 bg-white/[0.02]'
                    }`}>
                      <div className="text-center">
                        <span className={`text-xl md:text-2xl font-bold ${isPrimary ? 'text-gold-primary' : isSecondary ? 'text-emerald-400' : ''}`} style={!isPrimary && !isSecondary ? { color } : undefined}>
                          {n.number}
                        </span>
                        <p className="text-[9px] text-text-muted mt-0.5">{n.element}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gold-primary opacity-60"/>{t('主幸运 · Primary Lucky', 'Primary')}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 opacity-50"/>{t('次幸运 · Secondary', 'Secondary')}</span>
              </div>
            </section>

            {/* Primary Lucky Numbers */}
            {luckyNumbersPrimary.length > 0 && (
              <section aria-label="Primary lucky numbers">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                  {t('主幸运数字 · Primary Lucky Numbers', 'Primary Lucky Numbers')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {luckyNumbersPrimary.map(num => {
                    const info = LUO_SHU.find(l => l.number === num)!;
                    return <NumberDetailCard key={num} info={info} priority="primary" />;
                  })}
                </div>
              </section>
            )}

            {/* Secondary Lucky Numbers */}
            {luckyNumbersSecondary.length > 0 && (
              <section aria-label="Secondary lucky numbers">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                  {t('次幸运数字 · Secondary Lucky Numbers', 'Secondary Lucky Numbers')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {luckyNumbersSecondary.map(num => {
                    const info = LUO_SHU.find(l => l.number === num)!;
                    return <NumberDetailCard key={num} info={info} priority="secondary" />;
                  })}
                </div>
              </section>
            )}

            {/* Luo Shu Magic Square */}
            <section aria-label="Luo Shu magic square">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4 text-center">
                {t('洛书九宫格 · Magic Square', 'Luo Shu Magic Square')}
              </h3>
              <NumberGrid luckyNumbers={[...luckyNumbersPrimary, ...luckyNumbersSecondary]} allResults={[]} />
            </section>

            {/* Cross-links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/tools/lucky-element-finder" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Gem size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的五行缺什么？', 'What Elements Are Missing?')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看五行分析 →', 'Check Five Elements →')}</p>
              </Link>

              <Link href="/tools/lucky-direction" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Hash size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的幸运方位', 'Your Lucky Directions')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看幸运方位 →', 'Check Lucky Directions →')}</p>
              </Link>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-text-secondary text-sm mb-4">{t('想要完整的命盘分析？', 'Want a complete destiny analysis?')}</p>
              <Link href="/bazi" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95">
                {t('✦ 查看完整命盘 · Full Bazi Chart', '✦ View Full Bazi Chart')}
                <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
