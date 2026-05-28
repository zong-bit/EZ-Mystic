import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bornchart.app'
  const pages = [
    '', '/bazi', '/chat', '/blog', '/pricing', '/zen',
    '/contact', '/terms', '/privacy', '/refund', '/signup', '/login',
  ]
  const blogPosts = [
    'bazi-career-guide-how-to-read-your-chart',
    'bazi-life-cycle-major-luck-pillars',
    'bazi-love-compatibility-guide',
    'bazi-vs-western-astrology-key-differences-you-should-know',
    'free-bazi-reading-vs-paid-guide',
    'how-to-calculate-your-bazi-chart-step-by-step-guide',
    'how-to-read-bazi-chart-beginners-guide',
    'how-to-read-bazi-chart-day-master-five-elements',
    'the-five-elements-in-bazi-wood-fire-earth-metal-water-explained',
    'true-solar-time-chinese-astrology-birth-location',
    'understanding-your-day-master-the-key-to-reading-bazi',
    'what-is-bazi-four-pillars-of-destiny-guide',
    'bazi-nobleman-stars-activate-guide',
  ]
  const entries = [
    ...pages.map(p => ({
      url: `${baseUrl}${p}`,
      lastModified: new Date(),
      changeFrequency: p === '' ? 'weekly' as const : 'monthly' as const,
      priority: p === '' ? 1 : 0.8,
    })),
    ...blogPosts.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
  return entries
}
