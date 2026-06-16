import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, Transaction, rateToDocument, transactionToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { AdminTransactionTable } from '@/components/admin/admin-transaction-table';
import type { RateDocument, TransactionDocument } from '@/types';

export default async function AdminTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();
  const [rates, transactions] = await Promise.all([
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
    Transaction.find({}).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-secondary">Manage orders</h1>
        <AdminTransactionTable transactions={transactions.map(transactionToDocument) as TransactionDocument[]} />
      </div>
    </ClientShell>
  );
}