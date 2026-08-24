import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User, Referral, getReferralSettings } from '@/lib/db';
import { errorResponse, forbidden, notFound, badRequest } from '@/lib/utils/errors';
import { sendKycApprovedEmail, sendKycRejectedEmail, sendReferralBonusEmail } from '@/lib/email';
import { creditPlatformWallet } from '@/lib/wallet/platform-wallet';
import { notifyAdminReferralReward } from '@/lib/notifications/admin';

export const dynamic = 'force-dynamic';

/** POST /api/admin/kyc/[id]/decision — approve or reject a pending submission.
 *  Rejection requires a reason, which the client sees on their status screen. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    const { action, reason } = (await req.json()) as { action?: 'verify' | 'reject'; reason?: string };
    if (action !== 'verify' && action !== 'reject') return badRequest('Invalid action');
    if (action === 'reject' && !reason?.trim()) return badRequest('A rejection reason is required');

    await connectToDatabase();

    const submission = await KycSubmission.findById(params.id).lean();
    if (!submission) return notFound('Submission not found');
    if (submission.status !== 'pending_review') return badRequest('Submission is not awaiting review');

    const nextStatus = action === 'verify' ? 'verified' : 'rejected';

    const update: Record<string, unknown> = {
      $set: {
        status: nextStatus,
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        reviewedByName: admin.name,
      },
    };
    if (action === 'reject') {
      (update.$set as Record<string, unknown>).rejectionReason = reason!.trim();
    } else {
      update.$unset = { rejectionReason: 1 };
    }

    const updated = await KycSubmission.findByIdAndUpdate(params.id, update, { new: true }).lean();

    const targetUser = await User.findByIdAndUpdate(submission.userId, { kycStatus: nextStatus }, { new: true })
      .select('name email referredBy')
      .lean();

    if (targetUser) {
      try {
        if (action === 'verify') {
          await sendKycApprovedEmail(targetUser.email, targetUser.name);
        } else {
          await sendKycRejectedEmail(targetUser.email, targetUser.name, reason!.trim());
        }
      } catch (e) {
        console.error('[kyc] Failed to send decision email', e);
      }

      // Referral reward — fires once, only for users who signed up via a referral link,
      // gated on their KYC being approved. Never blocks the KYC decision itself.
      if (action === 'verify' && targetUser.referredBy) {
        try {
          await creditReferralReward(String(targetUser.referredBy), String(submission.userId), targetUser.name, targetUser.email);
        } catch (e) {
          console.error('[kyc] Referral reward credit failed:', e);
        }
      }
    }

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Credits both sides of a referral reward once the referee's KYC is approved.
 *  Idempotent — only acts on a Referral doc still in 'pending' status, and the
 *  unique index on Referral.refereeId means there is at most one such doc per user. */
async function creditReferralReward(referrerId: string, refereeId: string, refereeName: string, refereeEmail: string) {
  const settings = await getReferralSettings();
  if (!settings.enabled) return;

  const referral = await Referral.findOne({ refereeId, status: 'pending' });
  if (!referral) return;

  // Anti-abuse throttle — if a referrer has already been paid out
  // maxRewardsPerReferrerPerDay times in the last 24h, skip and leave this
  // Referral doc pending for an admin to review/approve manually.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRewards = await Referral.countDocuments({ referrerId, status: 'rewarded', rewardedAt: { $gte: since } });
  if (recentRewards >= settings.maxRewardsPerReferrerPerDay) {
    console.warn('[kyc/referral] daily cap reached for referrer', referrerId);
    return;
  }

  const referrer = await User.findById(referrerId).select('name email').lean();
  if (!referrer) return;

  await creditPlatformWallet(referrerId, settings.referrerRewardUsdt, `Referral bonus — you referred ${refereeName}`, 'system');
  if (settings.refereeRewardUsdt > 0) {
    await creditPlatformWallet(refereeId, settings.refereeRewardUsdt, 'Referral bonus — signed up via referral', 'system');
  }

  referral.status = 'rewarded';
  referral.rewardedAt = new Date();
  referral.referrerRewardUsdt = settings.referrerRewardUsdt;
  referral.refereeRewardUsdt = settings.refereeRewardUsdt;
  await referral.save();

  try {
    await sendReferralBonusEmail(referrer.email, referrer.name, 'referrer', settings.referrerRewardUsdt, refereeName);
    if (settings.refereeRewardUsdt > 0) {
      await sendReferralBonusEmail(refereeEmail, refereeName, 'referee', settings.refereeRewardUsdt, referrer.name);
    }
  } catch (e) {
    console.error('[kyc/referral] reward email failed:', e);
  }

  notifyAdminReferralReward({
    referrerName: referrer.name,
    referrerEmail: referrer.email,
    refereeName,
    refereeEmail,
    referrerRewardUsdt: settings.referrerRewardUsdt,
    refereeRewardUsdt: settings.refereeRewardUsdt,
  }).catch(e => console.error('[admin-notify] referral reward:', e));
}
