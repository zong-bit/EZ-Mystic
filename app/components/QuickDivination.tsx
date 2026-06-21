'use client';

import { useState, useCallback, useRef } from 'react';
import { BAGUA, type BaguaItem, getHexagram, randomTrigramIndex } from '@/bazi/bagua';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuickDivinationResult {
  upper: BaguaItem;
  lower: BaguaItem;
  hexagram: { name: string; description: string };
  upperLines: number[];
  lowerLines: number[];
}

// ─── Trigram Line Visual ─────────────────────────────────────────────────────

function TrigramLines({ lines, size = 40 }: { lines: number[]; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {lines.map((line, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            width: size,
            height: 4,
          }}>
          {line === 6 && <div className="w-full h-full bg-gold-primary rounded-sm" />}
          {line === 5 && (
            <>
              <div className="flex-1 bg-gold-primary rounded-sm" />
              <div className="flex-1 bg-gold-primary rounded-sm" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Mini Hexagram Visual ────────────────────────────────────────────────────

function MiniHexagramVisual({ upper, lower }: { upper: BaguaItem; lower: BaguaItem }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Upper trigram */}
      <div className="flex items-center gap-2">
        <TrigramLines lines={upper.lines} size={44} />
        <span className={`text-xl font-display font-bold ${upper.name === '乾' ? 'text-gold-primary' : upper.name === '兑' ? 'text-cinnabar-red' : upper.name === '离' ? 'text-fire' : upper.name === '震' || upper.name === '巽' ? 'text-wood' : upper.name === '坎' ? 'text-water' : 'text-earth'}`}>
          {upper.symbol}
        </span>
      </div>
      {/* Lower trigram */}
      <div className="flex items-center gap-2">
        <TrigramLines lines={lower.lines} size={44} />
        <span className={`text-xl font-display font-bold ${lower.name === '乾' ? 'text-gold-primary' : lower.name === '兑' ? 'text-cinnabar-red' : lower.name === '离' ? 'text-fire' : lower.name === '震' || lower.name === '巽' ? 'text-wood' : lower.name === '坎' ? 'text-water' : 'text-earth'}`}>
          {lower.symbol}
        </span>
      </div>
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function MiniLoader() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <span className="text-4xl taiji-loader">☯</span>
      <span className="text-gold-primary text-sm font-medium">Divining...</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function QuickDivination() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickDivinationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleDivination = useCallback(async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const upperIdx = randomTrigramIndex();
      const lowerIdx = randomTrigramIndex();
      const upper = BAGUA[upperIdx];
      const lower = BAGUA[lowerIdx];
      const hexagram = getHexagram(upper, lower);

      setResult({ upper, lower, hexagram, upperLines: upper.lines, lowerLines: lower.lines });

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } catch (err: any) {
      setError(err.message || 'Divination failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setQuestion('');
  }, []);

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
            QUICK DIVINATION
          </span>
          <span className="block" style={{ width: 24, height: 1, backgroundColor: 'var(--color-primary)' }} />
        </div>

        <h2
          className="font-display font-bold mb-3 text-center"
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
          }}
        >
          Cast a Hexagram
          <br />
          <span style={{ color: 'var(--color-primary)' }}>Right Here</span>
        </h2>
        <p className="text-center text-text-secondary mb-10 max-w-md mx-auto text-sm leading-relaxed">
          Ask a question, cast the I Ching, and receive instant guidance from the ancient wisdom of the Eight Trigrams.
        </p>

        {/* Input Card */}
        <div className="glass-card p-6 md:p-8">
          <label className="block text-sm text-text-secondary mb-2">
            Your Question <span className="text-text-tertiary text-xs">(optional)</span>
          </label>
          <textarea
            className="input-field w-full text-sm min-h-[72px] resize-y"
            placeholder="e.g., What should I know about my career path?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-cinnabar-red/10 border border-cinnabar-red/20 text-cinnabar-red text-sm">
              {error}
            </div>
          )}

          <div className="mt-5 text-center">
            <button
              type="button"
              className="btn-primary glow-pulse text-base px-10 py-3.5"
              onClick={handleDivination}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="taiji-loader inline-block">☯</span>
                  Divining...
                </span>
              ) : (
                '☯ Cast Hexagram'
              )}
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div ref={resultRef} className="mt-8 glass-card p-6 md:p-8 text-center page-enter">
            <div className="text-xs text-text-tertiary uppercase tracking-wider mb-4">Your Hexagram · 卦象</div>

            <div className="flex justify-center mb-4">
              <MiniHexagramVisual upper={result.upper} lower={result.lower} />
            </div>

            <div className="mb-2">
              <span className="text-2xl font-display font-bold text-gold-primary">{result.hexagram.name}</span>
            </div>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
              {result.hexagram.description}
            </p>

            {/* Trigram info */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="glass p-3 rounded-xl">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Upper · 上卦</div>
                <div className="text-gold-primary font-semibold text-sm">{result.upper.name} ({result.upper.symbol})</div>
                <div className="text-text-secondary text-xs mt-0.5">{result.upper.element} · {result.upper.nature}</div>
              </div>
              <div className="glass p-3 rounded-xl">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Lower · 下卦</div>
                <div className="text-gold-primary font-semibold text-sm">{result.lower.name} ({result.lower.symbol})</div>
                <div className="text-text-secondary text-xs mt-0.5">{result.lower.element} · {result.lower.nature}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                className="glass text-sm px-5 py-2.5 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                onClick={handleDivination}
              >
                🔄 Cast Again
              </button>
              <button
                type="button"
                className="glass text-sm px-5 py-2.5 rounded-xl text-text-secondary hover:text-text-primary border border-white/10 hover:border-gold-primary/30 transition-all duration-300"
                onClick={handleReset}
              >
                ↩ Reset
              </button>
            </div>

            {/* CTA to full bagua page */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <p className="text-text-tertiary text-xs mb-3">Want a deep AI interpretation?</p>
              <a
                href="/bagua"
                className="inline-flex items-center gap-1 text-sm font-medium text-gold-primary hover:text-gold-primary-hover transition-colors"
              >
                Go to Bagua Divination →
              </a>
            </div>
          </div>
        )}

        {/* Loading overlay — inline */}
        {loading && <MiniLoader />}
      </div>
    </section>
  );
}
