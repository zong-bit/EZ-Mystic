'use client';
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BAGUA, type BaguaItem, getHexagramById, getHexagramByLines, getHexagramSymbol, randomTrigramIndex } from '@/bazi/bagua';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BaguaResult {
  upper: BaguaItem;
  lower: BaguaItem;
  hexagram: { chinese: string; english: string; pinyin: string; judgment: string; image: string; meaning: string; keywords: string[]; number: number };
  upperLines: number[];
  lowerLines: number[];
}
type DivinationMode = 'coin' | 'three-coin' | 'number';
interface CoinState { tosses: number[]; lines: number[]; step: number; }

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

// ─── Line Value → Symbol
function getLineSymbol(value: number): string {
  switch (value) {
    case 6: return '⚋o';
    case 7: return '⚊';
    case 8: return '⚋';
    case 9: return '⚌o';
    default: return '?';
  }
}

// ─── Hexagram Lines Visual (6 lines, top-to-bottom)
function HexagramLinesVisual({ lines }: { lines: number[] }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {lines.map((lineVal, i) => {
        const isYang = lineVal === 7 || lineVal === 9;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted w-5 text-right">{['上','五','四','三','二','初'][i]}</span>
            {isYang ? (
              <div className="h-2.5 rounded-sm bg-gold-primary" style={{ width: 100 }} />
            ) : (
              <div className="flex gap-2 justify-center" style={{ width: 100 }}>
                <div className="flex-1 h-2.5 rounded-sm bg-gold-primary" />
                <div className="flex-1 h-2.5 rounded-sm bg-gold-primary" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Loading Overlay ─────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-6xl mb-4 taiji-loader">☯</div>
        <div className="text-gold-primary font-display text-lg mb-2">起卦中...</div>
        <div className="text-text-tertiary text-sm">八卦推演</div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BaguaPage() {
  const [mode, setMode] = useState<DivinationMode>('coin');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaguaResult | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [coinState, setCoinState] = useState<CoinState>({ tosses: [], lines: [], step: 0 });
  const [numA, setNumA] = useState('');
  const [numB, setNumB] = useState('');

  const handleCoinToss = useCallback(() => {
    setError(null);
    if (coinState.step >= 6) return;
    const c1 = Math.random() < 0.5 ? 3 : 2;
    const c2 = Math.random() < 0.5 ? 3 : 2;
    const c3 = Math.random() < 0.5 ? 3 : 2;
    const sum = c1 + c2 + c3;
    const newLines = [...coinState.lines, sum];
    if (coinState.step === 5) {
      const hexagram = getHexagramByLines(newLines);
      if (!hexagram) { setError('卦象未找到'); setLoading(false); return; }
      const upperLines = newLines.slice(0, 3);
      const lowerLines = newLines.slice(3);
      const upper = BAGUA.find(b => b.lines[0] === upperLines[0] && b.lines[1] === upperLines[1] && b.lines[2] === upperLines[2]) || BAGUA[0];
      const lower = BAGUA.find(b => b.lines[0] === lowerLines[0] && b.lines[1] === lowerLines[1] && b.lines[2] === lowerLines[2]) || BAGUA[0];
      setResult({ upper, lower, hexagram, upperLines, lowerLines });
    }
    setCoinState({ tosses: [...coinState.tosses, sum], lines: newLines, step: coinState.step + 1 });
    setLoading(false);
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }, [coinState]);

  const handleThreeCoinToss = useCallback(() => {
    setError(null);
    if (coinState.step >= 6) return;
    const c1 = Math.random() < 0.5 ? 3 : 2;
    const c2 = Math.random() < 0.5 ? 3 : 2;
    const c3 = Math.random() < 0.5 ? 3 : 2;
    const sum = c1 + c2 + c3;
    const newLines = [...coinState.lines, sum];
    if (coinState.step === 5) {
      const hexagram = getHexagramByLines(newLines);
      if (!hexagram) { setError('卦象未找到'); setLoading(false); return; }
      const upperLines = newLines.slice(0, 3);
      const lowerLines = newLines.slice(3);
      const upper = BAGUA.find(b => b.lines[0] === upperLines[0] && b.lines[1] === upperLines[1] && b.lines[2] === upperLines[2]) || BAGUA[0];
      const lower = BAGUA.find(b => b.lines[0] === lowerLines[0] && b.lines[1] === lowerLines[1] && b.lines[2] === lowerLines[2]) || BAGUA[0];
      setResult({ upper, lower, hexagram, upperLines, lowerLines });
    }
    setCoinState({ tosses: [...coinState.tosses, sum], lines: newLines, step: coinState.step + 1 });
    setLoading(false);
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }, [coinState]);

  const handleNumberDivination = useCallback(() => {
    setError(null);
    setLoading(true);
    try {
      const n1 = parseInt(numA) || Math.floor(Math.random() * 999) + 1;
      const n2 = parseInt(numB) || Math.floor(Math.random() * 999) + 1;
      const upperIdx = ((n1 - 1) % 8 + 8) % 8;
      const lowerIdx = ((n2 - 1) % 8 + 8) % 8;
      const upper = BAGUA[upperIdx];
      const lower = BAGUA[lowerIdx];
      const upperLines = [...upper.lines];
      const lowerLines = [...lower.lines];
      const hexagram = getHexagramByLines([...upper.lines, ...lower.lines]) || null;
      if (!hexagram) { setError('卦象未找到'); setLoading(false); return; }
      setResult({ upper, lower, hexagram, upperLines, lowerLines });
    } catch (err: any) { setError(err.message || '起卦失败'); }
    finally {
      setLoading(false);
      setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
    }
  }, [numA, numB]);

  const handleDivination = useCallback(() => {
    if (mode === 'number') { handleNumberDivination(); return; }
    if (coinState.step < 6) { handleCoinToss(); return; }
    setLoading(false);
    setTimeout(() => { resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
  }, [mode, coinState.step, handleCoinToss, handleNumberDivination]);

  const handleInterpret = useCallback(async () => {
    if (!result) return;
    setInterpretLoading(true);
    try {
      const authHeader = typeof window !== 'undefined' ? localStorage.getItem('fatewise_token') : null;

      // Derive line values from coin toss if available
      const lineValues = coinState.lines.length === 6 ? coinState.lines : undefined;
      const lineSymbols = lineValues?.map(v => ({ 6: '⚋⏎', 7: '⚊', 8: '⚋', 9: '⚊⏎' }[v] || '?'));
      const changingLines = lineValues?.filter((v, i) => (v === 6 || v === 9) ? i + 1 : 0).filter(Boolean) as number[] | undefined;

      // Build changed hexagram if there are changing lines
      let changedHexagram: typeof result.hexagram | undefined;
      if (changingLines && changingLines.length > 0 && lineValues) {
        const changedValues = lineValues.map(v => v === 6 ? 7 : v === 9 ? 8 : v);
        const changedHex = getHexagramByLines(changedValues);
        if (changedHex) {
          changedHexagram = {
            chinese: changedHex.chinese,
            english: changedHex.english,
            pinyin: changedHex.pinyin,
            judgment: changedHex.judgment,
            image: changedHex.image,
            meaning: changedHex.meaning,
            keywords: changedHex.keywords,
            number: changedHex.number,
          };
        }
      }

      const response = await fetch('/api/bagua/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': `Bearer ${authHeader}` } : {}),
        },
        body: JSON.stringify({
          question: question || undefined,
          hexagramName: result.hexagram.chinese,
          hexagramNumber: result.hexagram.number,
          hexagramDesc: result.hexagram.english,
          judgment: result.hexagram.judgment,
          image: result.hexagram.image,
          meaning: result.hexagram.meaning,
          keywords: result.hexagram.keywords,
          fiveElements: (result.hexagram as any).fiveElements,
          direction: (result.hexagram as any).direction,
          season: (result.hexagram as any).season,
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
          lineValues,
          lineSymbols,
          changingLines: changingLines?.length ? changingLines : undefined,
          changedHexagram: changedHexagram ? {
            name: changedHexagram.chinese,
            number: changedHexagram.number,
            desc: changedHexagram.english,
            judgment: changedHexagram.judgment,
            image: changedHexagram.image,
            meaning: changedHexagram.meaning,
            fiveElements: (changedHexagram as any).fiveElements,
          } : undefined,
        }),
      });

      const data: InterpretResponse = await response.json();
      if (data.success) {
        setInterpretation(data.content);
      } else {
        throw new Error((data as any).error || '解读失败');
      }
    } catch (err: any) {
      setError(err.message || '解读失败');
    } finally {
      setInterpretLoading(false);
    }
  }, [result, question, coinState]);

  const handleReset = useCallback(() => {
    setResult(null);
    setInterpretation(null);
    setError(null);
    setQuestion('');
    setCoinState({ tosses: [], lines: [], step: 0 });
    setNumA('');
    setNumB('');
  }, []);

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

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-40" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-star-dust/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-12">
          <div className="mb-4">
            <span className="text-gold-primary text-sm font-display tracking-widest">✦ 易经八卦 · 起卦占卜 ✦</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 text-gold-glow">
            八卦起卦
          </h1>
          <p className="text-text-secondary text-base max-w-lg mx-auto">
            起卦八卦，AI 易经解读，为您揭示命运的卦象密码
          </p>
        </div>
      </section>

      {/* ─── Mode Tabs ─── */}
      <section className="px-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-1 p-1 glass rounded-xl">
            {([
              { key: 'coin' as DivinationMode, label: '🪙 投硬币', sub: 'Coin Toss' },
              { key: 'three-coin' as DivinationMode, label: '🥡 掷铜钱', sub: 'Three Coins' },
              { key: 'number' as DivinationMode, label: '🔢 数字起卦', sub: 'Numbers' },
            ]).map(m => (
              <button
                key={m.key}
                type="button"
                className={`flex-1 py-2.5 px-3 rounded-lg text-center transition-all duration-300 ${
                  mode === m.key
                    ? 'bg-gold-primary/20 text-gold-primary font-semibold shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
                }`}
                onClick={() => { setMode(m.key); handleReset(); }}>
                <div className="text-sm">{m.label}</div>
                <div className="text-[10px] opacity-60">{m.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divination Area ─── */}
      <section className="px-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-6 md:p-8">
            <label className="block text-sm text-text-secondary mb-2">
              您的疑问 <span className="text-text-tertiary text-xs">（可选）</span>
            </label>
            <textarea
              className="input-field w-full text-sm min-h-[80px] resize-y"
              placeholder="例如：我的事业未来会有怎样的发展？"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />

            {mode !== 'number' && coinState.step < 6 && (
              <div className="mt-5">
                <div className="text-xs text-text-tertiary mb-3 text-center">第 {coinState.step + 1} 爻 / 共 6 爻 · 点击按钮起爻</div>
                <div className="flex justify-center gap-4">
                  {coinState.lines.map((lineVal, i) => {
                    const lineType = getLineSymbol(lineVal);
                    return (
                      <div key={i} className="text-center">
                        <div className="text-xs text-text-tertiary mb-1">{['初','二','三','四','五','上'][i]}</div>
                        <div className={`text-2xl font-display ${lineVal === 6 || lineVal === 9 ? 'text-cinnabar-red' : 'text-gold-primary'}`}>{lineType}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'number' && (
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">第一个数字（上卦）</label>
                  <input type="number" className="input-field w-full text-center text-lg font-display" placeholder="任意数字" value={numA} onChange={e => setNumA(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">第二个数字（下卦）</label>
                  <input type="number" className="input-field w-full text-center text-lg font-display" placeholder="任意数字" value={numB} onChange={e => setNumB(e.target.value)} />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                className={`btn-primary glow-pulse text-lg px-12 py-4 ${coinState.step < 6 && mode !== 'number' ? '' : 'text-base px-8'}`}
                onClick={handleDivination}
                disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="taiji-loader inline-block">☯</span>
                    起卦中...
                  </span>
                ) : coinState.step < 6 && mode !== 'number' ? (
                  `起第 ${coinState.step + 1} 爻 (${['初','二','三','四','五','上'][coinState.step]}爻)`
                ) : mode === 'number' && !numA && !numB ? (
                  '🎲 随机起卦'
                ) : (
                  '☯ 起卦'
                )}
              </button>

              {coinState.step > 0 && coinState.step < 6 && (
                <button type="button" className="block mx-auto mt-3 text-xs text-text-muted hover:text-text-secondary transition-colors" onClick={handleReset}>
                  取消重起
                </button>
              )}
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
                您的卦象
              </h2>
              <div className="text-8xl mb-2">{getHexagramSymbol({ id: result.hexagram.number, number: result.hexagram.number } as any)}</div>
              <HexagramLinesVisual lines={[...result.upper.lines, ...result.lower.lines]} />
              <div className="flex justify-center mb-6">
                <HexagramVisual upper={result.upper} lower={result.lower} />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-display font-bold text-gold-primary">{result.hexagram.chinese}</span>
                <span className="text-text-tertiary text-sm ml-3">({result.hexagram.pinyin})</span>
              </div>
              <p className="text-text-secondary text-sm max-w-lg mx-auto">{result.hexagram.english}</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {result.hexagram.keywords.map(k => (
                  <span key={k} className="text-xs px-2 py-1 rounded-full bg-gold-primary/10 text-gold-primary">{k}</span>
                ))}
              </div>

              {/* Trigram details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Upper */}
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3">上卦</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${TRIGRAM_COLORS[result.upper.name]?.text || ''}`}>{result.upper.symbol}</div>
                    <div className="text-sm space-y-1">
                      <div className="text-text-primary font-semibold">{result.upper.name}</div>
                      <div className="text-text-secondary">五行：<span className={TRIGRAM_COLORS[result.upper.element]?.text || ''}>{result.upper.element}</span></div>
                      <div className="text-text-secondary">卦性：{result.upper.nature}</div>
                      <div className="text-text-secondary">方位：{result.upper.direction}</div>
                    </div>
                  </div>
                </div>
                {/* Lower */}
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3">下卦</div>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${TRIGRAM_COLORS[result.lower.name]?.text || ''}`}>{result.lower.symbol}</div>
                    <div className="text-sm space-y-1">
                      <div className="text-text-primary font-semibold">{result.lower.name}</div>
                      <div className="text-text-secondary">五行：<span className={TRIGRAM_COLORS[result.lower.element]?.text || ''}>{result.lower.element}</span></div>
                      <div className="text-text-secondary">卦性：{result.lower.nature}</div>
                      <div className="text-text-secondary">方位：{result.lower.direction}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interpretation */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-gold-primary">🤖 AI 易经解读</h2>
              </div>

              {interpretation ? (
                <div className="bazi-interpretation">
                  {renderMarkdown(interpretation)}
                </div>
              ) : (
                <div className="text-center py-8">
                  {!isPro && (
                    <div className="mb-5 p-3 rounded-lg border border-[#c9a84c]/30 bg-gradient-to-r from-[#c9a84c]/[0.06] to-transparent">
                      <Link
                        href="/pricing"
                        className="text-sm text-gold-primary font-medium hover:text-gold-primary-hover transition-colors inline-flex items-center gap-1">
                        ✨ 升级到 Pro 享受无限 AI 解读 — $9.99/月 <span className="text-gold-primary">→</span>
                      </Link>
                    </div>
                  )}
                  <p className="text-text-tertiary text-sm mb-4">
                    生成 AI 卦象解读，为您揭示命运启示
                  </p>
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={handleInterpret}
                    disabled={interpretLoading}>
                    {interpretLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="taiji-loader inline-block">☯</span>
                        解读中...
                      </span>
                    ) : (
                      '📖 生成解读'
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
                  🔄 重新起卦
                </button>
                <button
                  type="button"
                  className="glass text-sm px-6 py-3 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                  onClick={handleReset}>
                  ↩ 返回
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
                    解锁完整易经分析
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">
                    获取详细的卦象含义、变爻分析、事业/感情指导，以及个性化风水建议。
                  </p>
                  <Link href="/pricing" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                    <span>🚀 升级到 Pro</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-text-muted text-xs">
              ⚠️ 此解读由 AI 生成，仅供娱乐参考，不作为人生决策依据。
            </p>
          </div>
        </section>
      )}

      {/* Loading overlay */}
      {loading && <LoadingOverlay />}
    </div>
  );
}
