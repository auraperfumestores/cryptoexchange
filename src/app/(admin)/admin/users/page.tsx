import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, User, Wallet, rateToDocument, userToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { UserManager } from '@/components/admin/user-manager';
import type { RateDocument, UserDocument } from '@/types';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; sort?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();

  const page   = Math.max(1, parseInt(searchParams.page  || '1'));
  const limit  = 20;
  const search = searchParams.search || '';
  const sort   = searchParams.sort   || 'newest';

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  let users: any[];
  let total: number;
  let walletBalances: Record<string, number> = {};

  if (sort === 'balanceDesc' || sort === 'balanceAsc') {
    const sortDir = sort === 'balanceDesc' ? -1 : 1;

    // Aggregate max lastKnownBalance per user across all their wallets
    const balanceAgg: { _id: any; maxBalance: number }[] = await Wallet.aggregate([
      { $match: { lastKnownBalance: { $exists: true, $ne: null } } },
      { $group: { _id: '$userId', maxBalance: { $max: '$lastKnownBalance' } } },
      { $sort: { maxBalance: sortDir } },
    ]);

    // Apply search filter if needed
    let eligibleIds: any[] = balanceAgg.map(b => b._id);
    if (search) {
      const matching = await User.find(filter).select('_id').lean<{ _id: any }[]>();
      const matchSet = new Set(matching.map(u => String(u._id)));
      const filtered = balanceAgg.filter(b => matchSet.has(String(b._id)));
      eligibleIds = filtered.map(b => b._id);
    }

    total = eligibleIds.length;
    const pagedIds = eligibleIds.slice((page - 1) * limit, page * limit);

    // Build balance lookup
    const aggMap = new Map(balanceAgg.map(b => [String(b._id), b.maxBalance]));
    walletBalances = Object.fromEntries(pagedIds.map(id => [String(id), aggMap.get(String(id)) ?? 0]));

    // Fetch users in any order, then re-sort to match balance order
    const rawUsers = await User.find({ _id: { $in: pagedIds } }).select('-password').lean<any[]>();
    const userMap  = new Map(rawUsers.map(u => [String(u._id), u]));
    users = pagedIds.map(id => userMap.get(String(id))).filter(Boolean);
  } else {
    const sortDir = sort === 'oldest' ? 1 : -1;
    [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: sortDir }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
  }

  const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();

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
          sort={sort}
          walletBalances={walletBalances}
        />
      </div>
    </ClientShell>
  );
}
