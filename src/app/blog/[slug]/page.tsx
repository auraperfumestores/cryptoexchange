import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog/posts';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://swappinr.com';

function renderInline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--fr-text-primary)', fontWeight: 700 }}>{part}</strong> : part,
  );
}

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} — SwappINR Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'SwappINR' },
    publisher: { '@type': 'Organization', name: 'SwappINR' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 96px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 15, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {post.tags.map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-lime)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</span>
          ))}
        </div>

        <h1 style={{ fontSize: 'clamp(28px,4.5vw,42px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', marginBottom: 40 }}>
          {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readingMinutes} min read
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {post.content.map((p, i) => (
            <p key={i} style={{ fontSize: 15.5, color: 'var(--fr-text-secondary)', lineHeight: 1.85 }}>{renderInline(p)}</p>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--fr-border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/blog" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to Blog</Link>
          <Link href="/" style={{ color: 'var(--fr-text-tertiary)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>SwappINR Home</Link>
        </div>
      </div>
    </div>
  );
}
