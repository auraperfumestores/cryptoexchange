import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog/posts';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://swappinr.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                                       lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    // ── SEO landing pages ──
    { url: `${SITE_URL}/sell-usdt-for-inr`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${SITE_URL}/buy-usdt-with-inr`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${SITE_URL}/usdt-to-inr`,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.95 },
    { url: `${SITE_URL}/usdt-to-inr-calculator`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/trc20-usdt-to-inr`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/bep20-usdt-to-inr`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/fees`,                             lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    { url: `${SITE_URL}/how-to-sell-usdt-in-india`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/sell-usdt-without-kyc`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.88 },
    { url: `${SITE_URL}/buy-usdt-without-kyc`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.88 },
    { url: `${SITE_URL}/sell-usdt-for-cash`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/buy-usdt-with-upi`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
    // ── Core pages ──
    { url: `${SITE_URL}/register`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9  },
    { url: `${SITE_URL}/blog`,                            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
    { url: `${SITE_URL}/about`,                           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/login`,                           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/careers`,                         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4  },
    { url: `${SITE_URL}/terms`,                           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SITE_URL}/privacy`,                         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
    { url: `${SITE_URL}/refund-policy`,                   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3  },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
