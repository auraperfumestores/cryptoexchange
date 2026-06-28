import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument, User } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/kyc/status — current submission state for the logged-in user,
 *  used by the KYC flow to resume at the right step on load/refresh. */
export async function GET() {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const [submission, dbUser] = await Promise.all([
      KycSubmission.findOne({ userId: user.id }).lean(),
      User.findById(user.id).select('kycStatus').lean<{ kycStatus?: string }>(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        kycStatus: dbUser?.kycStatus ?? 'unverified',
        submission: submission ? kycSubmissionToDocument(submission) : null,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
