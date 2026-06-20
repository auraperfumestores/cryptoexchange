import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { ProfileContent } from './ProfileContent';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const u = session.user as any;

  return (
    <ClientShell user={u} rates={[]}>
      <ProfileContent user={{
        name:          u.name,
        email:         u.email,
        role:          u.role,
        kycStatus:     u.kycStatus ?? 'unverified',
        username:      u.username ?? '',
        avatarUrl:     u.avatarUrl ?? '',
        createdAt:     u.createdAt,
      }} />
    </ClientShell>
  );
}
