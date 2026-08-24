import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { ReferralManager } from '@/components/admin/referral-manager';
import type { RateDocument } from '@/types';

export default async function AdminReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-1 text-2xl font-bold text-secondary">Referrals</h1>
        <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Configure the referral program and review every referral relationship on the platform.
        </p>
        <ReferralManager />
      </div>
    </ClientShell>
  );
}
