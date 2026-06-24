import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bornchart.app'
  
  // Core pages
  const pages = [
    '', '/bazi', '/chat', '/blog', '/pricing', '/zen', '/bagua',
    '/tools', '/daily', '/2026-zodiac-fortune',
    '/contact', '/terms', '/privacy', '/refund', '/signup', '/login',
    '/about', '/fatebook', '/account', '/activate', '/dashboard',
  ]
  
  // Chinese pages
  const zhPages = [
    '/zh', '/zh/bazi', '/zh/chat', '/zh/blog', '/zh/pricing', '/zh/zen',
    '/zh/contact', '/zh/terms', '/zh/privacy', '/zh/refund', '/zh/signup', '/zh/login',
    '/zh/about', '/zh/fatebook', '/zh/account', '/zh/activate', '/zh/dashboard', '/zh/bagua',
    '/zh/daily',
  ]
  
  // Blog posts from content/blog/
  const blogDir = path.join(process.cwd(), 'content/blog')
  const blogPosts: string[] = []
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .forEach(f => blogPosts.push(f.replace(/\.(md|mdx)$/, '')))
  }
  
  // Chinese blog posts from content/blog/zh/
  const zhBlogDir = path.join(process.cwd(), 'content/blog/zh')
  const zhBlogPosts: string[] = []
  if (fs.existsSync(zhBlogDir)) {
    fs.readdirSync(zhBlogDir)
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .forEach(f => zhBlogPosts.push(f.replace(/\.(md|mdx)$/, '')))
  }
  
  // Blog posts from app/blog/ directory
  const appBlogDir = path.join(process.cwd(), 'app/blog')
  const appBlogPosts: string[] = []
  if (fs.existsSync(appBlogDir)) {
    fs.readdirSync(appBlogDir)
      .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
      .forEach(f => appBlogPosts.push(f.replace(/\.(md|mdx)$/, '')))
  }
  
  // Tool pages
  const toolsDir = path.join(process.cwd(), 'app/tools')
  const toolPages: string[] = []
  if (fs.existsSync(toolsDir)) {
    fs.readdirSync(toolsDir)
      .filter(f => !f.startsWith('page.') && f !== '[slug]')
      .forEach(f => toolPages.push(`/tools/${f}`))
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
    ...appBlogPosts.map(slug => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...toolPages.map(tool => ({
      url: `${baseUrl}${tool}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
  
  return entries
}
