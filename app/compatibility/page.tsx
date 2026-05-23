'use client';

import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';

// --- 数据定义 ---

const ELEMENTS = [
  {
    id: 'wood',
    name: '木',
    color: 'text-wood',
    bg: 'bg-wood/10',
    border: 'border-wood/30',
    desc: 'Symbolizes growth and vitality, with upward developmental drive.',
  },
  {
    id: 'fire',
    name: '火',
    color: 'text-fire',
    bg: 'bg-fire/10',
    border: 'border-fire/30',
    desc: 'Symbolizes brightness and passion, with upward-burning energy.',
  },
  {
    id: 'earth',
    name: '土',
    color: 'text-earth',
    bg: 'bg-earth/10',
    border: 'border-earth/30',
    desc: 'Symbolizes nurturing and bearing, with neutralizing and transforming qualities.',
  },
  {
    id: 'metal',
    name: '金',
    color: 'text-metal-white',
    bg: 'bg-metal-white/10',
    border: 'border-metal-white/30',
    desc: 'Symbolizes transformation and decisiveness, with resolute and purifying nature.',
  },
  {
    id: 'water',
    name: '水',
    color: 'text-water',
    bg: 'bg-water/10',
    border: 'border-water/30',
    desc: 'Symbolizes flow and wisdom, with downward-nourishing characteristics.',
  },
];

// Generating (Mutual Support) Relationship
const GENERATING: { from: string; to: string; label: string }[] = [
  { from: 'wood', to: 'fire', label: 'Wood generates Fire' },
  { from: 'fire', to: 'earth', label: 'Fire generates Earth' },
  { from: 'earth', to: 'metal', label: 'Earth generates Metal' },
  { from: 'metal', to: 'water', label: 'Metal generates Water' },
  { from: 'water', to: 'wood', label: 'Water generates Wood' },
];

// Overcoming (Mutual Restriction) Relationship
const OVERCOMING: { from: string; to: string; label: string }[] = [
  { from: 'wood', to: 'earth', label: 'Wood overcomes Earth' },
  { from: 'earth', to: 'water', label: 'Earth overcomes Water' },
  { from: 'water', to: 'fire', label: 'Water overcomes Fire' },
  { from: 'fire', to: 'metal', label: 'Fire overcomes Metal' },
  { from: 'metal', to: 'wood', label: 'Metal overcomes Wood' },
];

const getElementById = (id: string) =>
  ELEMENTS.find((e) => e.id === id) || ELEMENTS[0];

