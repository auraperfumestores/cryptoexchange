import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog/posts';

export const metadata: Metadata = {
  title: 'Blog — USDT to INR Guides & Crypto Tips',
  description: 'Practical guides on converting USDT to INR, crypto tax rules in India, network fees, P2P risks, and the latest VDA regulations explained simply.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 96px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 15, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
        </Link>

        <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
          Blog
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', lineHeight: 1.8, maxWidth: 600, marginBottom: 48 }}>
          Guides and insights on converting USDT to INR, crypto tax in India, and navigating the regulatory landscape for virtual digital assets.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ display: 'block', padding: 28, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', borderRadius: 16, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                {post.tags.map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-lime)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</span>
                ))}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--fr-text-tertiary)', lineHeight: 1.7, marginBottom: 14 }}>{post.description}</p>
              <p style={{ fontSize: 12.5, color: 'var(--fr-text-tertiary)' }}>
                {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.readingMinutes} min read
              </p>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--fr-border-subtle)' }}>
          <Link href="/" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to SwappINR</Link>
        </div>
      </div>
    </div>
  );
}
