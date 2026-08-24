import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { ReferralPageClient } from '@/components/referrals/referral-page-client';

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Referrals</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--fr-text-secondary)' }}>Invite friends and earn USDT together.</p>
        <ReferralPageClient />
      </div>
    </ClientShell>
  );
}
