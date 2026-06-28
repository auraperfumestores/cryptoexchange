import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, User, userToDocument, WithdrawalRequest, PlatformWallet } from '@/lib/db';
import { errorResponse, forbidden, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/withdrawals/[id] — full detail for one withdrawal request:
 *  the owning user's profile and their platform-wallet balance/recent ledger,
 *  so the reviewing admin has the context to decide refund vs. forfeit. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    await connectToDatabase();

    const withdrawal = await WithdrawalRequest.findById(params.id).lean();
    if (!withdrawal) return notFound('Withdrawal request not found');

    const [user, pw] = await Promise.all([
      User.findById(withdrawal.userId).select('-password').lean(),
      PlatformWallet.findOne({ userId: withdrawal.userId }).lean(),
    ]);
    if (!user) return notFound('User not found');

    const recentTransactions = ((pw as any)?.transactions ?? [])
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((t: any) => ({ type: t.type, amount: t.amount, note: t.note, addedBy: t.addedBy, createdAt: t.createdAt }));

    return NextResponse.json({
      success: true,
      data: {
        withdrawal: {
          _id: String(withdrawal._id),
          amount: withdrawal.amount,
          network: withdrawal.network,
          chainId: withdrawal.chainId,
          toAddress: withdrawal.toAddress,
          networkFee: withdrawal.networkFee,
          status: withdrawal.status,
          txHash: withdrawal.txHash,
          explorerUrl: withdrawal.explorerUrl,
          adminNotes: withdrawal.adminNotes,
          rejectionReason: withdrawal.rejectionReason,
          refunded: withdrawal.refunded,
          processedByName: withdrawal.processedByName,
          processedAt: withdrawal.processedAt,
          createdAt: withdrawal.createdAt,
          updatedAt: withdrawal.updatedAt,
        },
        user: userToDocument(user),
        wallet: { balance: (pw as any)?.balance ?? 0, recentTransactions },
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
