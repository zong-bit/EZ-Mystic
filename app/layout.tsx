import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import AuthProviderWrapper from './auth/provider';
import Navbar from './components/Navbar';
import StarBackground from './components/StarBackground';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
import Footer from './components/Footer';

export function generateMetadata({ params }: { params?: { slug?: string } }): Metadata {
  // Dynamic canonical URL based on pathname
  const canonical = params?.slug ? `https://bornchart.app/blog/${params.slug}` : 'https://bornchart.app';

  return {
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
    metadataBase: new URL('https://bornchart.app'),
    verification: {
      google: 'iZdsDRFA8lc9MPxrgudfQKuLKwrnDijPuuuBbEkILE4',
    },
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: 'FateWise — Online Bazi Chart · AI Destiny Reading',
      description:
        'Precise Bazi charting, AI deep interpretation, complete Destiny Book PDF reports. Based on true solar time correction, millennia of Eastern wisdom revealed by AI.',
      url: canonical,
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
}

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
        <meta name="theme-color" content="#c9a84c" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" sizes="512x512" />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary font-body">
        <StarBackground />
        <AuthProviderWrapper>
          <Navbar />
          <div className="flex-grow min-h-[calc(100vh-16rem)]">
            {children}
          </div>
          <Footer />
        </AuthProviderWrapper>
        <Analytics />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'} />
        {/* Schema.org structured data */}
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "FateWise",
              applicationCategory: "EducationApplication",
              operatingSystem: "Web",
              description: "AI-powered Chinese Astrology Bazi Chart and Destiny Reading platform",
              url: "https://bornchart.app",
              offers: {
                "@type": "Offer",
                price: "9.99",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FateWise",
              url: "https://bornchart.app",
              sameAs: [],
            }),
          }}
        />
      </body>
    </html>
  );
}
