import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Transaction, PaymentMethod, Rate, transactionToDocument, paymentMethodToDocument, rateToDocument } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ClientShell } from '@/components/layout/client-shell';
import { TransactionDetail } from '@/components/client/transaction-detail';
import type { RateDocument, TransactionDocument, PaymentMethodDocument } from '@/types';

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  await connectToDatabase();

  const tx = await Transaction.findById(params.id).lean();
  if (!tx) notFound();

  // Only allow owner or admin to view
  if (String(tx.userId) !== session.user.id && session.user.role !== 'admin') {
    notFound();
  }

  const txDoc = transactionToDocument(tx) as TransactionDocument;

  let paymentMethod: PaymentMethodDocument | undefined;
  if (txDoc.paymentMethodId) {
    const pm = await PaymentMethod.findById(txDoc.paymentMethodId).lean();
    if (pm) paymentMethod = paymentMethodToDocument(pm) as PaymentMethodDocument;
  }

  const rates = await Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean();

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-secondary">Order {txDoc.orderId}</h1>
        <TransactionDetail
          tx={txDoc}
          paymentMethod={paymentMethod}
          currentUserRole={session.user.role as any}
          isOwner={String(tx.userId) === session.user.id}
        />
      </div>
    </ClientShell>
  );
}