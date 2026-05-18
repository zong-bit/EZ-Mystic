import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import AuthProviderWrapper from './auth/provider';
import Navbar from './components/Navbar';
import StarBackground from './components/StarBackground';

export const metadata: Metadata = {
  title: 'FateWise — Online Bazi Chart · AI Destiny Reading · Eastern Wisdom',
  description:
    'FateWise offers precise Bazi (Four Pillars) charting, AI-powered deep interpretation, and complete Destiny Book PDF reports. Based on true solar time correction, millennia of Eastern wisdom revealed by AI.',
  keywords: [
    'Bazi chart',
    'Four Pillars of Destiny',
    'AI destiny reading',
    'true solar time',
    'Chinese astrology',
    'feng shui',
    'destiny book',
    'fate analysis',
    'online Bazi',
    'BaZi reading',
  ],
  authors: [{ name: 'FateWise' }],
  creator: 'FateWise',
  publisher: 'FateWise',
  metadataBase: new URL('https://fatewise.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FateWise — Online Bazi Chart · AI Destiny Reading',
    description:
      'Precise Bazi charting, AI deep interpretation, complete Destiny Book PDF reports. Based on true solar time correction, millennia of Eastern wisdom revealed by AI.',
    url: 'https://fatewise.app',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FateWise - Online Bazi Chart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise — Online Bazi Chart · AI Destiny Reading',
    description:
      'Precise Bazi charting, AI deep interpretation, complete Destiny Book PDF reports. Based on true solar time correction, millennia of Eastern wisdom revealed by AI.',
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
    <html lang="en">
      <head>
        <meta name="application-name" content="FateWise" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0A0F" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary font-body">
        <StarBackground />
        <AuthProviderWrapper>
          <Navbar />
          {children}
        </AuthProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
