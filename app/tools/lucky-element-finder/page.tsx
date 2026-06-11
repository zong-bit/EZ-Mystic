'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WuxingDashboard, type ElementStat, type MissingInfo, type LuckyElementInfo } from '@/components/LuckyElementChart';
import { getElementMeta, getElementColor, getDayMasterElement } from '@/lib/bazi-calculator';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Sun,
  Moon,
  Compass,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BaziApiResponse {
  success: boolean;
  bazi: {
    yearPillar: { gan: string; zhi: string };
    monthPillar: { gan: string; zhi: string };
    dayPillar: { gan: string; zhi: string };
    hourPillar: { gan: string; zhi: string };
    wuxing: Array<{ element: string; count: number }>;
  };
}

// ---------------------------------------------------------------------------
// Helpers — timezone lookup (simplified)
// ---------------------------------------------------------------------------

const TIMEZONE_MAP: Record<string, { offset: number; label: string }> = {
  'New York':   { offset: -4,  label: 'EST (UTC-5/-4)' },
  'Los Angeles':{ offset: -7,  label: 'PST (UTC-8/-7)' },
  'Chicago':    { offset: -5,  label: 'CST (UTC-6/-5)' },
  'London':     { offset: 1,   label: 'BST (UTC+0/+1)' },
  'Paris':      { offset: 2,   label: 'CET (UTC+1/+2)' },
  'Tokyo':      { offset: 9,   label: 'JST (UTC+9)' },
  'Sydney':     { offset: 10,  label: 'AEST (UTC+10)' },
  'Beijing':    { offset: 8,   label: 'CST (UTC+8)' },
};

const CITIES = Object.keys(TIMEZONE_MAP);

// ---------------------------------------------------------------------------
// Form State
// ---------------------------------------------------------------------------

interface FormData {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  gender: 'male' | 'female';
  city: string;
}

