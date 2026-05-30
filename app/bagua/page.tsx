'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BAGUA, type BaguaItem, getHexagram, randomTrigramIndex } from '@/bazi/bagua';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BaguaResult {
  upper: BaguaItem;
  lower: BaguaItem;
  hexagram: { name: string; description: string };
  upperLines: number[];
  lowerLines: number[];
}

interface InterpretResponse {
  success: boolean;
  content: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIGRAM_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  '乾': { text: 'text-gold-primary', bg: 'bg-gold-primary/10', glow: 'shadow-gold-primary/20' },
  '兑': { text: 'text-cinnabar-red', bg: 'bg-cinnabar-red/10', glow: 'shadow-cinnabar-red/20' },
  '离': { text: 'text-fire', bg: 'bg-fire/10', glow: 'shadow-fire/20' },
  '震': { text: 'text-wood', bg: 'bg-wood/10', glow: 'shadow-wood/20' },
  '巽': { text: 'text-wood', bg: 'bg-wood/10', glow: 'shadow-wood/20' },
  '坎': { text: 'text-water', bg: 'bg-water/10', glow: 'shadow-water/20' },
  '艮': { text: 'text-earth', bg: 'bg-earth/10', glow: 'shadow-earth/20' },
  '坤': { text: 'text-earth', bg: 'bg-earth/10', glow: 'shadow-earth/20' },
};

// ─── Simple Markdown Renderer ────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
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

    if (!trimmed) { flushList(); nodes.push(<div key={key++} className="h-3" />); continue; }
    if (trimmed.startsWith('### ')) { flushList(); nodes.push(<h3 key={key++} className="font-display text-lg font-semibold text-gold-primary mt-6 mb-3">{trimmed.slice(4)}</h3>); continue; }
    if (trimmed.startsWith('## ')) { flushList(); nodes.push(<h2 key={key++} className="font-display text-xl font-bold text-gold-light mt-8 mb-4 gold-divider pb-2">{trimmed.slice(3)}</h2>); continue; }
    if (trimmed.startsWith('# ')) { flushList(); nodes.push(<h1 key={key++} className="font-display text-2xl font-bold text-gold-primary mt-8 mb-4">{trimmed.slice(2)}</h1>); continue; }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      if (!pendingList) pendingList = [];
      pendingList.push(<li key={key++} className="flex items-start gap-2 text-text-primary text-sm leading-relaxed"><span className="text-gold-primary mt-1 flex-shrink-0">✦</span><span>{renderInline(text)}</span></li>);
      continue;
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) { flushList(); nodes.push(<p key={key++} className="text-text-primary font-semibold text-sm leading-relaxed">{renderInline(trimmed)}</p>); continue; }
    if (trimmed.startsWith('> ')) { flushList(); nodes.push(<blockquote key={key++} className="border-l-2 border-gold-primary/40 pl-4 text-text-secondary text-sm italic my-2 leading-relaxed">{renderInline(trimmed.slice(2))}</blockquote>); continue; }
    if (trimmed.startsWith('⚠️')) { flushList(); nodes.push(<div key={key++} className="flex items-start gap-2 text-text-tertiary text-xs mt-4 p-3 rounded-lg bg-white/5"><span>⚠️</span><span>{trimmed.replace(/^⚠️\s*/, '')}</span></div>); continue; }
    flushList();
    nodes.push(<p key={key++} className="text-text-primary text-sm leading-relaxed mb-2">{renderInline(trimmed)}</p>);
  }
  flushList();
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gold-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Trigram Line Visual ─────────────────────────────────────────────────────

function TrigramLines({ lines, size = 48 }: { lines: number[]; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`rounded-sm ${line === 6 ? 'bg-gold-primary' : 'flex gap-2 justify-center'}`}
          style={{
            width: size,
            height: 4,
            background: line === 6 ? undefined : 'transparent',
          }}>
          {line === 5 && (
            <>
              <div className="flex-1 bg-gold-primary rounded-sm" />
              <div className="flex-1 bg-gold-primary rounded-sm" />
            </>
          )}
          {line === 6 && <div className="w-full h-full bg-gold-primary rounded-sm" />}
        </div>
      ))}
    </div>
  );
}

// ─── Hexagram Visual ─────────────────────────────────────────────────────────

