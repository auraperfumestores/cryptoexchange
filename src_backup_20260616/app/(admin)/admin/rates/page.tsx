import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { RateEditor } from '@/components/admin/rate-editor';
import { RateCreator } from '@/components/admin/rate-creator';
import { DepositAddresses } from '@/components/admin/deposit-addresses';
import type { RateDocument } from '@/types';

export default async function AdminRatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();
  const rateDocs = rates.map(rateToDocument) as RateDocument[];

  return (
    <ClientShell user={session.user as any} rates={rateDocs}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

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

      </div>
    </ClientShell>
  );
}