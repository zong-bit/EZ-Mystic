import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '八卦问卜 · 易经在线占卜 — 提问获取指引',
  description: '免费在线易经六十四卦占卜，AI深度解读。包含卦辞、象辞、动爻分析和五行方位指引。',
  keywords: '易经,八卦,占卜,六十四卦,起卦,卦辞解读,ai解卦,I Ching online,online divination',
  alternates: {
    canonical: '/zh/bagua',
  },
  openGraph: {
    title: '八卦问卜 · 易经在线占卜',
    description: '免费在线易经六十四卦占卜，AI深度解读。包含卦辞、象辞、动爻分析和五行方位指引。',
    url: 'https://bornchart.app/zh/bagua',
    siteName: 'FateWise',
    images: [
      {
        url: 'https://bornchart.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FateWise 八卦问卜 - 易经在线占卜',
      },
    ],
    type: 'website',
    locale: 'zh_CN',
  },
};
