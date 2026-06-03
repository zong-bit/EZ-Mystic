import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bornchart.app'
  const pages = [
    '', '/bazi', '/chat', '/blog', '/pricing', '/zen',
    '/contact', '/terms', '/privacy', '/refund', '/signup', '/login',
    '/about', '/fatebook', '/account', '/activate', '/dashboard',
  ]
  const zhPages = [
    '/zh', '/zh/bazi', '/zh/chat', '/zh/blog', '/zh/pricing', '/zh/zen',
    '/zh/contact', '/zh/terms', '/zh/privacy', '/zh/refund', '/zh/signup', '/zh/login',
    '/zh/about', '/zh/fatebook', '/zh/account', '/zh/activate', '/zh/dashboard',
  ]
  // English blog posts from content/blog/
  const blogDir = path.join(process.cwd(), 'content/blog')
  const blogPosts: string[] = []
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .forEach(f => blogPosts.push(f.replace(/\.md$/, '')))
  }
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
    ...zhPages.map(p => ({
      url: `${baseUrl}${p}`,
      lastModified: new Date(),
      changeFrequency: p === '/zh' ? 'weekly' as const : 'monthly' as const,
      priority: p === '/zh' ? 1 : 0.8,
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
