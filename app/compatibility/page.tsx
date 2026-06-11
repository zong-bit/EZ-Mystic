'use client';

import { useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PersonInput {
  name: string;
  year: number | '';
  month: number | '';
  day: number | '';
  hour: number | '';
  minute: number | '';
  gender: 'male' | 'female';
}

interface CompatibilityResponse {
  success: true;
  overallScore: number;
  dimensions: { name: string; nameEn: string; score: number; weight: number }[];
  summary: string;
  details: { dimension: string; score: number; maxScore: number; description: string; advice: string }[];
  person1DayMaster?: string;
  person2DayMaster?: string;
}

interface ErrorData {
  error: string;
  details?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-wood',
  '火': 'text-fire',
  '土': 'text-earth',
  '金': 'text-metal',
  '水': 'text-water',
};

const ELEMENT_BG: Record<string, string> = {
  '木': 'bg-wood/10 border-wood/20',
  '火': 'bg-fire/10 border-fire/20',
  '土': 'bg-earth/10 border-earth/20',
  '金': 'bg-metal/10 border-metal/20',
  '水': 'bg-water/10 border-water/20',
};

const SCORE_LABELS: Record<number, { cn: string; en: string }> = {
  90: { cn: '天作之合', en: 'Heavenly Match' },
  80: { cn: '良缘佳配', en: 'Excellent Match' },
  70: { cn: '姻缘深厚', en: 'Deep Bond' },
  60: { cn: '缘分不错', en: 'Good Potential' },
  50: { cn: '中性匹配', en: 'Moderate Match' },
  40: { cn: '需多磨合', en: 'Needs Work' },
  30: { cn: '缘分较浅', en: 'Light Connection' },
  20: { cn: '冲突较多', en: 'Many Challenges' },
};

function getScoreLabel(score: number): { cn: string; en: string } {
  const thresholds = [90, 80, 70, 60, 50, 40, 30, 20];
  for (const t of thresholds) {
    if (score >= t) return SCORE_LABELS[t] || SCORE_LABELS[20];
  }
  return { cn: '缘分薄弱', en: 'Weak Connection' };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-gold-primary';
  if (score >= 70) return 'text-yi-green';
  if (score >= 60) return 'text-text-primary';
  if (score >= 50) return 'text-earth-brown';
  return 'text-cinnabar-red/80';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-gold-primary/10 border-gold-primary/30';
  if (score >= 70) return 'bg-yi-green/10 border-yi-green/25';
  if (score >= 60) return 'bg-white/5 border-white/10';
  if (score >= 50) return 'bg-earth-brown/10 border-earth-brown/20';
  return 'bg-cinnabar-red/5 border-cinnabar-red/15';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-gold-primary';
  if (score >= 70) return 'bg-yi-green';
  if (score >= 60) return 'bg-text-primary';
  if (score >= 50) return 'bg-earth-brown';
  return 'bg-cinnabar-red/70';
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function BirthForm({
  person,
  index,
  onChange,
}: {
  person: PersonInput;
  index: number;
  onChange: (p: PersonInput) => void;
}) {
  const label = index === 0 ? 'Person A' : 'Person B';
  const genderIcon = person.gender === 'male' ? '♂' : '♀';
  const genderLabel = person.gender === 'male' ? '男 Male' : '女 Female';

  const update = (field: keyof PersonInput, value: string | number) => {
    onChange({ ...person, [field]: value });
  };

  return (
    <div className={`glass-card p-5 md:p-6 border-t-2 ${index === 0 ? 'border-gold-primary/40' : 'border-yi-green/30'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className={`font-display font-bold text-lg ${index === 0 ? 'text-gold-primary' : 'text-yi-green'}`}>
          {label} — 出生信息
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs uppercase tracking-wider">{genderLabel}</span>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button
              onClick={() => update('gender', 'male')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                person.gender === 'male' ? 'bg-gold-primary/20 text-gold-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              ♂ 男
            </button>
            <button
              onClick={() => update('gender', 'female')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                person.gender === 'female' ? 'bg-gold-primary/20 text-gold-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              ♀ 女
            </button>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Name (optional)</label>
        <input
          type="text"
          value={person.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Enter name..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
        />
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Year</label>
          <input
            type="number"
            value={person.year}
            onChange={(e) => update('year', Number(e.target.value))}
            placeholder="1990"
            min={1900}
            max={2100}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Month</label>
          <input
            type="number"
            value={person.month}
            onChange={(e) => update('month', Number(e.target.value))}
            placeholder="1-12"
            min={1}
            max={12}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Day</label>
          <input
            type="number"
            value={person.day}
            onChange={(e) => update('day', Number(e.target.value))}
            placeholder="1-31"
            min={1}
            max={31}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Hour</label>
          <input
            type="number"
            value={person.hour}
            onChange={(e) => update('hour', Number(e.target.value))}
            placeholder="0-23"
            min={0}
            max={23}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-text-muted text-xs mb-1.5 uppercase tracking-wider">Minute</label>
          <input
            type="number"
            value={person.minute}
            onChange={(e) => update('minute', Number(e.target.value))}
            placeholder="0-59"
            min={0}
            max={59}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary/40 transition-colors text-sm"
          />
        </div>
        <div className="flex items-end">
          <span className="text-text-tertiary text-xs bg-white/5 rounded-lg px-3 py-2.5 block w-full">
            🌏 True solar time auto-calculated
          </span>
        </div>
      </div>

      {/* Quick fill hint */}
      <p className="text-text-muted text-xs mt-2">
        💡 使用公历日期，时间越精确结果越准确。八字会自动排盘计算。
      </p>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#scoreGradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={score >= 70 ? '#D4AF37' : score >= 50 ? '#FBBF24' : '#F87171'} />
            <stop offset="100%" stopColor={score >= 70 ? '#E5C158' : score >= 50 ? '#D4AF37' : '#EF4444'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display font-bold text-4xl ${getScoreColor(score)}`}>{score}</span>
        <span className="text-text-tertiary text-xs">/ 100</span>
      </div>
    </div>
  );
}

function DimensionBar({ dim }: { dim: CompatibilityResponse['dimensions'][0] }) {
  const scorePct = (dim.score / 10) * 100;
  const weightLabel = `×${(dim.weight * 100).toFixed(0)}%`;

  return (
    <div className="glass-card p-4 border-white/5">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <span className="text-text-primary font-medium text-sm">{dim.name}</span>
          <span className="text-text-muted text-xs ml-2">{dim.nameEn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs bg-white/5 px-2 py-0.5 rounded">{weightLabel}</span>
          <span className={`font-bold text-sm ${getScoreColor(dim.score * 10)}`}>
            {dim.score.toFixed(1)}<span className="text-text-muted font-normal">/10</span>
          </span>
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(dim.score * 10)}`}
          style={{ width: `${scorePct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function CompatibilityPage() {
  const [person1, setPerson1] = useState<PersonInput>({
    name: '', year: 1990, month: 6, day: 15, hour: 14, minute: 30, gender: 'male',
  });
  const [person2, setPerson2] = useState<PersonInput>({
    name: '', year: 1992, month: 3, day: 20, hour: 9, minute: 15, gender: 'female',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResponse | null>(null);
  const [error, setError] = useState<string>('');

  // Quick fill with sample data
  const handleQuickFill = () => {
    setPerson1({ name: 'Alex', year: 1995, month: 8, day: 12, hour: 10, minute: 30, gender: 'male' });
    setPerson2({ name: 'May', year: 1997, month: 4, day: 5, hour: 16, minute: 45, gender: 'female' });
    setResult(null);
    setError('');
  };

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1, person2 }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError((data as ErrorData).error || 'Calculation failed');
      } else {
        setResult(data as CompatibilityResponse);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [person1, person2]);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ─── Starry Background ─── */}
      <div className="absolute inset-0 starry-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yi-green/5 rounded-full blur-3xl" />

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 pt-20 pb-8 px-6 text-center">
        <div className="mb-3">
          <span className="text-gold-primary text-sm font-display tracking-widest">✦ BAZI COMPATIBILITY ✦</span>
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-3 text-gold-glow">
          八字合盘 · Compatibility Analysis
        </h1>
        <p className="text-text-secondary text-base max-w-xl mx-auto">
          Enter birth details for both people. Our engine calculates Five Elements complementarity, Heavenly Stem harmony, and Ten Deity relationships — revealing your innate compatibility.
        </p>

        {/* Quick fill button */}
        <button
          onClick={handleQuickFill}
          className="mt-4 text-gold-primary/70 hover:text-gold-primary transition-colors text-xs underline decoration-dotted"
        >
          Try with sample data →
        </button>
      </section>

      {/* ─── Input Section ─── */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <BirthForm person={person1} index={0} onChange={setPerson1} />
          <BirthForm person={person2} index={1} onChange={setPerson2} />
        </div>

        {/* Calculate Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className={`font-display font-bold text-lg px-12 py-4 rounded-xl transition-all ${
              loading
                ? 'bg-gold-primary/30 text-text-muted cursor-wait'
                : 'bg-gold-primary text-bg-primary hover:bg-gold-light shadow-lg shadow-gold-primary/20 hover:shadow-gold-primary/40 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Calculating...
              </span>
            ) : (
              '✦ 开始合盘 · Calculate Compatibility'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-lg mx-auto mt-4 glass-card p-3 border-cinnabar-red/20 text-center">
            <span className="text-cinnabar-red text-sm">{error}</span>
          </div>
        )}
      </section>

      {/* ─── Results Section ─── */}
      {result && (
        <section className="relative z-10 px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Score Ring + Summary */}
            <div className="glass-card p-6 md:p-8 border-gold-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={result.overallScore} />
                </div>

                {/* Score Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`font-display font-bold text-2xl mb-1 ${getScoreColor(result.overallScore)}`}>
                    {getScoreLabel(result.overallScore).cn}
                  </div>
                  <div className="text-text-muted text-sm mb-3">{getScoreLabel(result.overallScore).en}</div>

                  {/* Day Masters */}
                  {(result.person1DayMaster || result.person2DayMaster) && (
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-sm">
                      <span className="text-gold-primary font-medium">{result.person1DayMaster || 'A'}</span>
                      <span className="text-text-tertiary">↔</span>
                      <span className="text-yi-green font-medium">{result.person2DayMaster || 'B'}</span>
                    </div>
                  )}

                  {/* Summary */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimension Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.dimensions.map((dim, i) => (
                <DimensionBar key={i} dim={dim} />
              ))}
            </div>

            {/* Detailed Analysis (expandable) */}
            <details className="glass-card p-5 border-white/5 group">
              <summary className="cursor-pointer text-text-primary font-medium flex items-center gap-2 select-none">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Detailed Analysis · 详细分析
              </summary>
              <div className="mt-4 space-y-3">
                {result.details.map((detail, i) => (
                  <div key={i} className="glass-card p-4 border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-primary font-medium text-sm">{detail.dimension}</span>
                      <div className={`px-2 py-0.5 rounded text-xs ${getScoreBg(detail.score * 10)} ${getScoreColor(detail.score * 10)}`}>
                        {detail.score.toFixed(1)} / {detail.maxScore}
                      </div>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed">{detail.description}</p>
                  </div>
                ))}
              </div>
            </details>

            {/* CTA: Free to Paid */}
            <div className="text-center">
              <div className="glass-card px-8 py-6 border-gold-primary/20 inline-block">
                <p className="text-text-secondary mb-2 text-sm">
                  🔮 Want the complete compatibility report?
                </p>
                <div className="space-y-2">
                  <a
                    href="/pricing"
                    className="inline-block bg-gold-primary text-bg-primary font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-light transition-colors text-sm"
                  >
                    View Full Report — $9.99
                  </a>
                  <p className="text-text-muted text-xs mt-2">
                    Includes: 10-year fortune sync, marriage timing, children compatibility, personalized remedies & more
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ─── How It Works (no results) ─── */}
      {!result && !loading && (
        <section className="relative z-10 px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-xl text-center mb-8 text-text-primary">
              How Compatibility Is Calculated · 合盘原理
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: '☯',
                  title: 'Day Master Match',
                  titleCn: '日干匹配',
                  desc: 'Your Day Master (日干) represents your core self. Heavenly Stem combinations reveal natural attraction patterns.',
                },
                {
                  icon: '🌳',
                  title: 'Five Elements Complementarity',
                  titleCn: '五行互补',
                  desc: 'If one person lacks Wood and the other has excess, you naturally complement each other — 缺什么补什么.',
                },
                {
                  icon: '🔥',
                  title: 'Earthly Branch Harmony',
                  titleCn: '地支和谐',
                  desc: 'Six Harmonies (六合) and Three Harmonies (三合) between birth branches reveal deep compatibility.',
                },
              ].map((item, i) => (
                <div key={i} className="glass-card p-5 border-white/5 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-display font-bold text-sm mb-1">{item.titleCn}</div>
                  <div className="text-text-muted text-xs mb-2">{item.title}</div>
                  <p className="text-text-secondary text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-center text-text-muted text-xs mt-8">
              ⚠️ Based on traditional Chinese metaphysics, for reference and entertainment only.
            </p>
          </div>
        </section>
      )}

      {/* ─── Footer CTA (always visible) ─── */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-text-tertiary text-xs mb-3">
            Also explore: <a href="/bazi" className="text-gold-primary/70 hover:text-gold-primary transition-colors">Your BaZi Chart</a> · <a href="/chat" className="text-gold-primary/70 hover:text-gold-primary transition-colors">AI Master Chat</a>
          </p>
        </div>
      </section>

      {/* ─── Global Styles ─── */}
      <style jsx global>{`
        .starry-bg {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 80px 50px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 150px 20px, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 200px 80px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 50px 100px, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 300px 60px, rgba(255,255,255,0.3), transparent);
          background-size: 350px 120px;
        }
      `}</style>
    </div>
  );
}
