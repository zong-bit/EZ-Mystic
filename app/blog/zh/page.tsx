import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content/blog/zh');

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: number;
  keywords: string;
}

function getPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const excerptMatch = content.match(/^excerpt:\s*(.+)$/m);
    const dateMatch = content.match(/^date:\s*(.+)$/m);
    const authorMatch = content.match(/^author:\s*(.+)$/m);
    const categoryMatch = content.match(/^category:\s*(.+)$/m);
    const keywordsMatch = content.match(/^keywords:\s*(.+)$/m);

    const title = titleMatch?.[1]?.trim() || 'Untitled';
    const excerpt = excerptMatch?.[1]?.trim() || '';
    const date = dateMatch?.[1]?.trim() || '';
    const author = authorMatch?.[1]?.trim() || 'FateWise';
    const category = categoryMatch?.[1]?.trim() || 'General';
    const keywords = keywordsMatch?.[1]?.trim() || '';

    // Estimate read time (average ~200 words per minute)
    const bodyStart = content.indexOf('\n\n');
    const body = bodyStart > 0 ? content.slice(bodyStart + 2) : '';
    const wordCount = body.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return { slug, title, excerpt, date, author, category, readTime, keywords };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

export const metadata: Metadata = {
  title: 'FateWise 博客 — 八字、中国占星与东方智慧',
  description:
    '探索中国占星术、八字（四柱推命）、五行理论与正宗东方智慧。了解你的出生时间如何揭示你的命运密码。',
  keywords: [
    '八字博客',
    '中国占星术文章',
    '四柱推命指南',
    '五行理论',
    '真太阳时',
    '东方智慧',
    '命运解读',
    '八字教育',
  ],
  alternates: {
    canonical: '/zh/blog',
  },
  openGraph: {
    title: 'FateWise 博客 — 东方智慧与八字指南',
    description: '探索中国占星术、八字（四柱推命）、五行理论与正宗东方智慧。',
    url: 'https://bornchart.app/zh/blog',
    siteName: 'FateWise',
    type: 'website',
    locale: 'zh_CN',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'FateWise 博客 — 东方智慧与八字指南',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise 博客 — 东方智慧与八字指南',
    description: '探索中国占星术、八字与东方智慧。',
    images: ['/og-blog.png'],
  },
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ 为好奇者准备的智慧 ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            东方智慧博客
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            发现八字（四柱推命）、五行理论和中国占星术的古老艺术——
            为现代探索者清晰解读。
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">博客文章即将推出。</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/zh/blog/${post.slug}`}
                  className="block glass-card p-6 md:p-8 hover:border-gold-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-gold-primary font-semibold uppercase tracking-wider bg-gold-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-text-tertiary">{post.date}</span>
                    <span className="text-xs text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">{post.readTime} 分钟阅读</span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary group-hover:text-gold-primary transition-colors mb-3">
                    {post.title}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-gold-primary text-sm font-medium group-hover:underline">
                    阅读更多 →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-2xl font-bold mb-4 text-gold-glow">
            准备好探索你的命运了吗？
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            获取你的免费八字命盘，开始你的中国占星术之旅。
            输入你的出生信息，让 AI 揭示你的命运密码。
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4 inline-block">
            ✨ 免费获取八字命盘
          </Link>
        </div>
      </section>

    </div>
  );
}
