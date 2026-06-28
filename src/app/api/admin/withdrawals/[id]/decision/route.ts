import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, User, WithdrawalRequest, PlatformWallet } from '@/lib/db';
import { errorResponse, forbidden, notFound, badRequest } from '@/lib/utils/errors';
import { sendWithdrawalCompletedEmail, sendWithdrawalRejectedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/** POST /api/admin/withdrawals/[id]/decision — approve or reject a pending
 *  withdrawal request. Treasury funds are never moved automatically: an
 *  admin sends the on-chain payout manually outside this app, then approves
 *  here by recording the transaction hash and explorer link as proof.
 *  Rejection requires a reason and an explicit refund choice — whether the
 *  amount already debited from the user's platform wallet is credited back. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    const body = (await req.json()) as {
      action?: 'approve' | 'reject';
      txHash?: string;
      explorerUrl?: string;
      reason?: string;
      refund?: boolean;
    };
    const { action, txHash, explorerUrl, reason, refund } = body;

    if (action !== 'approve' && action !== 'reject') return badRequest('Invalid action');
    if (action === 'approve') {
      if (!txHash?.trim()) return badRequest('Transaction hash is required');
      if (!explorerUrl?.trim()) return badRequest('Blockchain explorer link is required');
      try { new URL(explorerUrl.trim()); } catch { return badRequest('Enter a valid explorer URL'); }
    }
    if (action === 'reject') {
      if (!reason?.trim()) return badRequest('A rejection reason is required');
      if (typeof refund !== 'boolean') return badRequest('Specify whether to refund the user');
    }

    await connectToDatabase();

    const withdrawal = await WithdrawalRequest.findById(params.id);
    if (!withdrawal) return notFound('Withdrawal request not found');
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return badRequest('This withdrawal request has already been processed');
    }

    const user = await User.findById(withdrawal.userId).select('name email').lean();
    if (!user) return notFound('User not found');

    const withdrawalInfo = { amount: withdrawal.amount, network: withdrawal.network, toAddress: withdrawal.toAddress };

    if (action === 'approve') {
      withdrawal.status = 'completed';
      withdrawal.txHash = txHash!.trim();
      withdrawal.explorerUrl = explorerUrl!.trim();
      withdrawal.processedBy = admin.id as any;
      withdrawal.processedByName = admin.name;
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      try {
        await sendWithdrawalCompletedEmail(user.email, user.name, withdrawalInfo, withdrawal.txHash, withdrawal.explorerUrl);
      } catch (e) {
        console.error('[withdrawals] Failed to send completion email', e);
      }
    } else {
      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = reason!.trim();
      withdrawal.refunded = refund;
      withdrawal.processedBy = admin.id as any;
      withdrawal.processedByName = admin.name;
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      if (refund) {
        const pw = await PlatformWallet.findOne({ userId: withdrawal.userId });
        if (pw) {
          pw.balance += withdrawal.amount;
          pw.transactions.push({
            type: 'credit',
            amount: withdrawal.amount,
            note: `Refund for rejected withdrawal request`,
            addedBy: 'admin',
            createdAt: new Date(),
          } as any);
          await pw.save();
        }
      }

      try {
        await sendWithdrawalRejectedEmail(user.email, user.name, withdrawalInfo, withdrawal.rejectionReason!, !!refund);
      } catch (e) {
        console.error('[withdrawals] Failed to send rejection email', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: String(withdrawal._id),
        status: withdrawal.status,
        txHash: withdrawal.txHash,
        explorerUrl: withdrawal.explorerUrl,
        rejectionReason: withdrawal.rejectionReason,
        refunded: withdrawal.refunded,
        processedByName: withdrawal.processedByName,
        processedAt: withdrawal.processedAt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
