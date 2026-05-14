import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FateWise — 在线八字排盘 | AI命理师深度解读 | 东方智慧',
  description:
    'FateWise 提供精准八字排盘、AI深度解读、完整命书PDF报告。基于真太阳时校正，千年命理智慧由AI为你揭示。',
  keywords: [
    '八字排盘',
    '八字命理',
    'AI命理',
    '真太阳时',
    '紫微斗数',
    '风水',
    '天命之书',
    '命运密码',
    '在线排盘',
    '命理分析',
  ],
  authors: [{ name: 'FateWise' }],
  creator: 'FateWise',
  publisher: 'FateWise',
  metadataBase: new URL('https://fatewise.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FateWise — 在线八字排盘 | AI命理师深度解读',
    description:
      '精准八字排盘、AI深度解读、完整命书PDF报告。基于真太阳时校正，千年命理智慧由AI为你揭示。',
    url: 'https://fatewise.app',
    siteName: 'FateWise',
    type: 'website',
    locale: 'zh_CN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FateWise - 在线八字排盘',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise — 在线八字排盘 | AI命理师深度解读',
    description:
      '精准八字排盘、AI深度解读、完整命书PDF报告。基于真太阳时校正，千年命理智慧由AI为你揭示。',
    images: ['/og-image.png'],
    creator: '@fatewise',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="application-name" content="FateWise" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0A0F" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
