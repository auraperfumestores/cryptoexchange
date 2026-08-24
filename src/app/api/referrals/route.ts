import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, Referral, User, getReferralSettings, ensureReferralCode } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/referrals — the current user's referral code/link, stats, and a
 *  privacy-conscious list of who they've referred (first name + status only). */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    // Generates + persists the code on first access, so accounts that predate the
    // referral program still get a working link instead of an empty box.
    const [referralCode, settings, referrals] = await Promise.all([
      ensureReferralCode(auth.id, auth.name),
      getReferralSettings(),
      Referral.find({ referrerId: auth.id }).sort({ createdAt: -1 }).lean(),
    ]);

    const refereeIds = referrals.map(r => r.refereeId);
    const referees = await User.find({ _id: { $in: refereeIds } }).select('name').lean();
    const nameMap = new Map(referees.map(u => [String(u._id), u.name]));

    const rewardedCount = referrals.filter(r => r.status === 'rewarded').length;
    const totalEarnedUsdt = referrals.reduce((s, r) => s + (r.referrerRewardUsdt ?? 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        enabled: settings.enabled,
        referrerRewardUsdt: settings.referrerRewardUsdt,
        refereeRewardUsdt: settings.refereeRewardUsdt,
        stats: {
          totalReferred: referrals.length,
          pending: referrals.filter(r => r.status === 'pending').length,
          rewarded: rewardedCount,
          totalEarnedUsdt,
        },
        referrals: referrals.map(r => ({
          _id: String(r._id),
          // First name only — full name/email of a referred friend isn't the referrer's to see.
          name: (nameMap.get(String(r.refereeId)) ?? 'A friend').split(' ')[0],
          status: r.status,
          createdAt: new Date((r as any).createdAt).toISOString(),
        })),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
