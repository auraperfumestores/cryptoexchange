import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User, userToDocument, Wallet, walletToDocument } from '@/lib/db';
import { errorResponse, forbidden, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/kyc/[id] — full detail for one KYC submission: the
 *  document images, the owning user's profile, and their on-record wallets
 *  (live on-chain balances are fetched client-side via /api/admin/wallet-info,
 *  same as the Users admin section, to avoid duplicating that RPC logic). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    await connectToDatabase();

    const submission = await KycSubmission.findById(params.id).lean();
    if (!submission) return notFound('Submission not found');

    const [user, wallets] = await Promise.all([
      User.findById(submission.userId).select('-password').lean(),
      Wallet.find({ userId: submission.userId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (!user) return notFound('User not found');

    return NextResponse.json({
      success: true,
      data: {
        submission: kycSubmissionToDocument(submission),
        user: userToDocument(user),
        wallets: wallets.map(walletToDocument),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
