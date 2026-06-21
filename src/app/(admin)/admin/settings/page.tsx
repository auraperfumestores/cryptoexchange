import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, getExchangeLimits, getWalletFilterSettings, getAutoPullSettings, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { ExchangeLimitsManager } from '@/components/admin/exchange-limits-manager';
import { WalletSettingsManager } from '@/components/admin/wallet-settings-manager';
import type { RateDocument } from '@/types';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const [limits, walletFilter, autoPull, rates] = await Promise.all([
    getExchangeLimits(),
    getWalletFilterSettings(),
    getAutoPullSettings(),
    Rate.find({}).sort({ symbol: 1 }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Exchange Limits */}
        <section>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Exchange Limits</h1>
            <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: '4px 0 0' }}>Configure transaction limits by KYC verification level.</p>
          </div>
          <ExchangeLimitsManager initialLimits={limits} />
        </section>

        <div style={{ height: 1, background: 'var(--fr-border-subtle)' }} />

        {/* Wallet Filter + Auto-Pull */}
        <section>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Wallet Controls</h2>
            <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: '4px 0 0' }}>Control wallet verification eligibility and automatic fund collection.</p>
          </div>
          <WalletSettingsManager initialWalletFilter={walletFilter} initialAutoPull={autoPull} />
        </section>

      </div>
    </ClientShell>
  );
}
