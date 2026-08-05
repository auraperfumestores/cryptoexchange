import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument, getScheduledRateSettings, getAutoScheduleConfig } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { RateEditor } from '@/components/admin/rate-editor';
import { RateCreator } from '@/components/admin/rate-creator';
import { DepositAddresses } from '@/components/admin/deposit-addresses';
import { ScheduledRatesManager } from '@/components/admin/scheduled-rates-manager';
import type { RateDocument } from '@/types';

export default async function AdminRatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const [rates, scheduledOverrides, autoScheduleConfig] = await Promise.all([
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
    getScheduledRateSettings(),
    getAutoScheduleConfig(),
  ]);
  const rateDocs = rates.map(rateToDocument) as RateDocument[];

  return (
    <ClientShell user={session.user as any} rates={rateDocs}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Exchange Rates</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '5px 0 0' }}>
              Set buy/sell rates per network. Changes are logged with reason.
            </p>
          </div>
          <RateCreator />
        </div>

        {/* Deposit addresses — critical for sell flow & wallet verification */}
        <DepositAddresses rates={rateDocs} />

        {/* Rate cards */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>Rate Configuration</h2>
          <RateEditor rates={rateDocs} />
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

        {/* Scheduled Rate Overrides */}
        <section>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Scheduled Rate Overrides</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '5px 0 0' }}>
              Pin an exact rate for any network/type during a specific time window. Activates and reverts automatically.
            </p>
          </div>
          <ScheduledRatesManager initialSettings={scheduledOverrides} initialAutoConfig={autoScheduleConfig} />
        </section>

      </div>
    </ClientShell>
  );
}