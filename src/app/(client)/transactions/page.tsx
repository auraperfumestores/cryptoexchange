import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Transaction, transactionToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { UserHistory } from '@/components/client/user-history';
import type { TransactionDocument } from '@/types';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  await connectToDatabase();
  const rows = await Transaction.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  const transactions = rows.map(transactionToDocument) as TransactionDocument[];

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
            Trade History
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            All your USDT ↔ INR exchange orders
          </p>
        </div>

        <UserHistory transactions={transactions} />
      </div>
    </ClientShell>
  );
}
