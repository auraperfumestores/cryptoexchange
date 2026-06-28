import { NextResponse } from 'next/server';
import { connectToDatabase, KycSubmission } from '@/lib/db';
import { errorResponse, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/kyc/mobile/[token] — unauthenticated lookup used by the QR-handoff
 *  mobile page to find out which side(s) still need a photo. The token is a
 *  random 20-byte secret and expires after 15 minutes, so no login is needed
 *  on the second device. */
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  try {
    await connectToDatabase();

    const submission = await KycSubmission.findOne({ mobileContinueToken: params.token }).lean();
    if (!submission || submission.status !== 'collecting') return notFound('Link expired');
    if (!submission.mobileContinueExpiresAt || new Date(submission.mobileContinueExpiresAt) < new Date()) {
      return notFound('Link expired');
    }

    return NextResponse.json({
      success: true,
      data: {
        docType: submission.docType,
        hasFront: !!submission.frontImageUrl,
        hasBack: !!submission.backImageUrl,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
