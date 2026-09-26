import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { SpinWheel } from '@/components/spin/spin-wheel';
import { connectToDatabase, isSpinHiddenFromUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SpinPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  // Hidden by admin: behave as if the page doesn't exist for users.
  await connectToDatabase();
  if (await isSpinHiddenFromUsers()) redirect('/dashboard');

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <SpinWheel />
    </ClientShell>
  );
}
