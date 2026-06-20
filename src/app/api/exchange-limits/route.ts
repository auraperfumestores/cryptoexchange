import { NextResponse }                              from 'next/server';
import { requireAuth }                               from '@/lib/auth/require-auth';
import { connectToDatabase, getExchangeLimits }      from '@/lib/db';
import { errorResponse }                             from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/exchange-limits — returns limits for the current user's KYC level */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const { User } = await import('@/lib/db');
    const user = await User.findById(auth.id).select('kycStatus').lean();
    const kycStatus = (user?.kycStatus as string) ?? 'unverified';

    const limits = await getExchangeLimits();
    const tier = kycStatus === 'verified' ? 'verified'
               : kycStatus === 'pending'  ? 'pending'
               : 'unverified';

    return NextResponse.json({
      success: true,
      kycStatus,
      tier,
      limits: limits[tier],
      allLimits: limits,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