const DEFAULT_FORM: FormData = {
  year: '1995', month: '6', day: '15',
  hour: '14', minute: '30', gender: 'male', city: 'Beijing',
};

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function LuckyElementFinderPage() {
  const pathname = usePathname();
  const isZh = pathname.startsWith('/zh');

  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [distribution, setDistribution] = useState<ElementStat[] | null>(null);
  const [missingElements, setMissingElements] = useState<MissingInfo[]>([]);
  const [luckyElements, setLuckyElements] = useState<LuckyElementInfo[]>([]);
  const [dayMasterElement, setDayMasterElement] = useState<string>('');

  // T helper
  const t = (zh: string, en: string) => isZh ? zh : en;

  // Handle form change
  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate and fetch results
  const handleCalculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = parseInt(form.year, 10);
      const month = parseInt(form.month, 10);
      const day = parseInt(form.day, 10);
      const hour = parseInt(form.hour, 10);
      const minute = parseInt(form.minute, 10);

      if (year < 1900 || year > 2100) {
        setError(t('年份必须在 1900–2100 之间', 'Year must be between 1900 and 2100'));
        setLoading(false);
        return;
      }

      // Call the existing /api/bazi endpoint
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          gender: form.gender,
          location: { city: form.city },
        }),
      });

      if (!response.ok) {
        throw new Error(t('网络请求失败，请稍后重试', 'Network request failed. Please try again.'));
      }

      const data: BaziApiResponse = await response.json();
      if (!data.success) {
        throw new Error(t('八字计算失败', 'Bazi calculation failed'));
      }

      // Extract pillars
      const allStems = [data.bazi.yearPillar.gan, data.bazi.monthPillar.gan, data.bazi.dayPillar.gan, data.bazi.hourPillar.gan];
      const allZhis = [data.bazi.yearPillar.zhi, data.bazi.monthPillar.zhi, data.bazi.dayPillar.zhi, data.bazi.hourPillar.zhi];

      // Calculate five elements distribution using our utility
      const { calcWuxingDistribution, findMissingElements, determineLuckyElements } = await import('@/lib/bazi-calculator');
      const dist = calcWuxingDistribution(allStems, allZhis);

      // Missing elements
      const missing = findMissingElements(dist);

      // Day Master element (from day stem)
      const dmElement = getDayMasterElement(data.bazi.dayPillar.gan);

      // Lucky elements
      const lucky = determineLuckyElements(dmElement, missing);

      setDistribution(dist);
      setMissingElements(missing);
      setLuckyElements(lucky);
      setDayMasterElement(dmElement);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('未知错误', 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render — Form (no results yet)
  // ---------------------------------------------------------------------------

  if (!distribution || missingElements.length === 0 && !loading) {
    return (
      <main className="min-h-screen bg-bg-base text-text-primary selection:bg-gold-primary/30 selection:text-gold-light pb-16">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gold-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-8 pt-12 md:pt-20">

          {/* Header */}
          <header className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold-primary/20 text-xs font-medium text-gold-primary">
              <Sparkles size={12} />
              {t('免费工具', 'FREE TOOL')}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
              {t('五行缺什么？', 'What\'s Missing in Your')}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light via-amber-400 to-gold-primary">
                {t('五行', 'Five Elements')}
              </span>
            </h1>

            <p className="text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
              {t(
                '输入你的出生信息，AI 将分析你的八字命盘中的五行分布，找出缺失的元素并推荐幸运元素、颜色、数字和方位。',
                'Enter your birth details to analyze the Five Elements in your Bazi chart. Discover what\'s missing and find your lucky elements, colors, numbers, and directions.'
              )}
            </p>
          </header>

          {/* Form Card */}
          <div className="glass-card p-6 md:p-8 space-y-6">

            {/* Row 1: Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="bazi-year" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('年 · Year', 'Year')}
                </label>
                <input
                  id="bazi-year"
                  type="number"
                  min={1900} max={2100}
                  value={form.year}
                  onChange={(e) => update('year', e.target.value)}
                  className="input-field"
                  placeholder="1995"
                />
              </div>

              <div>
                <label htmlFor="bazi-month" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('月 · Month', 'Month')}
                </label>
                <input
                  id="bazi-month"
                  type="number"
                  min={1} max={12}
                  value={form.month}
                  onChange={(e) => update('month', e.target.value)}
                  className="input-field"
                  placeholder="6"
                />
              </div>

              <div>
                <label htmlFor="bazi-day" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('日 · Day', 'Day')}
                </label>
                <input
                  id="bazi-day"
                  type="number"
                  min={1} max={31}
                  value={form.day}
                  onChange={(e) => update('day', e.target.value)}
                  className="input-field"
                  placeholder="15"
                />
              </div>
            </div>

            {/* Row 2: Time + Gender */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="bazi-hour" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('时 · Hour', 'Hour')}
                </label>
                <input
                  id="bazi-hour"
                  type="number"
                  min={0} max={23}
                  value={form.hour}
                  onChange={(e) => update('hour', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="bazi-minute" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('分 · Minute', 'Minute')}
                </label>
                <input
                  id="bazi-minute"
                  type="number"
                  min={0} max={59}
                  value={form.minute}
                  onChange={(e) => update('minute', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="bazi-gender" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                  {t('性别 · Gender', 'Gender')}
                </label>
                <select
                  id="bazi-gender"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                  className="input-field"
                >
                  <option value="male">{t('男 · Male', 'Male')}</option>
                  <option value="female">{t('女 · Female', 'Female')}</option>
                </select>
              </div>
            </div>

            {/* Row 3: City */}
            <div>
              <label htmlFor="bazi-city" className="block text-xs font-medium uppercase tracking-wider text-text-muted mb-2">
                {t('出生城市 · Birth City', 'Birth City')}
              </label>
              <select
                id="bazi-city"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="input-field"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city} ({TIMEZONE_MAP[city].label})
                  </option>
                ))}
              </select>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  {t('分析中...', 'Analyzing...')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('✦ 分析五行 · Analyze Five Elements', '✦ Analyze My Five Elements')}
                </span>
              )}
            </button>
          </div>

          {/* SEO Content — below the fold */}
          <section className="mt-16 space-y-6 text-sm text-text-secondary leading-relaxed">
            <h2 className="text-xl font-bold text-gold-primary">{t('什么是五行缺失分析？', 'What is Five Elements Analysis?')}</h2>
            <p>{t(
              '在八字命理中，五行（木、火、土、金、水）构成了你命盘的根基。每个人的出生时间对应特定的五行分布——如果你的某个元素过弱或缺失，可能会影响健康、事业或人际关系。',
              'In Bazi (Four Pillars) destiny analysis, the Five Elements — Wood, Fire, Earth, Metal, Water — form the foundation of your chart. Your birth time determines a specific elemental distribution; when one element is weak or missing, it may affect health, career, or relationships.'
            )}</p>

            <h2 className="text-xl font-bold text-gold-primary">{t('如何使用这个工具？', 'How to Use This Tool?')}</h2>
            <ol className="list-none space-y-3 pl-0">
              {[
                { zh: '输入你的公历出生日期（年/月/日）', en: 'Enter your Gregorian birth date (year/month/day)' },
                { zh: '输入出生时间（精确到分钟，可选）', en: 'Enter your birth time (to the minute, optional)' },
                { zh: '选择你的出生城市（用于时区校正）', en: 'Select your birth city (for timezone correction)' },
                { zh: '点击分析，查看你的五行分布和幸运元素', en: 'Click Analyze to see your Five Elements distribution and lucky elements' },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gold-primary/15 text-gold-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{t(step.zh, step.en)}</span>
                </li>
              ))}
            </ol>

            <h2 className="text-xl font-bold text-gold-primary">{t('五行与幸运元素', 'Five Elements & Lucky Attributes')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {['木', '火', '土', '金', '水'].map((el) => {
                const meta = getElementMeta(el);
                return (
                  <div key={el} className="p-3 rounded-xl border text-center" style={{ borderColor: `${meta.color}20`, backgroundColor: `${meta.color}06` }}>
                    <span className="text-2xl font-bold" style={{ color: meta.color }}>{el}</span>
                    <p className="text-xs text-text-muted mt-1">{meta.season}</p>
                    <p className="text-[10px] text-text-muted">{meta.direction.split('(')[0].trim()}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
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
  // Render — Results (with distribution data)
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-bg-base text-text-primary selection:bg-gold-primary/30 selection:text-gold-light pb-16">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gold-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-12 md:pt-20">

        {/* Header */}
        <header className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold-primary/20 text-xs font-medium text-gold-primary">
            <Sparkles size={12} />
            {t('分析结果 · Analysis Results', 'Analysis Results')}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            {t('你的五行分析', 'Your Five Elements')}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-primary">
              {t('分析', 'Analysis')}
            </span>
          </h1>

          {/* Birth info summary */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {form.year}/{String(form.month).padStart(2, '0')}/{String(form.day).padStart(2, '0')}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {form.hour}:{String(form.minute).padStart(2, '0')}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {form.city}</span>
            <span className="flex items-center gap-1.5"><Moon size={14} /> {form.gender === 'male' ? t('男', 'Male') : t('女', 'Female')}</span>
          </div>

          {/* Day Master info */}
          {dayMasterElement && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-primary/10 border border-gold-primary/25">
              <Sun size={16} />
              <span className="text-sm font-medium text-gold-primary">
                {t('日主（Day Master）: ', 'Day Master (日主): ')}
                <span className="font-bold text-lg" style={{ color: getElementColor(dayMasterElement) }}>
                  {dayMasterElement} ({getElementMeta(dayMasterElement).element})
                </span>
              </span>
            </div>
          )}

          <button onClick={() => { setDistribution(null); }} className="text-xs text-text-muted hover:text-gold-primary transition-colors underline">
            {t('← 重新输入', '← Enter New Date')}
          </button>
        </header>

        {/* Results */}
        <div className="glass-card p-6 md:p-8">

          {/* Error state */}
          {error && (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <svg className="w-16 h-16 text-gold-primary/50" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="66 200" className="animate-spin origin-center" />
              </svg>
              <p className="text-gold-primary font-medium">{t('正在分析五行...', 'Analyzing Five Elements...')}</p>
            </div>
          )}

          {/* Dashboard */}
          {!loading && distribution && (
            <WuxingDashboard
              distribution={distribution}
              missingElements={missingElements.length > 0 ? missingElements : undefined}
              luckyElements={luckyElements}
            />
          )}
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-6 text-sm text-text-secondary leading-relaxed">
          <h2 className="text-xl font-bold text-gold-primary">{t('如何增强缺失的五行？', 'How to Strengthen Missing Elements?')}</h2>
          <p>{t(
            '找到缺失元素只是第一步。在日常生活中融入对应的幸运元素，可以帮助平衡你的命盘能量：',
            'Finding missing elements is just the first step. Integrating corresponding lucky elements into daily life can help balance your chart energy:'
          )}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { zh: '颜色：在穿搭、家居中使用对应色', en: 'Colors: Wear and decorate in corresponding colors' },
              { zh: '方位：面向幸运方向工作或休息', en: 'Direction: Face lucky direction when working or resting' },
              { zh: '数字：在重要决策中使用幸运数', en: 'Numbers: Use lucky numbers for important decisions' },
              { zh: '物品：佩戴或摆放对应元素的饰品', en: 'Items: Wear or place corresponding elemental objects' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-gold-primary text-lg flex-shrink-0">✦</span>
                <span>{t(tip.zh, tip.en)}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="glass-card p-6 text-center">
            <p className="text-text-secondary mb-3">{t('想要完整的命盘分析和深度解读？', 'Want a complete chart analysis with deep insights?')}</p>
            <Link href="/bazi" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-gold-primary to-gold-secondary text-ink-black font-semibold shadow-[0_10px_20px_rgba(212,168,83,0.2)] hover:from-gold-light hover:to-gold-primary transition-all active:scale-95">
              {t('✦ 查看完整命盘 · Full Bazi Chart', '✦ View Full Bazi Chart')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
