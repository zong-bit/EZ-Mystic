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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FateWise Blog — Eastern Wisdom & Bazi Guide',
    description: 'Explore Chinese astrology, Bazi, and Eastern wisdom.',
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
          <span className="text-gold-primary text-lg font-display tracking-widest">✦ Wisdom for the Curious ✦</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl mt-6 mb-6 text-gold-glow">
            Eastern Wisdom Blog
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the ancient art of Bazi (Four Pillars of Destiny), the Five Elements theory,
            and the secrets of Chinese astrology — explained clearly for the modern seeker.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary text-lg">Blog posts coming soon.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block glass-card p-6 md:p-8 hover:border-gold-primary/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-gold-primary font-semibold uppercase tracking-wider bg-gold-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-text-tertiary">{post.date}</span>
                    <span className="text-xs text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">{post.readTime} min read</span>
                  </div>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary group-hover:text-gold-primary transition-colors mb-3">
                    {post.title}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-gold-primary text-sm font-medium group-hover:underline">
                    Read more →
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