function HexagramVisual({ upper, lower }: { upper: BaguaItem; lower: BaguaItem }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Upper trigram */}
      <div className="flex items-center gap-3">
        <TrigramLines lines={upper.lines} size={56} />
        <div className="text-center">
          <div className={`text-2xl font-display font-bold ${TRIGRAM_COLORS[upper.name]?.text || 'text-gold-primary'}`}>
            {upper.symbol}
          </div>
          <div className="text-xs text-text-tertiary">{upper.name}</div>
        </div>
      </div>
      {/* Lower trigram */}
      <div className="flex items-center gap-3">
        <TrigramLines lines={lower.lines} size={56} />
        <div className="text-center">
          <div className={`text-2xl font-display font-bold ${TRIGRAM_COLORS[lower.name]?.text || 'text-gold-primary'}`}>
            {lower.symbol}
          </div>
          <div className="text-xs text-text-tertiary">{lower.name}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading Overlay ─────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl mb-4 taiji-loader">☯</div>
        <div className="text-gold-primary font-display text-lg mb-2">Divining the hexagram...</div>
        <div className="text-text-tertiary text-sm">Reading the eight trigrams</div>
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
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleDivination = useCallback(async () => {
    setError(null);
    setResult(null);
    setInterpretation(null);
    setLoading(true);

    try {
      // Generate two random trigrams (upper + lower)
      const upperIdx = randomTrigramIndex();
      const lowerIdx = randomTrigramIndex();
      const upper = BAGUA[upperIdx];
      const lower = BAGUA[lowerIdx];
      const hexagram = getHexagram(upper, lower);

      setResult({ upper, lower, hexagram, upperLines: upper.lines, lowerLines: lower.lines });

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
          upperTrigram: { name: result.upper.name, symbol: result.upper.symbol, element: result.upper.element, direction: result.upper.direction, nature: result.upper.nature },
          lowerTrigram: { name: result.lower.name, symbol: result.lower.symbol, element: result.lower.element, direction: result.lower.direction, nature: result.lower.nature },
          hexagramName: result.hexagram.name,
          hexagramDesc: result.hexagram.description,
        }),
      });

      const data: InterpretResponse = await response.json();
      if (data.success) {
        setInterpretation(data.content);
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
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-40" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-12">
          <div className="mb-4">
            <span className="text-gold-primary text-sm font-display tracking-widest">✦ I Ching Divination ✦</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 text-gold-glow">
            Bagua Divination
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            Cast the eight trigrams and receive AI-powered I Ching interpretation
          </p>
        </div>
      </section>

      {/* ─── Question Input ─── */}
      <section className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-6 md:p-8">
            <label className="block text-sm text-text-secondary mb-2">
              What would you like to ask? <span className="text-text-tertiary text-xs">(optional)</span>
            </label>
            <textarea
              className="input-field w-full text-sm min-h-[80px] resize-y"
              placeholder="e.g., What does the future hold for my career?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                className="btn-primary glow-pulse text-lg px-12 py-4"
                onClick={handleDivination}
                disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="taiji-loader inline-block">☯</span>
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
        <section ref={resultRef} className="px-6 pb-24 page-enter">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hexagram Display */}
            <div className="glass-card p-6 md:p-8 text-center">
              <h2 className="font-display text-xl font-bold text-gold-primary mb-6">
                Your Hexagram · 卦象
              </h2>
              <div className="flex justify-center mb-6">
                <HexagramVisual upper={result.upper} lower={result.lower} />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-gold-primary">{result.hexagram.name}</span>
              </div>
              <p className="text-text-secondary text-sm max-w-lg mx-auto">{result.hexagram.description}</p>

              {/* Trigram details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Upper */}
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3">Upper Trigram (上卦)</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${TRIGRAM_COLORS[result.upper.name]?.text || ''}`}>{result.upper.symbol}</div>
                    <div className="text-sm space-y-1">
                      <div className="text-text-primary font-semibold">{result.upper.name}</div>
                      <div className="text-text-secondary">Element: <span className={TRIGRAM_COLORS[result.upper.element]?.text || ''}>{result.upper.element}</span></div>
                      <div className="text-text-secondary">Nature: {result.upper.nature}</div>
                      <div className="text-text-secondary">Direction: {result.upper.direction}</div>
                    </div>
                  </div>
                </div>
                {/* Lower */}
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3">Lower Trigram (下卦)</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${TRIGRAM_COLORS[result.lower.name]?.text || ''}`}>{result.lower.symbol}</div>
                    <div className="text-sm space-y-1">
                      <div className="text-text-primary font-semibold">{result.lower.name}</div>
                      <div className="text-text-secondary">Element: <span className={TRIGRAM_COLORS[result.lower.element]?.text || ''}>{result.lower.element}</span></div>
                      <div className="text-text-secondary">Nature: {result.lower.nature}</div>
                      <div className="text-text-secondary">Direction: {result.lower.direction}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interpretation */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-gold-primary">🤖 AI I Ching Reading (AI 易经解读)</h2>
              </div>

              {interpretation ? (
                <div className="bazi-interpretation">
                  {renderMarkdown(interpretation)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-tertiary text-sm mb-4">
                    Generate an AI-powered interpretation of your hexagram
                  </p>
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={handleInterpret}
                    disabled={interpretLoading}>
                    {interpretLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="taiji-loader inline-block">☯</span>
                        Interpreting...
                      </span>
                    ) : (
                      '📖 Generate Interpretation (生成解读)'
                    )}
                  </button>
                </div>
              )}

              <div className="gold-divider my-6" />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  type="button"
                  className="glass text-sm px-6 py-3 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                  onClick={handleDivination}>
                  🔄 Cast Again (重新起卦)
                </button>
                <button
                  type="button"
                  className="glass text-sm px-6 py-3 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                  onClick={handleReset}>
                  ↩ Back (返回)
                </button>
              </div>
            </div>

            {/* Upgrade Prompt */}
            <div className="glass-card p-5 rounded-2xl border border-gold-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/[0.03] to-transparent pointer-events-none" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-primary/10 flex items-center justify-center text-2xl">
                  👑
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-gold-primary text-base mb-1">
                    Unlock Full I Ching Analysis
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">
                    Get detailed hexagram meanings, changing lines analysis, career/relationship guidance,
                    and personalized feng shui recommendations.
                  </p>
                  <Link href="/pricing" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                    <span>🚀 Upgrade to Pro</span>
                  </Link>
                </div>
              </div>
            </div>

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
