import { NextResponse }                              from 'next/server';
import { requireAuth }                               from '@/lib/auth/require-auth';
import { connectToDatabase, getExchangeLimits, User } from '@/lib/db';
import { errorResponse }                             from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

// Pro users get effectively unlimited limits (displayed as ∞)
const PRO_LIMITS = { perTransaction: 99_99_999, daily: 99_99_999, monthly: 9_99_99_999 };

/** GET /api/exchange-limits — returns limits for the current user's KYC/Pro level */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const user = await User.findById(auth.id).select('kycStatus proStatus').lean();
    const kycStatus = (user?.kycStatus as string) ?? 'unverified';

    // Pro users override KYC limits
    const ps = (user as any)?.proStatus ?? {};
    const isPro = !!(ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date());

    const limits = await getExchangeLimits();
    const tier = kycStatus === 'verified' ? 'verified'
               : kycStatus === 'pending'  ? 'pending'
               : 'unverified';

    return NextResponse.json({
      success:  true,
      kycStatus,
      tier:     isPro ? 'pro' : tier,
      isPro,
      limits:   isPro ? PRO_LIMITS : limits[tier],
      allLimits: limits,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
