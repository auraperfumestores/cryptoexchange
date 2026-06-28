import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { KycAdminPanel } from '@/components/admin/kyc-admin-panel';
import type { RateDocument } from '@/types';

export default async function AdminKycPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-1 text-2xl font-bold text-secondary">KYC Verification</h1>
        <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Review and manage customer identity verification requests.</p>
        <KycAdminPanel />
      </div>
    </ClientShell>
  );
}
