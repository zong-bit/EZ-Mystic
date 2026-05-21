'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ShareModal from '../components/ShareModal';
import Link from 'next/link';
import { CITIES, type CityData } from './cities';
import {
  GAN_TRANSLATIONS,
  ZHI_TRANSLATIONS,
  WUXING_TRANSLATIONS,
  SHICHEN_TRANSLATIONS,
  NAYIN_TRANSLATIONS,
  TEN_DEITY_TRANSLATIONS,
  PILLAR_LABELS as PILLAR_LABELS_CN,
  SECTION_HEADERS,
} from '@/bazi/translations';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BaziPillar {
  gan: string;
  zhi: string;
}

interface WuxingCount {
  element: string;
  count: number;
}

interface TenDeityItem {
  pillar: 'year' | 'month' | 'day' | 'hour';
  gan: string;
  zhi: string;
  ganTenDeity: string;
  zhiTenDeities: { gan: string; deity: string; weight: number }[];
}

interface GrandFortuneCycle {
  index: number;
  stem: string;
  branch: string;
  startAge: number;
  endAge: number;
}

interface GrandFortune {
  startAge: number;
  startYear: number;
  direction: 'forward' | 'backward';
  cycles: GrandFortuneCycle[];
}

interface HiddenStem {
  zhi: string;
  stems: { gan: string; weight: number }[];
}

interface BaziResponse {
  success: boolean;
  bazi: {
    yearPillar: BaziPillar;
    monthPillar: BaziPillar;
    dayPillar: BaziPillar;
    hourPillar: BaziPillar;
    zodiac: string;
    wuxing: WuxingCount[];
    nayin: string[];
    shichen: string;
    shichenIndex: number;
    tenDeities: TenDeityItem[];
    hiddenStems: HiddenStem[];
    grandFortune: GrandFortune;
    trueSolarTime: {
      finalHour: number;
      equationOfTime: number;
      longitudeCorrection: number;
    };
  };
  interpretation: string;
}

interface InterpretResponse {
  success: boolean;
  content: string;
}

interface PdfResponse {
  success: boolean;
  pdfBase64: string;
  filename: string;
}

type CalendarMode = 'solar' | 'lunar';

