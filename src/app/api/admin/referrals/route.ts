import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth/require-auth';
import { connectToDatabase, Referral, User } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/referrals — full referral list with referrer/referee names, for the
 *  admin "Users" tab. Also returns quick leaderboard-style totals per status. */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const referrals = await Referral.find().sort({ createdAt: -1 }).limit(500).lean();

    const userIds = new Set<string>();
    referrals.forEach(r => { userIds.add(String(r.referrerId)); userIds.add(String(r.refereeId)); });
    const users = await User.find({ _id: { $in: [...userIds].map(id => new mongoose.Types.ObjectId(id)) } })
      .select('name email')
      .lean();
    const userMap = new Map(users.map(u => [String(u._id), { name: u.name, email: u.email }]));

    const data = referrals.map(r => ({
      _id: String(r._id),
      status: r.status,
      referralCode: r.referralCode,
      referrer: userMap.get(String(r.referrerId)) ?? { name: 'Unknown', email: '' },
      referee: userMap.get(String(r.refereeId)) ?? { name: 'Unknown', email: '' },
      referrerRewardUsdt: r.referrerRewardUsdt,
      refereeRewardUsdt: r.refereeRewardUsdt,
      voidReason: r.voidReason,
      rewardedAt: r.rewardedAt ? new Date(r.rewardedAt).toISOString() : undefined,
      createdAt: new Date((r as any).createdAt).toISOString(),
    }));

    const totals = {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      rewarded: referrals.filter(r => r.status === 'rewarded').length,
      void: referrals.filter(r => r.status === 'void').length,
      totalPaidUsdt: referrals.reduce((s, r) => s + (r.referrerRewardUsdt ?? 0) + (r.refereeRewardUsdt ?? 0), 0),
    };

    return NextResponse.json({ success: true, data, totals });
  } catch (err) {
    return errorResponse(err);
  }
}
