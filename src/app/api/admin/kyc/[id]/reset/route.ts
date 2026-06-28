import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User } from '@/lib/db';
import { errorResponse, forbidden, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** POST /api/admin/kyc/[id]/reset — clears a submission back to the very
 *  first step (without ever changing the user's permanent KYC link) so they
 *  can resubmit documents from scratch. Used for both rejected and verified
 *  submissions an admin needs to reopen (e.g. expired ID, requested redo). */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAuth();
    if (admin.role !== 'admin') return forbidden();

    await connectToDatabase();

    const submission = await KycSubmission.findById(params.id).lean();
    if (!submission) return notFound('Submission not found');

    const updated = await KycSubmission.findByIdAndUpdate(
      params.id,
      {
        $set: { status: 'collecting' },
        $unset: {
          docType: 1,
          frontImageUrl: 1,
          backImageUrl: 1,
          faceImageUrl: 1,
          faceImageUrlRight: 1,
          faceImageUrlLeft: 1,
          rejectionReason: 1,
          submittedAt: 1,
          reviewedAt: 1,
          reviewedBy: 1,
          reviewedByName: 1,
          mobileContinueToken: 1,
          mobileContinueExpiresAt: 1,
        },
        $inc: { resetCount: 1 },
      },
      { new: true },
    ).lean();

    await User.findByIdAndUpdate(submission.userId, { kycStatus: 'unverified' });

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
