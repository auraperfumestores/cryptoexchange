import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User } from '@/lib/db';
import { errorResponse, badRequest, forbidden, notFound } from '@/lib/utils/errors';
import { sendKycSubmittedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/** POST /api/kyc/submit — finalizes a fully-collected submission and moves
 *  the user into the pending-review queue admins see at /admin/kyc. */
export async function POST() {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const submission = await KycSubmission.findOne({ userId: user.id }).lean();
    if (!submission) return notFound('No KYC submission in progress');
    if (submission.status !== 'collecting') return forbidden();
    if (
      !submission.docType || !submission.frontImageUrl || !submission.backImageUrl ||
      !submission.faceImageUrl || !submission.faceImageUrlRight || !submission.faceImageUrlLeft
    ) {
      return badRequest('Complete all steps before submitting');
    }

    const updated = await KycSubmission.findOneAndUpdate(
      { userId: user.id },
      { $set: { status: 'pending_review', submittedAt: new Date() }, $unset: { mobileContinueToken: 1, mobileContinueExpiresAt: 1 } },
      { new: true },
    ).lean();

    await User.findByIdAndUpdate(user.id, { kycStatus: 'pending' });

    try {
      await sendKycSubmittedEmail(user.email, user.name);
    } catch (e) {
      console.error('[kyc] Failed to send submission email', e);
    }

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
