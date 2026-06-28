import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a Free Account',
  description: 'Create a free SwappINR account to start converting USDT to INR in minutes, with KYC verification, live rates, and zero hidden fees.',
  alternates: { canonical: '/register' },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
