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
  let listType: 'ul' | 'ol' | null = null;
  // Table state tracking
  let tableHeaders: string[][] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  function flushList() {
    if (pendingList && pendingList.length > 0) {
      if (listType === 'ol') {
        nodes.push(
          <ol key={`ol-${key++}`} className="article-list-ordered">
            {pendingList}
          </ol>
        );
      } else {
        nodes.push(
          <ul key={`ul-${key++}`} className="article-list">
            {pendingList}
          </ul>
        );
      }
      pendingList = null;
      listType = null;
    }
  }

  function isListItem(line: string): { type: 'ul' | 'ol'; text: string } | null {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return { type: 'ul', text: line.slice(2) };
    }
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      return { type: 'ol', text: orderedMatch[2] };
    }
    return null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line → flush list, add spacer
    if (!trimmed) {
      flushList();
      nodes.push(<div key={key++} className="h-3" />);
      continue;
    }

    // H2
    if (trimmed.startsWith('## ') && !trimmed.startsWith('##[')) {
      flushList();
      nodes.push(
        <h2 key={key++} className="article-h2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3 key={key++} className="article-h3">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      // Collect consecutive blockquote lines
      let bqText = trimmed.slice(2);
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
        i++;
        bqText += '\n' + lines[i + 1]?.trim().slice(2) || '';
      }
      nodes.push(
        <blockquote key={key++} className="article-blockquote">
          {renderInline(bqText)}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    const ulItem = isListItem(trimmed);
    if (ulItem && ulItem.type === 'ul') {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      if (!pendingList) pendingList = [];
      pendingList.push(
        <li key={key++}>
          <span className="article-list-bullet">✦</span>
          <span>{renderInline(ulItem.text)}</span>
        </li>
      );
      continue;
    }

    // Ordered list
    const olItem = isListItem(trimmed);
    if (olItem && olItem.type === 'ol') {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      if (!pendingList) pendingList = [];
      pendingList.push(
        <li key={key++}>
          <span>{renderInline(olItem.text)}</span>
        </li>
      );
      continue;
    }

    // Table start
    if (trimmed.includes('|') && trimmed.match(/^\|.*\|$/) && !trimmed.match(/^\|[\s:-]+\|[\s:-]+\|/)) {
      flushList();
      const cells = trimmed.split('|').filter(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHeaders = [cells];
        tableRows = [];
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    // Table end (non-table line flushes the table)
    if (inTable) {
      inTable = false;
      const tableKey = key++;
      nodes.push(
        <div key={`tw-${tableKey}`} className="article-table-wrap">
          <table key={`t-${tableKey}`} className="article-table">
            <thead>
              <tr>
                {tableHeaders[0].map((cell, ci) => (
                  <th key={ci}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={`tr-${ri}`}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      continue;
    }

    // Separator
    if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
      flushList();
      nodes.push(<hr key={key++} className="article-divider" />);
      continue;
    }

    // Paragraph
    flushList();
    nodes.push(
      <p key={key++} className="article-p">
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
      return <code key={i} className="article-code">{part.slice(1, -1)}</code>;
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
      modifiedTime: post.date,
      authors: [post.author],
      section: post.category,
      images: [
        {
          url: `/og-blog-${params.slug}.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`/og-blog-${params.slug}.png`],
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

  // Detect lead paragraph: first <p> in rendered content
  let leadDetected = false;
  const processedContent = renderedContent.map((node, idx) => {
    if (!leadDetected && typeof node === 'object' && node !== null && 'type' in node && (node as any).type === 'p') {
      leadDetected = true;
      return <p key={idx} className="article-lead">{(node as any).children}</p>;
    }
    return node;
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Article Hero */}
      <section className="article-hero relative overflow-hidden">
        <div className="article-hero-bg" />
        <div className="article-hero-glow" style={{ top: '15%', left: '35%' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <Link href="/blog" className="text-text-tertiary hover:text-gold-primary transition-colors text-sm inline-block mb-6">
            ← Back to Blog
          </Link>

          {/* Language switch */}
          {(() => {
            const zhBlogDir = path.join(process.cwd(), 'content/blog/zh');
            const zhExists = fs.existsSync(path.join(zhBlogDir, `${params.slug}.md`));
            return zhExists ? (
              <div className="flex justify-center mb-4">
                <Link
                  href={`/zh/blog/${params.slug}`}
                  className="text-gold-primary border border-gold-primary/30 rounded-full px-4 py-1 text-sm hover:bg-gold-primary/10 transition">
                  阅读中文版本
                </Link>
              </div>
            ) : null;
          })()}

          {/* Category tag */}
          <span className="blog-card-category">{post.category}</span>

          {/* Title */}
          <h1 className="article-title">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="article-meta">
            <span>FateWise Team</span>
            <span className="article-meta-sep">·</span>
            <span>{post.date}</span>
            <span className="article-meta-sep">·</span>
            <span>{(() => {
              const bodyStart = post.content.indexOf('\n\n');
              const body = bodyStart > 0 ? post.content.slice(bodyStart + 2) : '';
              const wordCount = body.split(/\s+/).length;
              return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
            })()}</span>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="article-body">
        <div className="article-body-inner">
          <div className="glass-card" style={{ padding: '32px 40px' }}>
            {processedContent}
          </div>

          {/* Inline CTA — styled with article-cta class */}
          <div className="article-cta">
            <h3 className="article-cta-title">
              Want to explore your own destiny?
            </h3>
            <p className="article-cta-desc">
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
        <section className="related-section">
          <div className="max-w-6xl mx-auto">
            <h2 className="related-title">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(slug => {
                const rel = getPost(slug);
                if (!rel) return null;
                const { post: rp } = rel;
                return (
                  <Link
                    key={slug}
                    href={`/blog/${slug}`}
                    className="blog-card group"
                    style={{ padding: '20px' }}>
                    <span className="blog-card-date">{rp.date}</span>
                    <h3 className="blog-card-title" style={{ fontSize: '17px', marginBottom: 6 }}>
                      {rp.title}
                    </h3>
                    <span className="blog-card-cta" style={{ fontSize: '13px' }}>
                      Read more <span className="blog-card-arrow">→</span>
                    </span>
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
            © 2026 BornChart · FateWise. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Disclaimer: The content on this website is for entertainment and educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
