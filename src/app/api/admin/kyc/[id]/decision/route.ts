import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User } from '@/lib/db';
import { errorResponse, forbidden, notFound, badRequest } from '@/lib/utils/errors';
import { sendKycApprovedEmail, sendKycRejectedEmail } from '@/lib/email';

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
      .select('name email')
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
    }

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
