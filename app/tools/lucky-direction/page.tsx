'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { calculateLuckyDirections, COMPASS_DIRECTIONS, getDegreeFromLabel } from '@/lib/lucky-direction-calculator';
import { getElementColor } from '@/lib/bazi-calculator';
import type { ElementStat, MissingInfo, LuckyElementInfo } from '@/lib/bazi-calculator';
import {
  Calendar, Clock, MapPin, Sparkles, Sun, Moon, Compass, ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types & Helpers (reused from lucky-element-finder)
// ---------------------------------------------------------------------------

interface BaziApiResponse { success: boolean; bazi: { yearPillar:{gan:string;zhi:string}; monthPillar:{gan:string;zhi:string}; dayPillar:{gan:string;zhi:string}; hourPillar:{gan:string;zhi:string} } }

const TIMEZONE_MAP: Record<string, { offset: number; label: string }> = {
  'New York':{offset:-4,label:'EST (UTC-5/-4)'},'Los Angeles':{offset:-7,label:'PST (UTC-8/-7)'},
  'Chicago':{offset:-5,label:'CST (UTC-6/-5)'},'London':{offset:1,label:'BST (UTC+0/+1)'},
  'Paris':{offset:2,label:'CET (UTC+1/+2)'},'Tokyo':{offset:9,label:'JST (UTC+9)'},
  'Sydney':{offset:10,label:'AEST (UTC+10)'},'Beijing':{offset:8,label:'CST (UTC+8)'},
};

interface FormData { year:string; month:string; day:string; hour:string; minute:string; gender:'male'|'female'; city:string }
const DEFAULT_FORM: FormData = { year:'1995',month:'6',day:'15',hour:'14',minute:'30',gender:'male',city:'Beijing' };

// ---------------------------------------------------------------------------
// SVG Compass Component
// ---------------------------------------------------------------------------

function CompassSVG({ directions, bestDirection }: { directions: ReturnType<typeof calculateLuckyDirections>['directions']; bestDirection: ReturnType<typeof calculateLuckyDirections>['bestDirection'] }) {
  const cx = 150, cy = 150, outerR = 140, innerR = 90;

  const directionMap: Record<string, number> = {
    '北 N': 0, '东北 NE': 45, '东 E': 90, '东南 SE': 135,
    '南 S': 180, '西南 SW': 225, '西 W': 270, '西北 NW': 315,
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto drop-shadow-xl">
      <defs>
        <radialGradient id="compass-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#D4AF3715" />
          <stop offset="100%" stopColor="#D4AF3705" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR + 8} fill="none" stroke="#D4AF3725" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={outerR + 3} fill="none" stroke="#D4AF3715" strokeWidth="0.5" />

      {/* Background */}
      <circle cx={cx} cy={cy} r={outerR} fill="url(#compass-bg)" stroke="#D4AF3720" strokeWidth="1.5" />

      {/* 8 direction sectors */}
      {COMPASS_DIRECTIONS.map((dir, i) => {
        const label = Object.keys(directionMap).find(k => getDegreeFromLabel(k) === dir.degree);
        if (!label) return null;

        const info = directions.find(d => d.direction === label);
        const isAuspicious = !!info && info.nameCn !== '祸害' && info.nameCn !== '六煞' && info.nameCn !== '五鬼' && info.nameCn !== '绝命';
        const isBest = bestDirection.direction === label;

        // Sector path
        const startAngle = (dir.degree - 22.5) * Math.PI / 180;
        const endAngle = (dir.degree + 22.5) * Math.PI / 180;
        const x1o = cx + outerR * Math.cos(startAngle);
        const y1o = cy + outerR * Math.sin(startAngle);
        const x2o = cx + outerR * Math.cos(endAngle);
        const y2o = cy + outerR * Math.sin(endAngle);
        const x1i = cx + innerR * Math.cos(endAngle);
        const y1i = cy + innerR * Math.sin(endAngle);
        const x2i = cx + innerR * Math.cos(startAngle);
        const y2i = cy + innerR * Math.sin(startAngle);

        // Color: green for auspicious, red for inauspicious
        const sectorColor = isAuspicious ? (isBest ? '#D4AF37' : '#2D8B57') : '#C23B22';

        return (
          <g key={dir.label}>
            {/* Sector */}
            <path d={`M ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 0 0 ${x2i} ${y2i} Z`}
              fill={sectorColor} opacity="0.15" stroke="#D4AF3720" strokeWidth="0.5" />

            {/* Label */}
            <text x={cx + (outerR - 20) * Math.cos(dir.degree * Math.PI / 180)}
                  y={cy + (outerR - 20) * Math.sin(dir.degree * Math.PI / 180)}
                  textAnchor="middle" dominantBaseline="central"
                  className="text-[10px] fill-text-secondary font-medium select-none">
              {dir.label}
            </text>

            {/* Chinese label */}
            <text x={cx + (outerR - 5) * Math.cos(dir.degree * Math.PI / 180)}
                  y={cy + (outerR - 5) * Math.sin(dir.degree * Math.PI / 180)}
                  textAnchor="middle" dominantBaseline="central"
                  className="text-[10px] fill-text-tertiary select-none">
              {dir.labelCn}
            </text>

            {/* Auspicious/inauspicious indicator */}
            {info && (
              <text x={cx + (innerR + 12) * Math.cos(dir.degree * Math.PI / 180)}
                    y={cy + (innerR + 12) * Math.sin(dir.degree * Math.PI / 180)}
                    textAnchor="middle" dominantBaseline="central"
                    className={`text-[8px] select-none ${isAuspicious ? 'fill-emerald-400' : 'fill-red-400'}`}
                    style={{ fontSize: 8 }}>
                {isAuspicious ? '吉' : '凶'}
              </text>
            )}

            {/* Best direction marker */}
            {isBest && (
              <circle cx={cx + outerR * Math.cos(dir.degree * Math.PI / 180)}
                      cy={cy + outerR * Math.sin(dir.degree * Math.PI / 180)}
                      r="3" fill="#D4AF37">
                <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="4" fill="#D4AF37" />
      <circle cx={cx} cy={cy} r="12" fill="none" stroke="#D4AF3750" strokeWidth="0.5" />

      {/* Cardinal lines */}
      {[0, 90, 180, 270].map(deg => (
        <line key={deg} x1={cx + innerR * Math.cos(deg * Math.PI / 180)}
              y1={cy + innerR * Math.sin(deg * Math.PI / 180)}
              x2={cx + outerR * Math.cos(deg * Math.PI / 180)}
              y2={cy + outerR * Math.sin(deg * Math.PI / 180)}
              stroke="#D4AF3725" strokeWidth="0.5" />
      ))}

      {/* N marker */}
      <text x={cx} y={cy - innerR + 18} textAnchor="middle" dominantBaseline="central"
            className="fill-gold-primary font-bold select-none" style={{ fontSize: 14 }}>N</text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LuckyDirectionPage() {
  const pathname = usePathname();
  const isZh = pathname.startsWith('/zh');
  const t = (zh: string, en: string) => isZh ? zh : en;

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [kuaNumber, setKuaNumber] = useState<number>(0);
  const [trigram, setTrigram] = useState('');
  const [trigramEn, setTrigramEn] = useState('');
  const [group, setGroup] = useState<'east' | 'west'>('east');
  const [directions, setDirections] = useState<ReturnType<typeof calculateLuckyDirections>['directions']>([]);
  const [bestDirection, setBestDirection] = useState<ReturnType<typeof calculateLuckyDirections>['bestDirection'] | null>(null);
  const [dayMasterElement, setDayMasterElement] = useState('');

  const update = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }));

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

      // Calculate Kua Number
      const result = calculateLuckyDirections(year, month, day, hour, minute, form.gender);
      setKuaNumber(result.kuaNumber);
      setTrigram(result.trigram);
      setTrigramEn(result.trigramEn);
      setGroup(result.group);
      setDirections(result.directions);
      setBestDirection(result.bestDirection);

      // Day Master for element context
      const { getDayMasterElement } = await import('@/lib/bazi-calculator');
      setDayMasterElement(getDayMasterElement(data.bazi.dayPillar.gan));

    } catch (err) {
      setError(err instanceof Error ? err.message : t('未知错误', 'Unknown error'));
    } finally { setLoading(false); }
  };

  // ---------------------------------------------------------------------------
  // Render — Form (no results)
  // ---------------------------------------------------------------------------

  if (!directions.length && !loading) {
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
              {t('你的幸运方位是？', 'What Are Your Lucky Directions?')}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-primary">{t('命卦', 'Kua Number')}</span>
            </h1>
            <p className="text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              {t(
                '输入你的出生信息，计算你的命卦（Kua Number），发现四大吉方和四大利方位——财富、健康、事业与贵人。',
                'Enter your birth details to calculate your Kua Number and discover 4 lucky directions for wealth, health, career, and helpful people.'
              )}
            </p>
          </header>

          <div className="glass-card p-6 md:p-8 space-y-6">
            {/* Row 1: Date */}
            <div className="grid grid-cols-3 gap-4">
              {[{ id:'bazi-year', label: t('年 · Year','Year'), min:'1900', max:'2100' },
                { id:'bazi-month', label: t('月 · Month','Month'), min:'1', max:'12' },
                { id:'bazi-day', label: t('日 · Day','Day'), min:'1', max:'31' }].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{f.label}</label>
                  <input id={f.id} type="number" min={f.min} max={f.max} value={(form as any)[f.id.replace('bazi-','')]}
                    onChange={(e) => update(f.id.replace('bazi-','') as keyof FormData, e.target.value)} className="input-field" />
                </div>
              ))}
            </div>

            {/* Row 2: Time + Gender */}
            <div className="grid grid-cols-3 gap-4">
              {[{ id:'bazi-hour', label: t('时 · Hour','Hour'), min:'0', max:'23' },
                { id:'bazi-minute', label: t('分 · Minute','Minute'), min:'0', max:'59' },
                { id:'bazi-gender', label: t('性别 · Gender','Gender'), isSelect:true }].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{f.label}</label>
                  {f.isSelect ? (
                    <select id={f.id} value={form.gender} onChange={(e)=>update('gender',e.target.value)} className="input-field">
                      <option value="male">{t('男 · Male','Male')}</option><option value="female">{t('女 · Female','Female')}</option>
                    </select>
                  ) : (
                    <input id={f.id} type="number" min={f.min} max={f.max} value={(form as any)[f.id.replace('bazi-','')]}
                      onChange={(e) => update(f.id.replace('bazi-','') as keyof FormData, e.target.value)} className="input-field" />
                  )}
                </div>
              ))}
            </div>

            {/* Row 3: City */}
            <div>
              <label htmlFor="bazi-city" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">{t('出生城市 · Birth City','Birth City')}</label>
              <select id="bazi-city" value={form.city} onChange={(e)=>update('city',e.target.value)} className="input-field">
                {Object.keys(TIMEZONE_MAP).map(c=><option key={c} value={c}>{c} ({TIMEZONE_MAP[c].label})</option>)}
              </select>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <button onClick={handleCalculate} disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
                  {t('计算中...', 'Calculating...')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">✦ {t('计算命卦 · Calculate Kua Number','Calculate Kua Number')}</span>
              )}
            </button>
          </div>

          {/* SEO Content */}
          <section className="mt-16 space-y-6 text-sm text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-gold-primary">{t('什么是命卦（Kua Number）？', 'What is Kua Number?')}</h2>
            <p>{t(
              '命卦是中国风水学八宅法的核心概念，根据你的出生年份和性别计算得出。它将人分为东四命和西四命两类，每个命卦对应4个吉方和4个凶方。',
              'Kua Number (命卦) is the core concept of Eight Mansions Feng Shui. Calculated from your birth year and gender, it divides people into East Group and West Group, each with 4 auspicious and 4 inauspicious directions.'
            )}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
                <h3 className="text-gold-primary font-bold mb-2">{t('四大吉方', '4 Auspicious Directions')}</h3>
                <ul className="space-y-1.5 text-sm">
                  {t(
                    '生气（财富）· 天医（健康）· 延年（事业）· 伏位（稳定）',
                    'Sheng Qi (Wealth) · Tian Yi (Health) · Yan Nian (Career) · Fu Wei (Stability)'
                  ).split('·').map((d,i)=><li key={i} className="text-text-secondary">{d.trim()}</li>)}
                </ul>
              </div>
              <div className="p-5 rounded-xl border bg-red-500/5 border-red-500/20">
                <h3 className="text-gold-primary font-bold mb-2">{t('四大凶方', '4 Inauspicious Directions')}</h3>
                <ul className="space-y-1.5 text-sm">
                  {t(
                    '祸害（小冲突）· 六煞（人际压力）· 五鬼（意外变化）· 绝命（重大挑战）',
                    'Huo Hai (Minor Conflicts) · Liu Sha (Relationship Stress) · Wu Gui (Sudden Changes) · Jue Ming (Major Challenges)'
                  ).split('·').map((d,i)=><li key={i} className="text-text-secondary">{d.trim()}</li>)}
                </ul>
              </div>
            </div>

            <div className="glass-card p-6 text-center">
              <p className="text-text-secondary mb-3">{t('想要完整的五行分析？', 'Want complete Five Elements analysis?')}</p>
              <Link href="/tools/lucky-element-finder" className="text-gold-primary font-semibold hover:text-gold-light transition-colors inline-flex items-center gap-1">
                {t('查看五行缺什么 →', 'Check Missing Elements →')}<ArrowRight size={14}/>
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
            {t('你的幸运方位', 'Your Lucky Directions')}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-primary">{t('分析', 'Analysis')}</span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Calendar size={14}/> {form.year}/{String(form.month).padStart(2,'0')}/{String(form.day).padStart(2,'0')}</span>
            <span className="flex items-center gap-1.5"><Clock size={14}/> {form.hour}:{String(form.minute).padStart(2,'0')}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14}/> {form.city}</span>
          </div>

          {/* Kua Number badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-primary/10 border border-gold-primary/25">
            <Compass size={18} className="text-gold-primary"/>
            <div>
              <span className="text-xs text-text-muted">{t('命卦', 'Kua Number')}</span>
              <p className="font-bold text-gold-primary" style={{ fontSize: 20 }}>
                {kuaNumber === 5 ? (form.gender==='male'?'坤':'艮') : kuaNumber}{' '}
                <span className="text-sm font-normal text-text-secondary">{trigram}</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-text-muted">
            {group === 'east' ? t('东四命', 'East Group') : t('西四命', 'West Group')} · {trigramEn}
          </p>

          <button onClick={() => setDirections([])} className="text-xs text-text-muted hover:text-gold-primary transition-colors underline">
            {t('← 重新输入', '← Enter New Date')}
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="w-16 h-16 text-gold-primary/50 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
            <p className="text-gold-primary">{t('正在计算命卦...', 'Calculating Kua Number...')}</p>
          </div>
        ) : (
          <div className="glass-card p-6 md:p-8 space-y-10">

            {/* Compass */}
            <section aria-label="Feng Shui compass">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4 text-center">
                {t('风水罗盘 · 八宅方位', 'Feng Shui Compass — Eight Mansions')}
              </h3>
              <div className="flex justify-center">
                {directions.length > 0 ? (
                  <CompassSVG directions={directions} bestDirection={bestDirection!} />
                ) : (
                  <div className="w-full max-w-[320px] flex items-center justify-center h-80 text-text-muted">
                    {t('无数据', 'No data')}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gold-primary opacity-60"/>{t('吉方 Auspicious','Auspicious')}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-600 opacity-40"/>{t('凶方 Inauspicious','Inauspicious')}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gold-primary" style={{width:10,height:10}}/>{t('最佳方位','Best Direction')}</span>
              </div>
            </section>

            {/* Directions Grid */}
            <section aria-label="Direction details">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                {t('方位详解 · Directions', 'Direction Details')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {directions.map((dir, i) => {
                  const isAuspicious = dir.nameCn !== '祸害' && dir.nameCn !== '六煞' && dir.nameCn !== '五鬼' && dir.nameCn !== '绝命';
                  const isBest = bestDirection?.nameCn === dir.nameCn;

                  return (
                    <div key={i} className={`p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${isBest ? 'border-gold-primary/40 bg-gold-primary/5' : isAuspicious ? 'border-emerald-500/20 bg-emerald-500/3' : 'border-red-500/15 bg-red-500/2'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        {/* Direction label */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isBest ? 'bg-gold-primary/20 text-gold-primary' : isAuspicious ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isAuspicious ? '吉' : '凶'}
                        </div>

                        <div className="flex-1">
                          <p className={`font-bold text-sm ${isAuspicious ? 'text-text-primary' : 'text-red-300/80'}`}>
                            {dir.direction} · {dir.nameCn}
                          </p>
                          <p className="text-xs text-text-muted">{dir.nameEn.split(' · ')[0]}</p>
                        </div>

                        {isBest && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-primary/15 text-gold-primary font-medium">{t('最佳', 'BEST')}</span>}
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed">{dir.meaning}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Day Master context */}
            {dayMasterElement && (
              <section>
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                  {t('五行关联 · Five Elements Context', 'Five Elements Context')}
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm text-text-secondary">
                    {t(
                      '你的日主（Day Master）是',
                      'Your Day Master is'
                    )} <span className="font-bold" style={{ color: getElementColor(dayMasterElement) }}>{dayMasterElement}</span>。
                    {t(
                      '结合你的命卦，上述方位已经考虑了五行平衡。面向吉方可以提高对应领域的好运。',
                      '. Combined with your Kua Number, the directions above account for Five Elements balance. Facing auspicious directions can enhance luck in corresponding areas.'
                    )}
                  </p>
                </div>
              </section>
            )}

            {/* Cross-links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/tools/lucky-element-finder" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Compass size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的五行缺什么？', 'What Elements Are Missing?')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看五行分析 →', 'Check Five Elements →')}</p>
              </Link>

              <Link href="/tools/lucky-numbers" className="glass-card p-5 border-gold-primary/20 hover:border-gold-primary/40 transition-all text-center group">
                <Sun size={20} className="mx-auto mb-2 text-gold-primary"/>
                <p className="text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors">{t('你的幸运数字', 'Your Lucky Numbers')}</p>
                <p className="text-xs text-text-muted mt-1">{t('查看幸运数字 →', 'Check Lucky Numbers →')}</p>
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
