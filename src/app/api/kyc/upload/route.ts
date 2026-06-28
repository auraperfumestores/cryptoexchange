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

/** POST /api/kyc/upload — stores captured image(s) against the user's
 *  in-progress KYC submission. For side "face" the liveness check captures
 *  three angles (front/right/left) in one guided sequence on the same
 *  device, so imageDataUrlRight and imageDataUrlLeft may be sent alongside
 *  imageDataUrl in the same request and are all saved together. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = (await req.json()) as {
      side?: Side; imageDataUrl?: string; imageDataUrlRight?: string; imageDataUrlLeft?: string;
    };
    const { side, imageDataUrl, imageDataUrlRight, imageDataUrlLeft } = body;
    if (!side || !SIDES.includes(side) || !imageDataUrl) {
      return badRequest('Missing side or image');
    }

    await connectToDatabase();

    const submission = await KycSubmission.findOne({ userId: user.id }).lean();
    if (!submission) return notFound('Start KYC before uploading documents');
    if (submission.status !== 'collecting') return forbidden();

    const set: Record<string, string> = { [FIELD[side]]: await uploadKycImage(user.id, side, imageDataUrl) };
    if (side === 'face') {
      if (imageDataUrlRight) set.faceImageUrlRight = await uploadKycImage(user.id, 'face-right', imageDataUrlRight);
      if (imageDataUrlLeft) set.faceImageUrlLeft = await uploadKycImage(user.id, 'face-left', imageDataUrlLeft);
    }

    const updated = await KycSubmission.findOneAndUpdate(
      { userId: user.id },
      { $set: set },
      { new: true },
    ).lean();

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