interface FormData {
  name: string;
  gender: 'male' | 'female';
  calendarMode: CalendarMode;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  useTrueSolarTime: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WUXING_COLORS: Record<string, { text: string; bg: string; light: string }> = {
  '木': { text: 'text-wood', bg: 'bg-wood', light: '#2D8B5720' },
  '火': { text: 'text-fire', bg: 'bg-fire', light: '#C23B2220' },
  '土': { text: 'text-earth', bg: 'bg-earth', light: '#8B735520' },
  '金': { text: 'text-metal', bg: 'bg-metal', light: '#C0C0C020' },
  '水': { text: 'text-water', bg: 'bg-water', light: '#3B82F620' },
};

const WUXING_ICONS: Record<string, string> = {
  '木': '🌳',
  '火': '🔥',
  '土': '⛰️',
  '金': '🔮',
  '水': '💧',
};

const PILLAR_LABELS: Record<string, string> = {
  year: 'Year Pillar',
  month: 'Month Pillar',
  day: 'Day Pillar',
  hour: 'Hour Pillar',
};

const WUXING_CYCLE = ['木', '火', '土', '金', '水'];

const YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// ─── Simple Markdown Renderer ────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // Helper to commit a pending list
  let pendingList: React.ReactNode[] | null = null;
  function flushList() {
    if (pendingList && pendingList.length > 0) {
      nodes.push(
        <ul key={`ul-${key++}`} className="space-y-0.5 my-3">
          {pendingList}
        </ul>
      );
      pendingList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      nodes.push(<div key={key++} className="h-3" />);
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3 key={key++} className="font-display text-lg font-semibold text-gold-primary mt-6 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2 key={key++} className="font-display text-xl font-bold text-gold-light mt-8 mb-4 gold-divider pb-2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // H1
    if (trimmed.startsWith('# ')) {
      flushList();
      nodes.push(
        <h1 key={key++} className="font-display text-2xl font-bold text-gold-primary mt-8 mb-4">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      if (!pendingList) pendingList = [];
      pendingList.push(
        <li key={key++} className="flex items-start gap-2 text-text-primary text-sm leading-relaxed">
          <span className="text-gold-primary mt-1 flex-shrink-0">✦</span>
          <span>{renderInline(text)}</span>
        </li>
      );
      continue;
    }

    // Table
    if (trimmed.includes('|') && trimmed.match(/^\|.*\|$/)) {
      flushList();
      const cells = trimmed.split('|').filter(c => c.trim());
      // Check if it's a separator row
      if (trimmed.match(/^\|[\s:-]+\|[\s:-]+\|/)) continue;

      nodes.push(
        <div key={key++} className="flex gap-4 py-1 text-sm">
          {cells.map((cell, ci) => (
            <span key={ci} className="text-text-primary flex-1">{cell.trim()}</span>
          ))}
        </div>
      );
      continue;
    }

    // Separator line
    if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
      flushList();
      nodes.push(<div key={key++} className="gold-divider my-4" />);
      continue;
    }

    // Bold text
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushList();
      nodes.push(
        <p key={key++} className="text-text-primary font-semibold text-sm leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      nodes.push(
        <blockquote key={key++} className="border-l-2 border-gold-primary/40 pl-4 text-text-secondary text-sm italic my-2 leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Warning / disclaimer
    if (trimmed.startsWith('⚠️')) {
      flushList();
      nodes.push(
        <div key={key++} className="flex items-start gap-2 text-text-tertiary text-xs mt-4 p-3 rounded-lg bg-white/5">
          <span>⚠️</span>
          <span>{trimmed.replace(/^⚠️\s*/, '')}</span>
        </div>
      );
      continue;
    }

    // Not a list item — flush any pending list
    flushList();

    // Default paragraph
    nodes.push(
      <p key={key++} className="text-text-primary text-sm leading-relaxed mb-2">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush remaining list
  flushList();

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gold-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Wuxing Helpers ──────────────────────────────────────────────────────────

function getWuxing(gan: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
  };
  return map[gan] || '';
}

function getZhiWuxing(zhi: string): string {
  const map: Record<string, string> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
  };
  return map[zhi] || '';
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PillarCard({ label, pillar, index }: { label: string; pillar: BaziPillar; index: number }) {
  const ganWx = getWuxing(pillar.gan);
  const zhiWx = getZhiWuxing(pillar.zhi);
  const wxColor = WUXING_COLORS[ganWx] || { text: 'text-text-primary', bg: '', light: '' };
  const ganLabel = GAN_TRANSLATIONS[pillar.gan] || pillar.gan;
  const zhiLabel = ZHI_TRANSLATIONS[pillar.zhi] || pillar.zhi;

  return (
    <div className="glass-card p-4 md:p-5 text-center animate-[ink-spread_0.6s_ease-out]"
      style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'both' }}>
      <div className="text-xs text-text-tertiary mb-2 font-medium tracking-wider uppercase">{label}</div>
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className={`text-3xl md:text-4xl font-display font-bold ${wxColor.text}`}>
          {pillar.gan}
        </span>
        <span className="text-3xl md:text-4xl font-display font-bold text-text-primary">
          {pillar.zhi}
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-text-tertiary leading-tight">{ganLabel}</span>
        <span className="text-[10px] text-text-tertiary leading-tight">{zhiLabel}</span>
      </div>
    </div>
  );
}

function WuxingBar({ element, count, max }: { element: string; count: number; max: number }) {
  const color = WUXING_COLORS[element];
  const pct = max > 0 ? (count / max) * 100 : 0;
  const label = WUXING_TRANSLATIONS[element] || element;

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center flex-shrink-0">{WUXING_ICONS[element]}</span>
      <span className={`w-12 text-xs font-semibold ${color?.text || ''} flex-shrink-0`}>{element}</span>
      <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color?.bg || ''}`}
          style={{ width: `${pct}%`, opacity: 0.7 }}
        />
      </div>
      <span className="w-5 text-right text-xs text-text-secondary tabular-nums flex-shrink-0">{count}</span>
      <span className="w-16 text-right text-[10px] text-text-tertiary flex-shrink-0 hidden sm:block">{label}</span>
    </div>
  );
}

function TenDeityTable({ tenDeities }: { tenDeities: TenDeityItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Pillar (柱)</th>
            <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Stem (天干)</th>
            <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Ten Deity (十神)</th>
            <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Branch (地支)</th>
            <th className="text-left py-2 px-3 text-text-tertiary font-medium text-xs uppercase tracking-wider">Hidden · Deity (藏干·十神)</th>
          </tr>
        </thead>
        <tbody>
          {tenDeities.map((item) => {
            const ganWx = getWuxing(item.gan);
            const ganTenDeityLabel = TEN_DEITY_TRANSLATIONS[item.ganTenDeity] || item.ganTenDeity;
            return (
              <tr key={item.pillar} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 text-text-primary font-medium">{PILLAR_LABELS_CN[item.pillar]}</td>
                <td className={`py-3 px-3 ${WUXING_COLORS[ganWx]?.text || ''} font-display text-base`}>
                  {item.gan}
                </td>
                <td className="py-3 px-3">
                  <span className="text-text-primary">{item.ganTenDeity}</span>
                  <span className="text-text-tertiary text-[10px] ml-1 block">{ganTenDeityLabel}</span>
                </td>
                <td className="py-3 px-3 text-text-secondary font-display">{item.zhi}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.zhiTenDeities.map((zt, zi) => {
                      const wxC = WUXING_COLORS[getWuxing(zt.gan)];
                      const deityLabel = TEN_DEITY_TRANSLATIONS[zt.deity] || zt.deity;
                      return (
                        <span key={zi} className={`text-xs px-1.5 py-0.5 rounded ${wxC?.text || ''} bg-white/[0.03]`}
                          title={`${zt.gan} · ${deityLabel} · Weight: ${zt.weight}`}>
                          {zt.gan}({zt.deity})
                        </span>
                      );
                    })}
                    {item.zhiTenDeities.length === 0 && (
                      <span className="text-xs text-text-tertiary">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GrandFortuneTimeline({ gf }: { gf: GrandFortune }) {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="flex items-center gap-4 text-sm mb-6">
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-text-tertiary">Start Age:</span>
          <span className="text-gold-primary font-semibold">{gf.startAge} years</span>
          <span className="text-text-tertiary ml-1">({gf.startYear})</span>
        </div>
        <div className="glass px-3 py-1.5 rounded-lg">
          <span className="text-text-tertiary">Direction:</span>
          <span className="text-text-secondary">{gf.direction === 'forward' ? 'Forward' : 'Reverse'}</span>
        </div>
      </div>

      <div className="space-y-2">
        {gf.cycles.map((cycle, idx) => {
          const birthYear = gf.startYear - gf.startAge;
          const cycleStartYear = birthYear + cycle.startAge;
          const cycleEndYear = birthYear + cycle.endAge;
          const isCurrent = currentYear >= cycleStartYear && currentYear <= cycleEndYear;
          const wx = getWuxing(cycle.stem);
          const zhiWx = getZhiWuxing(cycle.branch);

          return (
            <div key={idx}
              className={`glass-card p-3 md:p-4 flex items-center gap-4 transition-all duration-300 ${
                isCurrent ? 'ring-1 ring-gold-primary/30 glow-pulse' : 'opacity-70 hover:opacity-100'
              }`}>
              {/* Age range */}
              <div className="flex-shrink-0 w-16 md:w-20 text-center">
                <div className="text-xs text-text-tertiary">{cycle.startAge}-{cycle.endAge} yrs</div>
                <div className="text-[10px] text-text-tertiary/60">{cycleStartYear}-{cycleEndYear}</div>
              </div>

              {/* Pillar */}
              <div className="flex-shrink-0 text-center">
                <span className={`text-xl md:text-2xl font-display font-bold ${WUXING_COLORS[wx]?.text || ''}`}>
                  {cycle.stem}
                </span>
                <span className="text-xl md:text-2xl font-display font-bold text-text-primary">
                  {cycle.branch}
                </span>
              </div>

              {/* Wuxing indicators */}
              <div className="flex-shrink-0 flex gap-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${WUXING_COLORS[wx]?.bg || ''}`}
                  title={`Heavenly Stem Element: ${wx}`}>
                  {WUXING_ICONS[wx]}
                </span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${WUXING_COLORS[zhiWx]?.bg || ''}`}
                  title={`Earthly Branch Element: ${zhiWx}`}>
                  {WUXING_ICONS[zhiWx]}
                </span>
              </div>

              {/* Index */}
              <div className="ml-auto text-xs text-text-tertiary">
                {idx + 1}{getOrdinal(idx + 1)}
              </div>

              {isCurrent && (
                <div className="text-[10px] text-gold-primary font-semibold px-2 py-0.5 rounded-full bg-gold-primary/10">
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function HiddenStemsTable({ hiddenStems }: { hiddenStems: HiddenStem[] }) {
  const ZHI_LABELS: Record<string, string> = {
    '子': '子', '丑': '丑', '寅': '寅', '卯': '卯',
    '辰': '辰', '巳': '巳', '午': '午', '未': '未',
    '申': '申', '酉': '酉', '戌': '戌', '亥': '亥',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {hiddenStems.map((hs) => {
        const zhiWx = getZhiWuxing(hs.zhi);
        return (
          <div key={hs.zhi} className="glass p-3 rounded-xl text-center">
            <div className={`text-lg font-display font-bold mb-1 ${WUXING_COLORS[zhiWx]?.text || ''}`}>
              {hs.zhi}
            </div>
            <div className="text-[10px] text-text-tertiary mb-2">{zhiWx}</div>
            <div className="space-y-0.5">
              {hs.stems.map((s, si) => {
                const sWx = getWuxing(s.gan);
                return (
                  <div key={si} className="flex items-center justify-center gap-1 text-xs">
                    <span className={WUXING_COLORS[sWx]?.text || ''}>{s.gan}</span>
                    <span className="text-text-tertiary">{'·'.repeat(s.weight)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl mb-4 taiji-loader">☯</div>
        <div className="text-gold-primary font-display text-lg mb-2">Calculating your destiny chart...</div>
        <div className="text-text-tertiary text-sm">Decoding your destiny code</div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BaziPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    gender: 'male',
    calendarMode: 'solar',
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    city: '',
    useTrueSolarTime: true,
  });

  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityDropdownRef, setCityDropdownRef] = useState<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaziResponse | null>(null);
  const [fateBook, setFateBook] = useState<string | null>(null);
  const [fateBookLoading, setFateBookLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // Filter cities based on search
  const filteredCities = citySearch
    ? CITIES.filter(c => c.name.includes(citySearch) || citySearch.includes(c.name))
    : CITIES;

  // Close city dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef && !cityDropdownRef.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cityDropdownRef]);

  const handleFormChange = useCallback((field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const selectCity = useCallback((city: CityData) => {
    setSelectedCity(city);
    setForm(prev => ({ ...prev, city: city.name }));
    setCitySearch(city.name);
    setShowCityDropdown(false);
  }, []);

  const validateForm = (): string | null => {
    if (!form.year || form.year < 1900 || form.year > 2100) return 'Please enter a valid year (1900–2100)';
    if (!form.month || form.month < 1 || form.month > 12) return 'Please enter a valid month';
    if (!form.day || form.day < 1 || form.day > 31) return 'Please enter a valid day';
    if (form.hour === undefined || form.hour < 0 || form.hour > 23) return 'Please select your birth hour';
    if (form.minute === undefined || form.minute < 0 || form.minute > 59) return 'Please select your birth minute';
    return null;
  };

  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);
    setFateBook(null);

    try {
      const body: any = {
        year: form.year,
        month: form.month,
        day: form.day,
        hour: form.hour,
        minute: form.minute,
        gender: form.gender,
        name: form.name || undefined,
        useTrueSolarTime: form.useTrueSolarTime,
      };

      if (selectedCity) {
        body.location = {
          city: selectedCity.name,
          longitude: selectedCity.longitude,
          latitude: selectedCity.latitude,
          timezone: selectedCity.timezone,
        };
      }

      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data: BaziResponse = await response.json();

      if (!data.success) {
        throw new Error((data as any).error || 'Bazi calculation failed');
      }

      setResult(data);

      // Scroll to results after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Request failed, please try again later');
    } finally {
      setLoading(false);
    }
  }, [form, selectedCity]);

  const handleGenerateFateBook = useCallback(async () => {
    if (!result) return;
    setFateBookLoading(true);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bazi: result.bazi,
          name: form.name || 'Anonymous',
        }),
      });

      const data: InterpretResponse = await response.json();
      if (data.success) {
        setFateBook(data.content);
      } else {
        throw new Error('Destiny book generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Destiny book generation failed');
    } finally {
      setFateBookLoading(false);
    }
  }, [result, form.name]);

  const handleDownloadPdf = useCallback(async () => {
    if (!result) return;
    setPdfLoading(true);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bazi: result.bazi,
          name: form.name || 'Anonymous',
          interpretation: fateBook || result.interpretation,
          title: `${form.name || 'Anonymous'} · Destiny Book`,
        }),
      });

      const data: PdfResponse = await response.json();
      if (data.success) {
        const link = document.createElement('a');
        link.href = data.pdfBase64;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'PDF download failed');
    } finally {
      setPdfLoading(false);
    }
  }, [result, form.name, fateBook]);

  // Find the max wuxing count for bar chart scaling
  const maxWuxingCount = result
    ? Math.max(...result.bazi.wuxing.map(w => w.count), 1)
    : 1;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-40" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-12">
          <div className="mb-4">
            <span className="text-gold-primary text-sm font-display tracking-widest">✦ Bazi Chart · AI Reading ✦</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 text-gold-glow">
            Enter Your Birth Information
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            Precise charting with true solar time correction, AI astrologer reveals your destiny code
          </p>
        </div>
      </section>

      {/* ─── Form ─── */}
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Name (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Gender</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      form.gender === 'male'
                        ? 'bg-gold-primary/20 text-gold-primary border border-gold-primary/40'
                        : 'bg-white/5 text-text-secondary border border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleFormChange('gender', 'male')}>
                    ♂ Male
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                      form.gender === 'female'
                        ? 'bg-gold-primary/20 text-gold-primary border border-gold-primary/40'
                        : 'bg-white/5 text-text-secondary border border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => handleFormChange('gender', 'female')}>
                    ♀ Female
                  </button>
                </div>
              </div>

              {/* Calendar toggle */}
              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-2">Birth Date</label>
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      form.calendarMode === 'solar'
                        ? 'bg-gold-primary/15 text-gold-primary border border-gold-primary/30'
                        : 'bg-white/5 text-text-secondary border border-white/10'
                    }`}
                    onClick={() => handleFormChange('calendarMode', 'solar')}>
                    ☀ Solar Calendar
                  </button>
                  <button
                    type="button"
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      form.calendarMode === 'lunar'
                        ? 'bg-gold-primary/15 text-gold-primary border border-gold-primary/30'
                        : 'bg-white/5 text-text-secondary border border-white/10'
                    }`}
                    onClick={() => handleFormChange('calendarMode', 'lunar')}>
                    🌙 Lunar Calendar
                  </button>
                  {form.calendarMode === 'lunar' && (
                    <span className="text-xs text-gold-primary/60 self-center ml-2">
                      Will be converted to solar calendar upon submission
                    </span>
                  )}
                </div>

                {/* Year/Month/Day */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <select
                      className="input-field text-sm"
                      value={form.year}
                      onChange={e => handleFormChange('year', parseInt(e.target.value))}>
                      {YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className="input-field text-sm"
                      value={form.month}
                      onChange={e => handleFormChange('month', parseInt(e.target.value))}>
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      className="input-field text-sm"
                      value={form.day}
                      onChange={e => handleFormChange('day', parseInt(e.target.value))}>
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Birth Time */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">Birth Time</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="input-field text-sm"
                    value={form.hour}
                    onChange={e => handleFormChange('hour', parseInt(e.target.value))}>
                    {HOURS.map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}h</option>
                    ))}
                  </select>
                  <select
                    className="input-field text-sm"
                    value={form.minute}
                    onChange={e => handleFormChange('minute', parseInt(e.target.value))}>
                    {MINUTES.map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}m</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Birth City */}
              <div className="relative" ref={setCityDropdownRef}>
                <label className="block text-sm text-text-secondary mb-2">Birth City (optional)</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="Search city to auto-fill coordinates"
                  value={citySearch}
                  onChange={e => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                    if (!e.target.value) {
                      setSelectedCity(null);
                      handleFormChange('city', '');
                    }
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                />
                {showCityDropdown && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto glass rounded-xl border border-white/10 shadow-2xl">
                    {filteredCities.map(city => (
                      <button
                        key={city.name}
                        type="button"
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                          selectedCity?.name === city.name ? 'text-gold-primary bg-gold-primary/5' : 'text-text-primary'
                        }`}
                        onClick={() => selectCity(city)}>
                        <span>{city.name}</span>
                        <span className="text-text-tertiary text-xs ml-2">
                          {city.longitude}°E, {city.latitude}°N
                        </span>
                      </button>
                    ))}
                    {filteredCities.length === 0 && (
                      <div className="px-4 py-3 text-text-tertiary text-sm">No matching city</div>
                    )}
                  </div>
                )}
              </div>

              {/* True Solar Time */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.useTrueSolarTime}
                      onChange={e => handleFormChange('useTrueSolarTime', e.target.checked)}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      form.useTrueSolarTime ? 'bg-gold-primary' : 'bg-white/10'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 mt-0.5 ${
                        form.useTrueSolarTime ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-text-primary font-medium">True Solar Time Correction</span>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      Correct time difference based on birth location coordinates for improved charting accuracy
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="mt-6 text-center">
              <button
                type="button"
                className="btn-primary glow-pulse text-lg px-12 py-4"
                onClick={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="taiji-loader inline-block">☯</span>
                    Calculating...
                  </span>
                ) : (
                  '✨ Start Chart Reading'
                )}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 flex justify-center gap-6 text-xs text-text-tertiary">
              <span>🐉 Precise to the Shichen</span>
              <span>🌍 True Solar Time</span>
              <span>🤖 AI Deep Interpretation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Results ─── */}
      {result && (
        <section ref={resultRef} className="px-6 pb-24 page-enter">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Personal Info */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-gold-primary mb-4">Subject Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-text-tertiary mb-1">Name</div>
                  <div className="text-text-primary font-medium">{form.name || 'Anonymous'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-text-tertiary mb-1">Gender</div>
                  <div className="text-text-primary font-medium">{form.gender === 'male' ? 'Male' : 'Female'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-text-tertiary mb-1">Zodiac</div>
                  <div className="text-text-primary font-medium">{result.bazi.zodiac}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-text-tertiary mb-1">Shichen</div>
                  <div className="text-text-primary font-medium">{result.bazi.shichen}</div>
                </div>
              </div>
            </div>

            {/* Four Pillars */}
            <div>
              <h2 className="font-display text-xl font-bold text-gold-primary mb-4 flex items-center gap-2">
                <span>{SECTION_HEADERS.fourPillars}</span>
                <span className="text-xs text-text-tertiary font-normal bg-white/5 px-2 py-0.5 rounded-full">
                  Heavenly Stem (天干) · Five Elements (五行)
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <PillarCard label="Year Pillar" pillar={result.bazi.yearPillar} index={0} />
                <PillarCard label="Month Pillar" pillar={result.bazi.monthPillar} index={1} />
                <PillarCard label="Day Pillar" pillar={result.bazi.dayPillar} index={2} />
                <PillarCard label="Hour Pillar" pillar={result.bazi.hourPillar} index={3} />
              </div>
              {/* Nayin */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {['Year Pillar', 'Month Pillar', 'Day Pillar', 'Hour Pillar'].map((label, idx) => {
                  const nayinKey = result.bazi.nayin[idx];
                  const nayinLabel = NAYIN_TRANSLATIONS[nayinKey] || nayinKey;
                  return (
                    <span key={idx} className="text-xs glass px-3 py-1.5 rounded-full text-text-secondary">
                      {label}: <span className="font-medium">{nayinKey}</span> <span className="text-text-tertiary">· {nayinLabel}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Wuxing Statistics */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.wuxing}</h2>
              <div className="space-y-3">
                {result.bazi.wuxing.map((w) => (
                  <WuxingBar key={w.element} element={w.element} count={w.count} max={maxWuxingCount} />
                ))}
              </div>

              {/* Wuxing cycle visual */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-1">
                  {WUXING_CYCLE.map((el, idx) => {
                    const found = result.bazi.wuxing.find(w => w.element === el);
                    return (
                      <div key={el} className="flex items-center">
                        <div className={`glass px-3 py-1.5 rounded-lg text-center min-w-[56px] ${
                          (found?.count || 0) > 0 ? 'opacity-100' : 'opacity-30'
                        }`}>
                          <div className={WUXING_COLORS[el]?.text || ''}>{WUXING_ICONS[el]}</div>
                          <div className="text-xs text-text-secondary">{found?.count || 0}</div>
                        </div>
                        {idx < 4 && (
                          <div className="w-4 h-px bg-gradient-to-r from-gold-primary/20 to-gold-primary/20 mx-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ten Deities */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.tenDeities}</h2>
              <p className="text-xs text-text-tertiary mb-4">
                Based on the Day Master ({result.bazi.dayPillar.gan} · Day Master/日主), analyzing the Ten Deity (十神) relationships of each pillar
              </p>
              <TenDeityTable tenDeities={result.bazi.tenDeities} />
            </div>

            {/* Hidden Stems */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.hiddenStems}</h2>
              <p className="text-xs text-text-tertiary mb-4">
                Heavenly stems (天干) hidden within each earthly branch (地支), · indicates weight
              </p>
              <HiddenStemsTable hiddenStems={result.bazi.hiddenStems} />
            </div>

            {/* Grand Fortune */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.grandFortune}</h2>
              <GrandFortuneTimeline gf={result.bazi.grandFortune} />
            </div>

            {/* True Solar Time Info */}
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.trueSolarTime}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center glass p-3 rounded-xl">
                  <div className="text-text-tertiary text-xs mb-1">Longitude Correction</div>
                  <div className="text-text-primary font-medium">
                    {result.bazi.trueSolarTime.longitudeCorrection > 0 ? '+' : ''}
                    {result.bazi.trueSolarTime.longitudeCorrection.toFixed(1)} min
                  </div>
                </div>
                <div className="text-center glass p-3 rounded-xl">
                  <div className="text-text-tertiary text-xs mb-1">Equation of Time</div>
                  <div className="text-text-primary font-medium">
                    {result.bazi.trueSolarTime.equationOfTime > 0 ? '+' : ''}
                    {result.bazi.trueSolarTime.equationOfTime.toFixed(1)} min
                  </div>
                </div>
                <div className="text-center glass p-3 rounded-xl">
                  <div className="text-text-tertiary text-xs mb-1">True Solar Time</div>
                  <div className="text-gold-primary font-medium">
                    {result.bazi.trueSolarTime.finalHour.toFixed(2)}h
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interpretation */}
            <div className="glass-card p-6 md:p-8" id="ai-interpretation">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-gold-primary">{SECTION_HEADERS.aiInterpretation}</h2>
              </div>

              <div className="bazi-interpretation">
                {renderMarkdown(result.interpretation)}
              </div>

              <div className="gold-divider my-6" />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                {!fateBook && (
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={handleGenerateFateBook}
                    disabled={fateBookLoading}>
                    {fateBookLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="taiji-loader inline-block">☯</span>
                        Generating...
                      </span>
                    ) : (
                      '📜 Generate Full Destiny Book (完整命书)'
                    )}
                  </button>
                )}
                <button
                  type="button"
                  className="glass text-sm px-6 py-3 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}>
                  {pdfLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="taiji-loader inline-block">☯</span>
                      Generating...
                    </span>
                  ) : (
                    '📥 Download PDF'
                  )}
                </button>
              </div>

              {/* Upgrade Prompt */}
              <div className="mt-6 glass-card p-5 rounded-2xl border border-gold-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/[0.03] to-transparent pointer-events-none" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-2xl">
                    👑
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-gold-primary text-base mb-1">
                      Unlock Your Full Destiny Profile
                    </h3>
                    <p className="text-text-secondary text-sm mb-3">
                      Get in-depth analysis: yearly fortune, career peak years, relationship compatibility,
                      and personalized feng shui recommendations.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/pricing"
                        className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                        <span>🚀 Upgrade to Pro</span>
                      </Link>
                      <Link
                        href="/fatebook"
                        className="text-sm text-gold-primary hover:underline inline-flex items-center gap-1">
                        Learn more →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fate Book */}
            {fateBook && (
              <div className="glass-card p-6 md:p-8">
                <h2 className="font-display text-lg font-bold text-gold-primary mb-4">{SECTION_HEADERS.fullDestinyBook}</h2>
                <div className="bazi-interpretation">
                  {renderMarkdown(fateBook)}
                </div>
              </div>
            )}

            {/* Share invite modal - appears 5s after results */}
            <ShareModal />

            {/* Disclaimer */}
            <p className="text-center text-text-muted text-xs">
              ⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.
            </p>
          </div>
        </section>
      )}

      {/* Loading overlay */}
      {loading && <LoadingOverlay />}

    </div>
  );
}
