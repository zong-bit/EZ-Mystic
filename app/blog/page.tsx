import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

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
  title: 'FateWise Blog — Bazi, Chinese Astrology & Eastern Wisdom',
  description:
    'Explore Chinese astrology, Bazi (Four Pillars of Destiny), Five Elements theory, and authentic Eastern wisdom. Learn how your birth time reveals your destiny code.',
  keywords: [
    'Bazi blog',
    'Chinese astrology articles',
    'Four Pillars of Destiny guide',
    'Five Elements theory',
    'true solar time',
    'Eastern wisdom',
    'destiny reading',
    'BaZi education',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'FateWise Blog — Eastern Wisdom & Bazi Guide',
    description: 'Explore Chinese astrology, Bazi (Four Pillars of Destiny), Five Elements theory, and authentic Eastern wisdom.',
    url: 'https://bornchart.app/blog',
    siteName: 'FateWise',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'FateWise Blog — Eastern Wisdom & Bazi Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise Blog — Eastern Wisdom & Bazi Guide',
    description: 'Explore Chinese astrology, Bazi, and Eastern wisdom.',
    images: ['/og-blog.png'],
  },
};

export default function BlogPage() {
  const posts = getPosts();

  // Show max 12 posts; paginate if needed
  const postsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const page = 1; // For now, always page 1; pagination UI for future
  const displayedPosts = posts.slice(0, postsPerPage);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Blog Hero */}
      <section className="blog-hero relative overflow-hidden">
        <div className="blog-hero-bg" />
        <div className="blog-hero-glow" style={{ top: '20%', left: '30%' }} />
        <div className="blog-hero-glow" style={{ bottom: '20%', right: '25%', width: 192, height: 192 }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Language switch */}
          <div className="flex justify-center mb-6">
            <Link
              href="/zh/blog"
              className="text-gold-primary border border-gold-primary/30 rounded-full px-4 py-1 text-sm hover:bg-gold-primary/10 transition">
              中文
            </Link>
          </div>
          <span className="blog-hero-tag">✦ Wisdom for the Curious ✦</span>
          <h1 className="blog-hero-title">
            Eastern Wisdom Blog
          </h1>
          <p className="blog-hero-desc">
            Discover the ancient art of Bazi (Four Pillars of Destiny), the Five Elements theory,
            and the secrets of Chinese astrology — explained clearly for the modern seeker.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {displayedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">Blog posts coming soon.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPosts.map(post => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="blog-card group">
                    {/* Meta row: category + date + read time */}
                    <div className="blog-card-meta">
                      <span className="blog-card-category">{post.category}</span>
                      <span className="blog-card-date">{post.date}</span>
                      <span className="blog-card-sep">·</span>
                      <span className="blog-card-readtime">{post.readTime} min read</span>
                    </div>

                    {/* Title */}
                    <h2 className="blog-card-title">{post.title}</h2>

                    {/* Excerpt — 2 line clamp */}
                    <p className="blog-card-excerpt">{post.excerpt}</p>

                    {/* Read more link */}
                    <span className="blog-card-cta">
                      Read more <span className="blog-card-arrow">→</span>
                    </span>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="blog-pagination">
                  <span className="blog-page-btn active">{page}</span>
                  {totalPages > 1 && (
                    <span className="blog-page-btn" style={{ cursor: 'default', opacity: 0.5 }}>
                      {page + 1}
                    </span>
                  )}
                  {totalPages > 2 && (
                    <span className="blog-page-btn" style={{ cursor: 'default', opacity: 0.5 }}>
                      {page + 2}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center glass-card p-12">
          <h2 className="font-display text-2xl font-bold mb-4 text-gold-glow">
            Ready to discover your destiny?
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Get your free Bazi chart and begin your journey into Chinese astrology.
            Enter your birth details and let AI reveal your destiny code.
          </p>
          <Link href="/bazi" className="btn-primary text-lg px-12 py-4 inline-block">
            ✨ Get Your Free Bazi Chart
          </Link>
        </div>
      </section>

    </div>
  );
}
