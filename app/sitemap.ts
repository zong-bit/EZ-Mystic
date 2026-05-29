import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

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
    'what-is-bazi-beginners-guide',
    'day-master-bazi-10-types-explained',
    'bazi-vs-western-astrology-key-differences-7',
    'five-elements-bazi-wood-fire-earth-metal-water',
    'bazi-career-guide-ideal-career-path',
    'free-bazi-reading-vs-paid-comparison',
    'bazi-love-compatibility-four-pillars-match',
    '2026-fire-horse-bazi-yearly-forecast',
    'bazi-missing-elements-deficiency-fix-guide',
    'true-solar-time-bazi-birth-location-correction',
    'bazi-life-cycles-fortune-periods-guide',
    'bazi-10-gods-shi-shen-complete-guide',
    'bazi-wealth-money-star-element-guide',
    'bazi-health-body-constitution-five-elements',
    'bazi-marriage-spouse-palace-relationship-destiny',
    'bazi-feng-shui-direction-guide-best-direction',
    'bazi-health-wellness-by-element-type',
    'bazi-business-timing-entrepreneur-guide',
    'bazi-western-astrology-which-is-right',
    'chinese-zodiac-vs-bazi-comparison',
    'bazi-students-major-career-path-guide',
    'bazi-resource-guide-tools-books-communities',
  ]
  // Chinese blog posts from content/blog/zh/
  const zhBlogDir = path.join(process.cwd(), 'content/blog/zh')
  const zhBlogPosts: string[] = []
  if (fs.existsSync(zhBlogDir)) {
    fs.readdirSync(zhBlogDir)
      .filter(f => f.endsWith('.md'))
      .forEach(f => zhBlogPosts.push(f.replace(/\.md$/, '')))
  }
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
    ...zhBlogPosts.map(slug => ({
      url: `${baseUrl}/zh/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
  return entries
}
