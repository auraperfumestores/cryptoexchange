import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { KycAdminDetail } from '@/components/admin/kyc-admin-detail';
import type { RateDocument } from '@/types';

export default async function AdminKycDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <KycAdminDetail submissionId={params.id} />
    </ClientShell>
  );
}
