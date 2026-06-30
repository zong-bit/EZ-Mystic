'use client';
// v3: force fresh SSR build
export const dynamic = 'force-dynamic';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BAGUA, type BaguaItem, type HexagramItem, getHexagram, getHexagramByLines, randomTrigramIndex } from '@/bazi/bagua';
import BaguaDiagram from './components/BaguaDiagram';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineInfo {
  index: number;      // 1-6, bottom to top
  value: number;      // 6=old yin, 7=young yang, 8=young yin, 9=old yang
  symbol: string;     // ⚋⏎ / ⚊ / ⚋ / ⚊⏎
  name: string;       // 老阴/少阳/少阴/老阳
  changing: boolean;  // true for 6 or 9
}

interface BaguaResult {
  upper: BaguaItem;
  lower: BaguaItem;
  hexagram: HexagramItem;
  upperLines: number[];
  lowerLines: number[];
  lineValues: number[];       // 6 line values bottom→top (for coin-toss)
  changingLines: number[];    // indices (1-based) of changing lines
  changedHexagram?: HexagramItem;
  changedUpper?: BaguaItem;
  changedLower?: BaguaItem;
  changedUpperLines?: number[];
  changedLowerLines?: number[];
  lineSymbols: string[];      // display symbols for each line
}

interface InterpretResponse {
  success: boolean;
  content: string;
  displayContent?: string;
  isPro?: boolean;
}

// ─── Hexagram Lines SVG ──────────────────────────────────────────────────────

function HexLinesSVG({ lines, size = 48, color = 'var(--accent-primary)' }: { lines: number[]; size?: number; color?: string }) {
  const lineH = 5;
  const gap = 4;
  const totalH = lines.length * lineH + (lines.length - 1) * gap;
  const w = size;
  const startY = -totalH / 2;

  return (
    <svg width={size} height={totalH} viewBox={`0 0 ${w} ${totalH}`}>
      {lines.map((line, i) => {
        const y = startY + i * (lineH + gap) + lineH / 2;
        if (line === 6) {
          return <rect key={i} x={4} y={y - lineH / 2} width={w - 8} height={lineH} rx={1} fill={color} />;
        } else {
          const segW = (w - 28) / 2;
          return (
            <g key={i}>
              <rect x={4} y={y - lineH / 2} width={segW} height={lineH} rx={1} fill={color} />
              <rect x={w - 4 - segW} y={y - lineH / 2} width={segW} height={lineH} rx={1} fill={color} />
            </g>
          );
        }
      })}
    </svg>
  );
}

// ─── Full Hexagram SVG (6 lines) ─────────────────────────────────────────────

function FullHexagramSVG({ upperLines, lowerLines, size = 120 }: { upperLines: number[]; lowerLines: number[]; size?: number }) {
  const allLines = [...upperLines, ...lowerLines];
  const lineH = 5;
  const gap = 4;
  const totalH = allLines.length * lineH + (allLines.length - 1) * gap;
  const w = size;
  const startY = -totalH / 2;

  return (
    <svg width={size} height={totalH} viewBox={`0 0 ${w} ${totalH}`}>
      {allLines.map((line, i) => {
        const y = startY + i * (lineH + gap) + lineH / 2;
        const isUpper = i < 3;
        const color = isUpper ? 'var(--accent-primary)' : 'var(--accent-secondary)';
        if (line === 6) {
          return <rect key={i} x={4} y={y - lineH / 2} width={w - 8} height={lineH} rx={1} fill={color} />;
        } else {
          const segW = (w - 28) / 2;
          return (
            <g key={i}>
              <rect x={4} y={y - lineH / 2} width={segW} height={lineH} rx={1} fill={color} />
              <rect x={w - 4 - segW} y={y - lineH / 2} width={segW} height={lineH} rx={1} fill={color} />
            </g>
          );
        }
      })}
    </svg>
  );
}

// ─── Trigram Badge ───────────────────────────────────────────────────────────

interface TrigramBadgeProps {
  item: BaguaItem;
  label: string;
  lines: number[];
  accentColor?: string;
  delay: number;
}

