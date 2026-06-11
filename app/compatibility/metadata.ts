import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'FateWise — Bazi Compatibility · Relationship Matching',
    description:
      'Calculate your relationship compatibility through Chinese BaZi (Eight Characters) analysis. Discover Five Elements complementarity, Heavenly Stem harmony, and Ten Deity relationships.',
    keywords: [
      'bazi compatibility',
      'relationship matching',
      '八字合盘',
      '八字配对',
      '五行合婚',
      'Chinese astrology compatibility',
      'couple bazi analysis',
    ],
    authors: [{ name: 'FateWise' }],
    creator: 'FateWise',
    publisher: 'FateWise',
    metadataBase: new URL('https://bornchart.app'),
    alternates: { canonical: 'https://bornchart.app/compatibility' },
  };
}
