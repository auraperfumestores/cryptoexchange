import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { ProfileContent } from './ProfileContent';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <ProfileContent user={session.user as any} />
    </ClientShell>
  );
}
