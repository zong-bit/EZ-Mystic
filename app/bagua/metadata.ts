import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bagua Divination · I Ching Online — Ask a Question, Get Guidance',
  description: 'Cast hexagrams online with AI-powered I Ching interpretation. Free divination tool with deep Eastern wisdom, trigram analysis and changing lines guidance.',
  keywords: 'i ching, bagua, divination, hexagram reading, i-ching online free, chinese oracle,易经,八卦',
  alternates: {
    canonical: '/bagua',
  },
  openGraph: {
    title: 'Bagua Divination · I Ching Online',
    description: 'Cast hexagrams online with AI-powered I Ching interpretation. Free divination tool.',
    url: 'https://bornchart.app/bagua',
    siteName: 'FateWise',
    images: [
      {
        url: 'https://bornchart.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FateWise Bagua Divination - I Ching Online',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
};
