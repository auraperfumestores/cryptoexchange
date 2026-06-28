import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';
import { connectToDatabase, ensureKycLinkToken } from '@/lib/db';
import { KycFlow } from '@/components/kyc/kyc-flow';

export default async function KycPage({ params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?next=/kyc/${params.token}`);

  await connectToDatabase();
  const ownToken = await ensureKycLinkToken((session.user as any).id);
  if (ownToken !== params.token) redirect('/settings');

  return <KycFlow token={params.token} />;
}
