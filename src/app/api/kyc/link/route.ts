import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, ensureKycLinkToken } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/kyc/link — returns the user's permanent KYC verification link,
 *  generating the underlying token on first call. */
export async function GET() {
  try {
    const user = await requireAuth();
    await connectToDatabase();
    const token = await ensureKycLinkToken(user.id);
    return NextResponse.json({ success: true, data: { token, path: `/kyc/${token}` } });
  } catch (err) {
    return errorResponse(err);
  }
}
