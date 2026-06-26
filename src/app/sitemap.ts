import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog/posts';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://swappinr.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '', '/about', '/careers', '/blog', '/refund-policy', '/terms', '/privacy', '/register', '/login',
  ].map(path => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const blogRoutes = BLOG_POSTS.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticRoutes, ...blogRoutes];
}
