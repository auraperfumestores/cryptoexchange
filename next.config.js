/** @type {import('next').NextConfig} */

/** @type {import('next').NextConfig} */

// Resolves the single stable canonical URL for this deployment.
//
// Priority order (highest → lowest):
//   1. VERCEL_PROJECT_PRODUCTION_URL  — Vercel system var: the stable production alias
//      (e.g. cryptoexchange-sahil-s-projectsss.vercel.app). Never changes between deploys.
//   2. NEXTAUTH_URL set to a non-localhost value — explicit user override (custom domain etc.)
//   3. VERCEL_URL — the per-deployment URL (changes each push, last resort for previews)
//   4. localhost fallback for local dev
//
// DO NOT set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL to a hash URL in Vercel dashboard.
// Set NEXTAUTH_URL to the stable alias from step 1 or a custom domain, then leave it.
function resolveAppUrl() {
  // Vercel auto-sets this to the stable production domain — never hash-based
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  // Explicit env — only trust it if it isn't a localhost value
  const explicit = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit && !explicit.startsWith('http://localhost')) return explicit;

  // Per-deployment URL (still correct for the current preview, just not stable across deploys)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return 'http://localhost:3000';
}

const APP_URL = resolveAppUrl();
console.log('[next.config] Resolved APP_URL:', APP_URL);

const nextConfig = {
  reactStrictMode: true,
  // Bake the resolved URL at build time so NextAuth + emails are always correct.
  // These override whatever is in the Vercel dashboard for NEXTAUTH_URL and NEXT_PUBLIC_APP_URL.
  env: {
    NEXTAUTH_URL: APP_URL,
    NEXT_PUBLIC_APP_URL: APP_URL,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