export default function CompatibilityPage() {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const toggleElement = (id: string) => {
    if (selectedElements.includes(id)) {
      setSelectedElements(selectedElements.filter((e) => e !== id));
    } else if (selectedElements.length < 2) {
      setSelectedElements([...selectedElements, id]);
    }
    setShowResult(false);
  };

  const handleAnalyze = () => {
    if (selectedElements.length === 2) {
      setShowResult(true);
    }
  };

  const matchResult = React.useMemo(() => {
    if (!showResult || selectedElements.length !== 2) return null;

    const [e1, e2] = selectedElements;

    const isGenerating =
      GENERATING.find((g) => g.from === e1 && g.to === e2) ||
      GENERATING.find((g) => g.from === e2 && g.to === e1);

    const isOvercoming =
      OVERCOMING.find((o) => o.from === e1 && o.to === e2) ||
      OVERCOMING.find((o) => o.from === e2 && o.to === e1);

    return { isGenerating, isOvercoming };
  }, [showResult, selectedElements]);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary/30">
      {/* 背景装饰 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-nebula-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <span className="text-xs font-bold tracking-widest text-gold-primary uppercase mb-2 block">
            FateWise Five Elements Analysis
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-4 font-display">
            Five Elements Compatibility
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-primary via-gold-light to-nebula-purple">
              Match
            </span>
          </h1>
          <p className="text-text-tertiary max-w-2xl mx-auto text-lg">
            Explore how Five Elements energy influences your interpersonal relationships. Choose two elements to reveal the generative and restraining bonds of destiny.
          </p>
        </div>

        {/* Step 1: Selection */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-secondary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold-primary/20 text-gold-primary flex items-center justify-center text-sm">
                1
              </span>
              Choose Your Five Elements
            </h2>
            <span className="text-sm text-text-muted">
              Selected:{' '}
              <span className="text-text-secondary font-medium">
                {selectedElements.length}/2
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {ELEMENTS.map((el) => (
              <button
                key={el.id}
                onClick={() => toggleElement(el.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  selectedElements.includes(el.id)
                    ? `${el.bg} ${el.border} scale-105 shadow-lg`
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <span className={`text-3xl font-display font-bold ${el.color}`}>
                  {el.name}
                </span>
                <span className="text-xs text-text-muted mt-1">{el.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Analyze Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleAnalyze}
            disabled={selectedElements.length !== 2}
            className="group relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-b from-gold-primary to-gold-secondary px-10 font-medium text-ink-black shadow-[0_10px_20px_rgba(212,168,83,0.3)] transition-all hover:from-gold-light hover:to-gold-primary hover:shadow-[0_15px_25px_rgba(212,168,83,0.4)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[0_10px_20px_rgba(212,168,83,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles size={18} />
              Analyze Compatibility
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>

        {/* Result */}
        {matchResult && (
          <section className="mb-12">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold text-text-primary font-display mb-6 text-center">
                Match Result
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                {/* Element 1 */}
                <div
                  className={`flex flex-col items-center p-6 rounded-xl ${getElementById(selectedElements[0]).bg} ${getElementById(selectedElements[0]).border}`}
                >
                  <span
                    className={`text-4xl font-display font-bold ${getElementById(selectedElements[0]).color}`}
                  >
                    {getElementById(selectedElements[0]).name}
                  </span>
                </div>

                {/* Relationship */}
                <div className="text-center">
                  {matchResult.isGenerating && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-bold text-aurora-green">
                        Generating
                      </span>
                      <span className="text-sm text-text-tertiary">
                        Mutual nourishment, energy flow
                      </span>
                    </div>
                  )}
                  {matchResult.isOvercoming && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-bold text-cinnabar-red">
                        Overcoming
                      </span>
                      <span className="text-sm text-text-tertiary">
                        Mutual restriction, balanced development
                      </span>
                    </div>
                  )}
                  {!matchResult.isGenerating && !matchResult.isOvercoming && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-bold text-gold-primary">
                        Neutral
                      </span>
                      <span className="text-sm text-text-tertiary">
                        No obvious generating or overcoming relationship
                      </span>
                    </div>
                  )}
                </div>

                {/* Element 2 */}
                <div
                  className={`flex flex-col items-center p-6 rounded-xl ${getElementById(selectedElements[1]).bg} ${getElementById(selectedElements[1]).border}`}
                >
                  <span
                    className={`text-4xl font-display font-bold ${getElementById(selectedElements[1]).color}`}
                  >
                    {getElementById(selectedElements[1]).name}
                  </span>
                </div>
              </div>

              {/* Relationship details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Generating Relationship
                </h3>
                {GENERATING.filter((g) =>
                  (g.from === selectedElements[0] &&
                    g.to === selectedElements[1]) ||
                  (g.from === selectedElements[1] &&
                    g.to === selectedElements[0])
                ).map((g) => (
                  <div
                    key={g.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20 text-aurora-green"
                  >
                    <span className="font-medium">{g.label}</span>
                  </div>
                ))}

                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 mt-6">
                  Overcoming Relationship
                </h3>
                {OVERCOMING.filter((o) =>
                  (o.from === selectedElements[0] &&
                    o.to === selectedElements[1]) ||
                  (o.from === selectedElements[1] &&
                    o.to === selectedElements[0])
                ).map((o) => (
                  <div
                    key={o.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-cinnabar-red/5 border border-cinnabar-red/20 text-cinnabar-red"
                  >
                    <span className="font-medium">{o.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">
            Want a deeper Five Elements compatibility analysis?
          </p>
          <button className="group inline-flex items-center gap-2 text-gold-primary hover:text-gold-light transition-colors text-sm font-medium">
            Generate Full Report
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* AI Master CTA */}
        <div className="mt-12 text-center">
          <div className="inline-block glass-card px-8 py-6 border-gold-primary/30">
            <p className="text-text-secondary mb-3">
              Want personalized advice?
            </p>
            <a
              href="/chat"
              className="text-gold-primary font-semibold hover:text-gold-light transition-colors text-lg"
            >
              Talk to our AI Master for free →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
