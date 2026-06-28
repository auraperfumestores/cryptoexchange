import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument } from '@/lib/db';
import { uploadKycImage } from '@/lib/kyc/upload-image';
import { errorResponse, badRequest, forbidden, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

type Side = 'front' | 'back' | 'face';
const SIDES: Side[] = ['front', 'back', 'face'];
const FIELD: Record<Side, 'frontImageUrl' | 'backImageUrl' | 'faceImageUrl'> = {
  front: 'frontImageUrl',
  back: 'backImageUrl',
  face: 'faceImageUrl',
};

/** POST /api/kyc/upload — stores one captured image (front/back/face) against
 *  the user's in-progress KYC submission. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { side, imageDataUrl } = (await req.json()) as { side?: Side; imageDataUrl?: string };
    if (!side || !SIDES.includes(side) || !imageDataUrl) {
      return badRequest('Missing side or image');
    }

    await connectToDatabase();

    const submission = await KycSubmission.findOne({ userId: user.id }).lean();
    if (!submission) return notFound('Start KYC before uploading documents');
    if (submission.status !== 'collecting') return forbidden();

    const url = await uploadKycImage(user.id, side, imageDataUrl);

    const updated = await KycSubmission.findOneAndUpdate(
      { userId: user.id },
      { $set: { [FIELD[side]]: url } },
      { new: true },
    ).lean();

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
