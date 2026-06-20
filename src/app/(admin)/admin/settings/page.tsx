import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, getExchangeLimits, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { ExchangeLimitsManager } from '@/components/admin/exchange-limits-manager';
import type { RateDocument } from '@/types';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const [limits, rates] = await Promise.all([
    getExchangeLimits(),
    Rate.find({}).sort({ symbol: 1 }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Platform Settings</h1>
          <p style={{ fontSize: 14, color: 'var(--fr-text-tertiary)', margin: '5px 0 0' }}>Configure exchange limits by KYC verification level.</p>
        </div>
        <ExchangeLimitsManager initialLimits={limits} />
      </div>
    </ClientShell>
  );
}
