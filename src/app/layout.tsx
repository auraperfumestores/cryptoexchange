import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import PageLoader from '@/components/ui/page-loader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500','600','700','800'], display: 'swap' });

export const metadata: Metadata = {
  title: 'SwapINR — USDT to Indian Rupees Exchange',
  description: 'The fastest way to convert USDT to INR. Settle via UPI, bank transfer, or cash. Live rates, zero hidden fees.',
  keywords: ['USDT', 'INR', 'crypto exchange', 'India', 'UPI', 'buy USDT', 'sell USDT'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ background: 'var(--fr-black)', color: 'var(--fr-text-primary)', minHeight: '100vh', fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
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
