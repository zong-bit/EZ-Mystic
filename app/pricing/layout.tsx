import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — FateWise Free Bazi Chart & Pro Plans',
  description:
    'Start with a free Bazi chart reading. Upgrade to Pro ($9.99/mo) for full AI deep interpretation, Destiny Book PDF, and Great Fortune analysis.',
  alternates: {
    canonical: 'https://bornchart.app/pricing',
  },
  openGraph: {
    title: 'Pricing — FateWise Free Bazi Chart & Pro Plans',
    description:
      'Start with a free Bazi chart reading. Upgrade to Pro for full AI deep interpretation, Destiny Book PDF, and Great Fortune analysis.',
    url: 'https://bornchart.app/pricing',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FateWise Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — FateWise Free Bazi Chart & Pro Plans',
    description:
      'Start with a free Bazi chart reading. Upgrade to Pro for full AI deep interpretation, Destiny Book PDF, and Great Fortune analysis.',
    images: ['/og-image.png'],
    creator: '@fatewise',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
