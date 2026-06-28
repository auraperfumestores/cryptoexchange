import { NextResponse } from 'next/server';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument } from '@/lib/db';
import { uploadKycImage } from '@/lib/kyc/upload-image';
import { errorResponse, badRequest, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

type Side = 'front' | 'back';
const FIELD: Record<Side, 'frontImageUrl' | 'backImageUrl'> = {
  front: 'frontImageUrl',
  back: 'backImageUrl',
};

/** POST /api/kyc/mobile/[token]/upload — accepts a front/back photo captured
 *  on the handed-off mobile device; the desktop flow polls /api/kyc/status
 *  and advances automatically once it lands. Face capture stays on whichever
 *  device finishes the document steps, so it is not accepted here. */
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const { side, imageDataUrl } = (await req.json()) as { side?: Side; imageDataUrl?: string };
    if (!side || !(side in FIELD) || !imageDataUrl) return badRequest('Missing side or image');

    await connectToDatabase();

    const submission = await KycSubmission.findOne({ mobileContinueToken: params.token }).lean();
    if (!submission || submission.status !== 'collecting') return notFound('Link expired');
    if (!submission.mobileContinueExpiresAt || new Date(submission.mobileContinueExpiresAt) < new Date()) {
      return notFound('Link expired');
    }

    const url = await uploadKycImage(String(submission.userId), side, imageDataUrl);

    const updated = await KycSubmission.findOneAndUpdate(
      { mobileContinueToken: params.token },
      { $set: { [FIELD[side]]: url } },
      { new: true },
    ).lean();

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(updated) });
  } catch (err) {
    return errorResponse(err);
  }
}
