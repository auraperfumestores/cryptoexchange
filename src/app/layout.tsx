import type { Metadata, Viewport } from 'next';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400','500','600','700','800','900'], display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400','600','700','800'], display: 'swap' });
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
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ background: 'var(--fr-black)', color: 'var(--fr-text-primary)', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
