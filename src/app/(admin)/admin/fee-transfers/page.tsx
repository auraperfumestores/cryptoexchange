import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, rateToDocument, FeeTransfer, feeTransferToDocument, User, Wallet } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { FeeTransfersTable } from '@/components/admin/fee-transfers-table';
import type { RateDocument } from '@/types';

function networkChainId(network: string) {
  return network === 'ERC20' ? 1 : network === 'BEP20' ? 56 : 195;
}

export default async function AdminFeeTransfersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();

  const [feeTransferDocs, rates] = await Promise.all([
    FeeTransfer.find({}).sort({ createdAt: -1 }).limit(100).lean(),
    Rate.find({}).sort({ symbol: 1 }).lean(),
  ]);

  const userIds = Array.from(new Set(feeTransferDocs.map(d => String(d.userId))));
  const [users, walletDocs] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select('name email').lean(),
    Wallet.find({ userId: { $in: userIds } }).select('userId address chainId approved').lean(),
  ]);

  const userById = new Map(users.map(u => [String(u._id), { name: u.name as string, email: u.email as string }]));
  const walletByKey = new Map(
    walletDocs.map(w => [`${String(w.userId)}:${(w.address as string).toLowerCase()}:${w.chainId}`, !!w.approved]),
  );

  const rows = feeTransferDocs.map(d => {
    const doc = feeTransferToDocument(d);
    const customer = userById.get(doc.userId);
    const key = `${doc.userId}:${doc.toAddress.toLowerCase()}:${networkChainId(doc.network)}`;
    const approved = walletByKey.has(key) ? walletByKey.get(key)! : null;
    return {
      ...doc,
      customerName: customer?.name ?? 'Unknown',
      customerEmail: customer?.email ?? '—',
      walletApproved: approved,
    };
  });

  const totalSent = feeTransferDocs.filter(d => d.status === 'sent').reduce((sum, d) => sum + (d.amountNative || 0), 0);

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary">Fee Transfers</h1>
          <p className="text-sm text-muted">Network-fee (gas) top-ups sent to user wallets so they can sign the smart-contract approval, with customer identity and wallet approval status.</p>
        </div>
        <FeeTransfersTable rows={rows} totalSent={totalSent} />
      </div>
    </ClientShell>
  );
}
