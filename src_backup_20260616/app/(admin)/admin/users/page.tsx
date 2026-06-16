import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, User, rateToDocument, userToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { UserManager } from '@/components/admin/user-manager';
import type { RateDocument, UserDocument } from '@/types';

export default async function AdminUsersPage({ searchParams }: { searchParams: { page?: string; search?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const limit = 20;
  const search = searchParams.search || '';

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total, rates] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-secondary">Users</h1>
        <UserManager
          users={users.map(userToDocument) as UserDocument[]}
          total={total}
          page={page}
          totalPages={Math.ceil(total / limit)}
          search={search}
        />
      </div>
    </ClientShell>
  );
}