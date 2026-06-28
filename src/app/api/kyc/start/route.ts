import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, KycSubmission, kycSubmissionToDocument } from '@/lib/db';
import { errorResponse, badRequest, forbidden } from '@/lib/utils/errors';
import type { KycDocType } from '@/types';

export const dynamic = 'force-dynamic';

const DOC_TYPES: KycDocType[] = ['aadhaar', 'pan', 'driving_license'];

/** POST /api/kyc/start — selects/changes the document type and (re)opens the
 *  collection step. Blocked once a submission is pending review, verified, or
 *  rejected — only an admin reset can reopen those. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const { docType } = (await req.json()) as { docType?: KycDocType };
    if (!docType || !DOC_TYPES.includes(docType)) {
      return badRequest('Select a valid document type');
    }

    await connectToDatabase();

    const existing = await KycSubmission.findOne({ userId: user.id }).lean();
    if (existing && existing.status !== 'collecting') {
      return forbidden();
    }

    const sameDocType = existing?.docType === docType;

    const update: Record<string, unknown> = {
      $set: { docType, status: 'collecting' },
      $setOnInsert: { resetCount: 0 },
    };
    if (!sameDocType) {
      update.$unset = { frontImageUrl: 1, backImageUrl: 1, faceImageUrl: 1, faceImageUrlRight: 1, faceImageUrlLeft: 1 };
    }

    const submission = await KycSubmission.findOneAndUpdate(
      { userId: user.id },
      update,
      { upsert: true, new: true },
    ).lean();

    return NextResponse.json({ success: true, data: kycSubmissionToDocument(submission) });
  } catch (err) {
    return errorResponse(err);
  }
}
