'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BaziResult } from '@/bazi/types';

function FateBookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bazi, setBazi] = useState<BaziResult | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const baziData = searchParams.get('bazi');
    if (baziData) {
      try {
        setBazi(JSON.parse(decodeURIComponent(baziData)));
      } catch {
        console.error('Failed to parse bazi data');
      }
    }
    const n = searchParams.get('name');
    if (n) setName(n);
  }, [searchParams]);

  const handleGenerate = useCallback(async () => {
    if (!bazi) return;
    setLoading(true);
    setShowContent(false);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bazi, name: name || undefined }),
      });

      const data = await response.json();
      if (data.success) {
        setContent(data.content);
        setTimeout(() => setShowContent(true), 100);
      }
    } catch (err) {
      console.error('Destiny book generation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [bazi, name]);

  const handleDownloadPDF = useCallback(async () => {
    if (!bazi || !content) return;
    setDownloading(true);

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bazi,
          name: name || 'anonymous',
          interpretation: content,
          title: 'Destiny Book · Destiny Revelation',
        }),
      });

      const data = await response.json();
      if (data.success && data.pdfBase64) {
        const link = document.createElement('a');
        link.href = data.pdfBase64;
        link.download = data.filename || 'fatebook.pdf';
        link.click();
      }
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [bazi, content, name]);

  if (!bazi) {
    return (
      <div className="min-h-screen starry-bg flex items-center justify-center px-6">
        <div className="glass-card p-12 text-center max-w-md">
          <h2 className="font-display text-2xl font-bold mb-4">Please complete your Bazi chart first</h2>
          <p className="text-text-secondary mb-6">A Bazi chart must be generated before creating a Destiny Book report</p>
          <Link href="/bazi" className="btn-primary inline-block">Go to Chart</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen starry-bg">
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Cover */}
          {!showContent && !loading && (
            <div className="glass-card p-12 md:p-20 text-center mb-8 page-enter">
              <div className="text-gold-primary text-4xl mb-6">✦</div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-gold-glow">Destiny Book</h1>
              <p className="text-text-secondary text-lg mb-2">Destiny Revelation</p>
              <div className="text-2xl mb-8 opacity-40">🜁 🜂 🜄 🜃</div>
              {name && <p className="text-text-primary font-display text-xl mb-8">{name}</p>}
              <button onClick={handleGenerate} disabled={loading} className="btn-primary text-lg glow-pulse">
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5 taiji-loader" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    Generating...
                  </span>
                ) : '📖 Open Report'}
              </button>
            </div>
          )}

          {/* Report content */}
          {showContent && content && (
            <div className="glass-card p-6 md:p-10 mb-8 page-enter">
              <div className="text-center mb-10 pb-6 border-b border-gold-primary/20">
                <div className="text-gold-primary text-3xl mb-4">✦</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-gold-glow">Destiny Book</h1>
                <p className="text-text-secondary">Destiny Revelation</p>
                {name && <div className="mt-4 text-text-primary font-display">{name} · {bazi.zodiac}</div>}
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {([
                  { label: 'Year Pillar', pillar: bazi.yearPillar },
                  { label: 'Month Pillar', pillar: bazi.monthPillar },
                  { label: 'Day Pillar', pillar: bazi.dayPillar },
                  { label: 'Hour Pillar', pillar: bazi.hourPillar },
                ] as const).map(({ label, pillar }) => (
                  <div key={label} className="text-center py-3 glass" style={{ background: 'rgba(26,26,40,0.4)' }}>
                    <div className="text-xs text-text-muted mb-1">{label}</div>
                    <div className="font-display text-2xl font-bold text-gold-primary">{pillar.gan}{pillar.zhi}</div>
                  </div>
                ))}
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                {content.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={i} className="font-display font-semibold text-lg mt-8 mb-4 text-gold-primary border-t border-gold-primary/20 pt-6">
                        {line.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={i} className="font-display font-semibold text-xl mt-10 mb-4 text-gold-primary border-t border-gold-primary/30 pt-6">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('# ')) {
                    return (
                      <h2 key={i} className="font-display font-bold text-2xl mt-10 mb-4 text-gold-primary">
                        {line.replace('# ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-semibold text-text-primary my-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <p key={i} className="text-text-secondary ml-4 my-0.5">
                        {line.replace('- ', '• ')}
                      </p>
                    );
                  }
                  if (line.includes('|') && line.startsWith('|')) {
                    const cells = line.split('|').filter((c) => c.trim());
                    return (
                      <div key={i} className="flex gap-4 my-2">
                        {cells.map((cell, ci) => (
                          <span key={ci} className="text-text-secondary text-sm flex-1 border-b border-white/5 pb-1">
                            {cell.trim()}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-3" />;
                  }
                  return (
                    <p key={i} className="text-text-secondary leading-relaxed my-1">
                      {line}
                    </p>
                  );
                })}
              </div>

              <div className="mt-12 pt-6 border-t border-white/5 text-center">
                <p className="text-text-muted text-xs">⚠️ This reading is AI-generated, for reference and entertainment only, not a basis for life decisions.</p>
                <p className="text-text-muted text-xs mt-2">✨ This reading is generated by DeepSeek AI for entertainment and self-reflection purposes.</p>
                <p className="text-text-muted text-xs mt-2">ez-mystic · FateWise · {new Date().toLocaleDateString('en-US')}</p>
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          {showContent && (
            <div className="fixed bottom-0 left-0 right-0 glass z-40" style={{ backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/bazi" className="text-text-secondary hover:text-text-primary transition-colors text-sm">🔄 New Chart</Link>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-primary text-sm" style={{ padding: '10px 24px', fontSize: '14px' }}>
                    {downloading ? '📥 Generating...' : '📥 Download Destiny Book · $9.99'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FateBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen starry-bg flex items-center justify-center">
        <div className="text-gold-primary text-2xl taiji-loader">✦</div>
      </div>
    }>
      <FateBookContent />
    </Suspense>
  );
}
