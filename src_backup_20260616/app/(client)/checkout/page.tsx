import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { CheckoutFlow } from './CheckoutFlow';

function LoadingState() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Loading…</div>
    </div>
  );
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <Suspense fallback={<LoadingState />}>
        <CheckoutFlow />
      </Suspense>
    </ClientShell>
  );
}
