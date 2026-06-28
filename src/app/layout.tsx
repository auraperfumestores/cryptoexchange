import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import PageLoader from '@/components/ui/page-loader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500','600','700','800'], display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://swappinr.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'USDT to INR Exchange in India | SwappINR',
    template: '%s | SwappINR',
  },
  description: 'Convert USDT to INR in under 15 minutes. Live rates, zero hidden fees, instant UPI/bank settlement. Supports TRC-20, BEP-20 and ERC-20 networks in India.',
  keywords: [
    'USDT to INR', 'sell USDT for INR', 'buy USDT India', 'crypto to INR exchange',
    'USDT INR converter', 'Tether to rupees', 'crypto exchange India', 'UPI crypto payout',
    'TRC-20 USDT', 'BEP-20 USDT', 'ERC-20 USDT', 'P2P USDT INR',
  ],
  authors: [{ name: 'SwappINR' }],
  creator: 'SwappINR',
  publisher: 'SwappINR',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'SwappINR',
    title: 'USDT to INR Exchange in India | SwappINR',
    description: 'Convert USDT to INR in under 15 minutes. Live rates, zero hidden fees, instant UPI/bank settlement.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'USDT to INR Exchange in India | SwappINR',
    description: 'Convert USDT to INR in under 15 minutes. Live rates, zero hidden fees, instant UPI payouts.',
  },
  category: 'finance',
};

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SwappINR',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description: 'SwappINR is India\'s USDT-to-INR exchange platform, enabling fast conversion of USDT (Tether) to Indian Rupees via UPI, bank transfer, and cash settlement.',
  areaServed: { '@type': 'Country', name: 'India' },
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SwappINR',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Makes the layout viewport itself shrink when the on-screen keyboard opens
  // (instead of only the visual viewport), so fixed-position sheets and their
  // dvh-based inner content stay in sync during the keyboard transition —
  // fixes the "half black screen" flash on Android/iOS when tapping an input.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ background: 'var(--fr-black)', color: 'var(--fr-text-primary)', minHeight: '100vh', fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }} />
        <PageLoader />
        {/* Noise texture overlay — film-grain depth at 3% opacity */}
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99997,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat', opacity: 0.03,
        }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
