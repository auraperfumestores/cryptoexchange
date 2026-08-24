import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-auth';
import { connectToDatabase, Referral } from '@/lib/db';
import { errorResponse, notFound, badRequest } from '@/lib/utils/errors';
import { debitPlatformWallet } from '@/lib/wallet/platform-wallet';

export const dynamic = 'force-dynamic';

/** POST /api/admin/referrals/[id]/void — reverses a referral. If it was already
 *  rewarded, both credited amounts are clawed back from the respective platform
 *  wallets (e.g. after a refunded/disputed KYC or a detected abuse case). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { reason } = (await req.json()) as { reason?: string };
    if (!reason?.trim()) return badRequest('A reason is required to void a referral');

    await connectToDatabase();
    const referral = await Referral.findById(params.id);
    if (!referral) return notFound('Referral not found');
    if (referral.status === 'void') return badRequest('Referral is already void');

    if (referral.status === 'rewarded') {
      if (referral.referrerRewardUsdt) {
        await debitPlatformWallet(referral.referrerId, referral.referrerRewardUsdt, `Referral reward reversed — ${reason.trim()}`, 'admin');
      }
      if (referral.refereeRewardUsdt) {
        await debitPlatformWallet(referral.refereeId, referral.refereeRewardUsdt, `Referral reward reversed — ${reason.trim()}`, 'admin');
      }
    }

    referral.status = 'void';
    referral.voidReason = reason.trim();
    await referral.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
