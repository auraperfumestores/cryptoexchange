import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission } from '@/lib/db';
import { errorResponse, forbidden, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const TTL_MS = 15 * 60 * 1000;

/** POST /api/kyc/mobile-token — issues a short-lived, unauthenticated handoff
 *  token so a desktop user can scan a QR code and continue document capture
 *  on their phone's camera without logging in there. */
export async function POST() {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const submission = await KycSubmission.findOne({ userId: user.id }).lean();
    if (!submission) return notFound('Start KYC before continuing on mobile');
    if (submission.status !== 'collecting') return forbidden();

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + TTL_MS);

    await KycSubmission.findOneAndUpdate(
      { userId: user.id },
      { $set: { mobileContinueToken: token, mobileContinueExpiresAt: expiresAt } },
    );

    return NextResponse.json({ success: true, data: { token, path: `/kyc/mobile/${token}`, expiresAt: expiresAt.toISOString() } });
  } catch (err) {
    return errorResponse(err);
  }
}