function TrigramBadge({ item, label, lines, accentColor = 'var(--accent-primary)', delay }: TrigramBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card cursor-pointer transition-all duration-300 hover:border-[rgba(212,168,83,0.35)] hover:shadow-[0_0_32px_rgba(212,168,83,0.1)]"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-5">
        {/* Trigram lines */}
        <div className="flex-shrink-0">
          <HexLinesSVG lines={lines} size={52} color={accentColor} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-1.5">{label}</div>
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" style={{ filter: `drop-shadow(0 0 6px ${accentColor}40)` }}>{item.symbol}</span>
            <span className="font-display font-bold text-xl" style={{ color: accentColor }}>{item.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-[var(--text-secondary)]">
              {item.element} · {item.direction}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? '200px' : '0px', opacity: expanded ? 1 : 0 }}
      >
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-tertiary)]">Nature</span>
            <span className="text-[var(--text-primary)]">{item.nature}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-tertiary)]">Element</span>
            <span className="text-[var(--text-primary)]">{item.element}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-tertiary)]">Direction</span>
            <span className="text-[var(--text-primary)]">{item.direction}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-tertiary)]">Meaning</span>
            <span className="text-[var(--text-primary)]">{item.meaning}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hexagram Display Card ───────────────────────────────────────────────────

function HexagramDisplayCard({ result }: { result: BaguaResult }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Top: hexagram name */}
      <div className="text-center pb-6 border-b border-white/[0.06]">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-tertiary)] mb-3">Hexagram · 卦</div>
        <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(212,168,83,0.2)' }}>
          {result.hexagram.chinese}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">{result.hexagram.english}</p>
      </div>

      {/* Middle: full hexagram lines */}
      <div className="flex justify-center py-8">
        <FullHexagramSVG upperLines={result.upperLines} lowerLines={result.lowerLines} size={140} />
      </div>

      {/* Bottom: two trigram badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrigramBadge
          item={result.upper}
          label="Upper Trigram · 上卦"
          lines={result.upperLines}
          accentColor="var(--accent-primary)"
          delay={100}
        />
        <TrigramBadge
          item={result.lower}
          label="Lower Trigram · 下卦"
          lines={result.lowerLines}
          accentColor="var(--accent-secondary)"
          delay={200}
        />
      </div>
    </div>
  );
}

// ─── Markdown Renderer ───────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let pendingList: React.ReactNode[] | null = null;

  function flushList() {
    if (pendingList && pendingList.length > 0) {
      nodes.push(<ul key={`ul-${key++}`} className="space-y-1 my-3">{pendingList}</ul>);
      pendingList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { flushList(); nodes.push(<div key={key++} className="h-2" />); continue; }
    if (trimmed.startsWith('### ')) { flushList(); nodes.push(<h3 key={key++} className="font-display text-base font-semibold mt-5 mb-2" style={{ color: 'var(--accent-primary)' }}>{trimmed.slice(4)}</h3>); continue; }
    if (trimmed.startsWith('## ')) { flushList(); nodes.push(<h2 key={key++} className="font-display text-lg font-bold mt-6 mb-3">{trimmed.slice(3)}</h2>); continue; }
    if (trimmed.startsWith('# ')) { flushList(); nodes.push(<h1 key={key++} className="font-display text-xl font-bold mt-6 mb-3" style={{ color: 'var(--accent-primary)' }}>{trimmed.slice(2)}</h1>); continue; }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const t = trimmed.slice(2);
      if (!pendingList) pendingList = [];
      pendingList.push(<li key={key++} className="flex items-start gap-2 text-[var(--text-primary)] text-sm leading-relaxed"><span className="text-[var(--accent-primary)] mt-1 flex-shrink-0">✦</span><span>{renderInline(t)}</span></li>);
      continue;
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) { flushList(); nodes.push(<p key={key++} className="text-[var(--text-primary)] font-semibold text-sm leading-relaxed">{renderInline(trimmed)}</p>); continue; }
    if (trimmed.startsWith('> ')) { flushList(); nodes.push(<blockquote key={key++} className="border-l-2 pl-4 text-[var(--text-secondary)] text-sm italic my-2 leading-relaxed" style={{ borderColor: 'rgba(212,168,83,0.4)' }}>{renderInline(trimmed.slice(2))}</blockquote>); continue; }
    if (trimmed.startsWith('⚠️')) { flushList(); nodes.push(<div key={key++} className="flex items-start gap-2 text-[var(--text-tertiary)] text-xs mt-4 p-3 rounded-lg bg-white/5"><span>⚠️</span><span>{trimmed.replace(/^⚠️\s*/, '')}</span></div>); continue; }
    flushList();
    nodes.push(<p key={key++} className="text-[var(--text-primary)] text-sm leading-relaxed mb-2">{renderInline(trimmed)}</p>);
  }
  flushList();
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Loading Overlay ─────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/85 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">☯</div>
        <div className="font-display text-lg mb-2" style={{ color: 'var(--accent-primary)' }}>Divining the hexagram...</div>
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Reading the eight trigrams</div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BaguaPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaguaResult | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagramKey, setDiagramKey] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Check Pro status from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('fatewise_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsPro(payload.plan === 'pro' || payload.subscription?.plan === 'pro');
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Coin toss helpers ──────────────────────────────────────────────
  function tossThreeCoins(): number {
    const coins = [Math.random() < 0.5 ? 3 : 2, Math.random() < 0.5 ? 3 : 2, Math.random() < 0.5 ? 3 : 2];
    return coins[0] + coins[1] + coins[2]; // 6, 7, 8, or 9
  }

  const LINE_SYMBOLS: Record<number, string> = { 6: '⚋⏎', 7: '⚊', 8: '⚋', 9: '⚊⏎' };
  const LINE_NAMES: Record<number, string> = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' };
  const LINE_NAMES_FULL: Record<number, string> = { 6: '老阴 ⚋⏎', 7: '少阳 ⚊', 8: '少阴 ⚋', 9: '老阳 ⚊⏎' };

  function buildLines(values: number[]): LineInfo[] {
    return values.map((v, i) => ({
      index: i + 1,
      value: v,
      symbol: LINE_SYMBOLS[v] || '?',
      name: LINE_NAMES[v] || '?',
      changing: v === 6 || v === 9,
    }));
  }

  function extractTrigramsFromLines(values: number[]): { upper: BaguaItem; lower: BaguaItem } {
    const lowerValues = [values[0], values[1], values[2]];
    const upperValues = [values[3], values[4], values[5]];

    const match = (vals: number[]): BaguaItem => {
      for (const t of BAGUA) {
        const rev = [...t.lines].reverse();
        if (rev[0] === vals[0] && rev[1] === vals[1] && rev[2] === vals[2]) return t;
      }
      return BAGUA[7]; // fallback 坤
    };

    return { upper: match(upperValues), lower: match(lowerValues) };
  }

  function buildChangedLines(values: number[]): number[] {
    return values.map(v => v === 6 ? 7 : v === 9 ? 8 : v);
  }

  const handleDivination = useCallback(async () => {
    setError(null);
    setResult(null);
    setInterpretation(null);
    setDiagramKey(k => k + 1);
    setLoading(true);

    try {
      // Coin toss: 6 lines, each from 3 coins
      const allValues: number[] = [];
      for (let i = 0; i < 6; i++) {
        const tosses = [tossThreeCoins(), tossThreeCoins(), tossThreeCoins()];
        const avg = Math.round((tosses[0] + tosses[1] + tosses[2]) / 3);
        allValues.push(Math.min(9, Math.max(6, avg)));
      }

      const lines = buildLines(allValues);
      const changingLines = lines.filter(l => l.changing).map(l => l.index);

      // Extract trigrams from original lines
      const { upper, lower } = extractTrigramsFromLines(allValues);
      const hexagram = getHexagram(upper, lower);
      if (!hexagram) throw new Error('Hexagram not found');

      // Build changed (变卦) if there are changing lines
      let changedHexagram: HexagramItem | undefined;
      let changedUpper: BaguaItem | undefined;
      let changedLower: BaguaItem | undefined;
      if (changingLines.length > 0) {
        const changedValues = buildChangedLines(allValues);
        const { upper: cu, lower: cl } = extractTrigramsFromLines(changedValues);
        changedUpper = cu;
        changedLower = cl;
        changedHexagram = getHexagram(cu, cl);
      }

      const lineSymbols = allValues.map(v => LINE_SYMBOLS[v] || '?');

      setResult({
        upper, lower, hexagram,
        upperLines: upper.lines,
        lowerLines: lower.lines,
        lineValues: allValues,
        changingLines,
        changedHexagram,
        changedUpper,
        changedLower,
        changedUpperLines: changedUpper?.lines,
        changedLowerLines: changedLower?.lines,
        lineSymbols,
      });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Divination failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInterpret = useCallback(async () => {
    if (!result) return;
    setInterpretLoading(true);
    try {
      const authHeader = typeof window !== 'undefined' ? localStorage.getItem('fatewise_token') : null;

      const response = await fetch('/api/bagua/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': `Bearer ${authHeader}` } : {}),
        },
        body: JSON.stringify({
          question: question || undefined,
          // Original hexagram
          hexagramName: result.hexagram.chinese,
          hexagramNumber: result.hexagram.number,
          hexagramDesc: result.hexagram.english,
          judgment: result.hexagram.judgment,
          image: result.hexagram.image,
          meaning: result.hexagram.meaning,
          keywords: result.hexagram.keywords,
          fiveElements: result.hexagram.fiveElements,
          direction: result.hexagram.direction,
          season: result.hexagram.season,
          // Trigrams
          upperTrigram: {
            name: result.upper.name, symbol: result.upper.symbol,
            element: result.upper.element, direction: result.upper.direction,
            nature: result.upper.nature, meaning: result.upper.meaning,
          },
          lowerTrigram: {
            name: result.lower.name, symbol: result.lower.symbol,
            element: result.lower.element, direction: result.lower.direction,
            nature: result.lower.nature, meaning: result.lower.meaning,
          },
          // Lines
          lineValues: result.lineValues,
          lineSymbols: result.lineSymbols,
          changingLines: result.changingLines.length > 0 ? result.changingLines : undefined,
          // Changed hexagram (变卦)
          changedHexagram: result.changedHexagram ? {
            name: result.changedHexagram.chinese,
            number: result.changedHexagram.number,
            desc: result.changedHexagram.english,
            judgment: result.changedHexagram.judgment,
            image: result.changedHexagram.image,
            meaning: result.changedHexagram.meaning,
            fiveElements: result.changedHexagram.fiveElements,
          } : undefined,
        }),
      });

      const data: InterpretResponse = await response.json();
      if (data.success) {
        // Use displayContent (sliced for free users) if available, fallback to full content
        setInterpretation(data.displayContent ?? data.content);
      } else {
        throw new Error((data as any).error || 'Interpretation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Interpretation failed');
    } finally {
      setInterpretLoading(false);
    }
  }, [result, question]);

  const handleReset = useCallback(() => {
    setResult(null);
    setInterpretation(null);
    setError(null);
    setQuestion('');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ─── Ambient Background ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.04) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* ─── Hero ─── */}
        <section className="pt-16 pb-12 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.12)' }}>
              <span className="text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--accent-primary)' }}>✦ I Ching Divination ✦</span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4" style={{ textShadow: '0 0 12px rgba(212,168,83,0.25)' }}>
              Bagua Divination
            </h1>
            <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Cast the eight trigrams and receive AI-powered I Ching interpretation
            </p>
          </div>
        </section>

        {/* ─── Bagua Diagram ─── */}
        <section className="px-4 pb-8">
          <div className="max-w-[340px] mx-auto">
            <div className="glass-card flex items-center justify-center py-8">
              <BaguaDiagram key={diagramKey} size={280} />
            </div>
          </div>
        </section>

        {/* ─── Question Input ─── */}
        <section className="px-4 pb-10">
          <div className="max-w-xl mx-auto">
            <div className="glass-card p-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your Question <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
              </label>
              <textarea
                className="w-full text-sm min-h-[80px] resize-y rounded-lg p-3 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(21,17,33,0.6)',
                  border: '1px solid rgba(212,168,83,0.2)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,168,83,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,168,83,0.08)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="e.g., What does the future hold for my career?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
              />

              {error && (
                <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="btn-glow btn-gold text-lg px-10 py-3.5"
                  onClick={handleDivination}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-light) 50%, var(--accent-dim) 100%)',
                    boxShadow: '0 0 20px rgba(212,168,83,0.25)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="inline-block animate-spin">☯</span>
                      Divining...
                    </span>
                  ) : (
                    '☯ Cast the Hexagram'
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Results ─── */}
        {result && (
          <section ref={resultRef} className="px-4 pb-24" style={{ animation: 'reveal 0.5s ease-out forwards' }}>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Hexagram Card */}
              <HexagramDisplayCard result={result} />

              {/* Changing Lines Display */}
              {result.changingLines.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(212,168,83,0.12)' }}>⏎</div>
                    <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--accent-primary)' }}>Changing Lines · 动爻</h3>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {result.changingLines.map(li => {
                      const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
                      const lineValues = result.lineValues;
                      const isYang = lineValues[li - 1] === 9;
                      const changeText = isYang ? '阳 → 阴' : '阴 → 阳';
                      return (
                        <div key={li} className="flex items-center gap-2">
                          <span className="text-[var(--text-tertiary)] w-10">{lineNames[li - 1]}</span>
                          <span className="text-[var(--accent-primary)]">{result.lineSymbols[li - 1]}</span>
                          <span className="text-[var(--text-secondary)]">{LINE_NAMES_FULL[lineValues[li - 1]]}</span>
                          <span className="text-[var(--text-tertiary)]">→</span>
                          <span className="text-[var(--text-secondary)]">{changeText}</span>
                        </div>
                      );
                    })}
                  </div>
                  {result.changedHexagram && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-1">Changed Hexagram · 变卦</div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>
                          {result.changedHexagram.chinese}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">{result.changedHexagram.english}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Interpretation */}
              <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(124,58,237,0.12)' }}>🤖</div>
                  <h2 className="font-display font-bold text-base" style={{ color: 'var(--accent-primary)' }}>AI I Ching Reading</h2>
                </div>

                {interpretation ? (
                  <div className="bazi-interpretation">
                    {renderMarkdown(interpretation)}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    {!isPro && (
                      <div className="mb-4 p-3 rounded-lg border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.06)]">
                        <Link
                          href="/pricing"
                          className="text-sm text-[var(--accent-primary)] font-medium hover:text-[var(--accent-light)] transition-colors inline-flex items-center gap-1">
                          ✨ Upgrade to Pro for unlimited AI interpretations — $9.99/mo <span className="text-[var(--accent-primary)]">→</span>
                        </Link>
                      </div>
                    )}
                    <p className="text-sm mb-5" style={{ color: 'var(--text-tertiary)' }}>
                      Generate an AI-powered interpretation of your hexagram
                    </p>
                    <button
                      type="button"
                      className="btn-gold text-sm px-8 py-2.5"
                      onClick={handleInterpret}
                      disabled={interpretLoading}
                    >
                      {interpretLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block animate-spin">☯</span>
                          Interpreting...
                        </span>
                      ) : (
                        '📖 Generate Interpretation'
                      )}
                    </button>
                  </div>
                )}

                <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)' }} />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    className="btn-purple-ghost text-sm"
                    onClick={handleDivination}
                  >
                    🔄 Cast Again
                  </button>
                  <button
                    type="button"
                    className="btn-purple-ghost text-sm"
                    onClick={handleReset}
                  >
                    ↩ Back
                  </button>
                </div>
              </div>

              {/* Upgrade Prompt */}
              <div className="glass-card p-5 rounded-2xl relative overflow-hidden" style={{ borderColor: 'rgba(212,168,83,0.1)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.03) 0%, transparent 60%)' }} />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(212,168,83,0.1)' }}>
                    👑
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--accent-primary)' }}>
                      Unlock Full I Ching Analysis
                    </h3>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Get detailed hexagram meanings, changing lines analysis, career/relationship guidance,
                      and personalized feng shui recommendations.
                    </p>
                    <Link href="/pricing" className="btn-gold text-sm px-5 py-2 inline-flex items-center gap-2">
                      <span>🚀 Upgrade to Pro</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                ⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Loading overlay */}
      {loading && <LoadingOverlay />}
    </div>
  );
}
