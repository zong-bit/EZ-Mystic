import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

interface BlogPostFrontmatter {
  title: string;
  date: string;
  author: string;
  category: string;
  keywords: string;
  excerpt: string;
}

function getPost(slug: string): { post: BlogPostFrontmatter & { content: string }; allSlugs: string[] } | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const filePath = path.join(BLOG_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');

  const titleMatch = content.match(/^title:\s*(.+)$/m);
  const dateMatch = content.match(/^date:\s*(.+)$/m);
  const authorMatch = content.match(/^author:\s*(.+)$/m);
  const categoryMatch = content.match(/^category:\s*(.+)$/m);
  const keywordsMatch = content.match(/^keywords:\s*(.+)$/m);
  const excerptMatch = content.match(/^excerpt:\s*(.+)$/m);

  const bodyStart = content.indexOf('\n\n');
  const body = bodyStart > 0 ? content.slice(bodyStart + 2) : '';

  const frontmatter: BlogPostFrontmatter = {
    title: titleMatch?.[1]?.trim() || 'Untitled',
    date: dateMatch?.[1]?.trim() || '',
    author: authorMatch?.[1]?.trim() || 'FateWise',
    category: categoryMatch?.[1]?.trim() || 'General',
    keywords: keywordsMatch?.[1]?.trim() || '',
    excerpt: excerptMatch?.[1]?.trim() || '',
  };

  return {
    post: { ...frontmatter, content: body },
    allSlugs: files.map(f => f.replace(/\.md$/, '')),
  };
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let pendingList: React.ReactNode[] | null = null;

  function flushList() {
    if (pendingList && pendingList.length > 0) {
      nodes.push(
        <ul key={`ul-${key++}`} className="space-y-0.5 my-4">
          {pendingList}
        </ul>
      );
      pendingList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      nodes.push(<div key={key++} className="h-3" />);
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2 key={key++} className="font-display text-xl font-bold text-gold-primary mt-8 mb-4 gold-divider pb-2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3 key={key++} className="font-display text-lg font-semibold text-gold-light mt-6 mb-3">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // Unordered list
    if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && !trimmed.startsWith('- [') && !trimmed.startsWith('* [')) {
      const text = trimmed.slice(2);
      if (!pendingList) pendingList = [];
      pendingList.push(
        <li key={key++} className="flex items-start gap-2 text-text-primary text-sm leading-relaxed">
          <span className="text-gold-primary mt-1 flex-shrink-0">✦</span>
          <span>{renderInline(text)}</span>
        </li>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s+/, '');
      if (!pendingList) pendingList = [];
      pendingList.push(
        <li key={key++} className="flex items-start gap-2 text-text-primary text-sm leading-relaxed">
          <span className="text-gold-primary mt-0.5 flex-shrink-0">▸</span>
          <span>{renderInline(text)}</span>
        </li>
      );
      continue;
    }

    // Table
    if (trimmed.includes('|') && trimmed.match(/^\|.*\|$/)) {
      flushList();
      const cells = trimmed.split('|').filter(c => c.trim());
      if (trimmed.match(/^\|[\s:-]+\|[\s:-]+\|/)) continue;
      nodes.push(
        <div key={key++} className="flex gap-4 py-1.5 text-sm border-b border-white/5">
          {cells.map((cell, ci) => (
            <span key={ci} className="text-text-primary flex-1">{renderInline(cell.trim())}</span>
          ))}
        </div>
      );
      continue;
    }

    // Separator
    if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
      flushList();
      nodes.push(<div key={key++} className="gold-divider my-6" />);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      nodes.push(
        <blockquote key={key++} className="border-l-2 border-gold-primary/40 pl-4 text-text-secondary text-sm italic my-3 leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Inline code
    // Paragraph
    flushList();
    nodes.push(
      <p key={key++} className="text-text-primary text-sm leading-relaxed mb-3">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-gold-primary text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-gold-primary font-semibold">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      return (
        <Link key={i} href={linkMatch[2]} className="text-gold-primary hover:underline">
          {linkMatch[1]}
        </Link>
      );
    }
    return part;
  });
}

export function generateStaticParams() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md')).map(f => ({
    slug: f.replace(/\.md$/, ''),
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const result = getPost(params.slug);
  if (!result) {
    return { title: 'Post Not Found', robots: 'noindex' };
  }

  const { post } = result;
  const keywords = post.keywords ? post.keywords.split(',').map(k => k.trim()) : [];
  const canonicalUrl = `https://bornchart.app/blog/${params.slug}`;

  return {
    title: `${post.title} | FateWise Blog`,
    description: post.excerpt,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'FateWise',
      type: 'article',
      locale: 'en_US',
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const result = getPost(params.slug);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gold-primary mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-gold-primary hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { post, allSlugs } = result;
  const renderedContent = renderMarkdown(post.content);

  // Related posts (exclude current)
  const relatedPosts = allSlugs.filter(s => s !== params.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Article Header */}
      <section className="pt-32 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 starry-bg opacity-20" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <Link href="/blog" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm inline-block mb-6">
            ← Back to Blog
          </Link>
          <span className="text-xs text-gold-primary font-semibold uppercase tracking-widest bg-gold-primary/10 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl mt-6 mb-6 text-gold-glow leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-text-tertiary">
            <span>By <span className="text-text-secondary">{post.author}</span></span>
            <span>·</span>
            <span>{post.date}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-6 md:p-10 prose-invert">
            {renderedContent}
          </div>

          {/* Inline CTA */}
          <div className="mt-10 glass-card p-8 text-center">
            <h3 className="font-display text-lg font-bold text-gold-primary mb-3">
              Want to explore your own destiny?
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Get your free Bazi chart and discover the Four Pillars of your destiny.
            </p>
            <Link href="/bazi" className="btn-primary text-base px-10 py-3 inline-block">
              ✨ Get Your Free Bazi Chart
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-xl font-bold text-gold-primary mb-6 text-center">
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(slug => {
                const rel = getPost(slug);
                if (!rel) return null;
                const { post: rp } = rel;
                return (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="block glass-card p-5 hover:border-gold-primary/20 transition-all duration-300 group">
                    <span className="text-xs text-text-tertiary">{rp.date}</span>
                    <h3 className="font-display text-sm font-semibold text-text-primary group-hover:text-gold-primary transition-colors mt-2 leading-snug">
                      {rp.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gold-primary text-lg">✦</span>
            <span className="font-display font-semibold text-text-primary">FateWise</span>
          </div>
          <p className="text-text-tertiary text-sm mb-2">
            © 2026 ez-mystic · FateWise. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Disclaimer: The content on this website is for entertainment and educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
