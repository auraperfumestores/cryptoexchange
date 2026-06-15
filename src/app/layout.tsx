import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'SwapINR — USDT to Indian Rupees Exchange',
  description: 'The fastest way to convert USDT to INR. Settle via UPI, bank transfer, or cash. Live rates, zero hidden fees.',
  keywords: ['USDT', 'INR', 'crypto exchange', 'India', 'UPI', 'buy USDT', 'sell USDT'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
