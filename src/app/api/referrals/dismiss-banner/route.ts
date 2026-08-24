import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, Referral } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** POST /api/referrals/dismiss-banner — marks the current user's side of a
 *  rewarded referral's celebration banner as seen (referrer and referee each
 *  have their own independent flag). Body: { referralId, role } */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { referralId, role } = (await req.json()) as { referralId?: string; role?: 'referrer' | 'referee' };
    if (!referralId || (role !== 'referrer' && role !== 'referee')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();
    const field = role === 'referrer' ? 'referrerBannerSeen' : 'refereeBannerSeen';
    const ownerField = role === 'referrer' ? 'referrerId' : 'refereeId';

    await Referral.updateOne({ _id: referralId, [ownerField]: auth.id }, { $set: { [field]: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
