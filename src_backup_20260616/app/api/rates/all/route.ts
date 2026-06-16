import { NextResponse } from 'next/server';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';

/** GET /api/rates/all — list all rates including inactive (admin only) */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    const rates = await Rate.find({}).sort({ symbol: 1, network: 1 }).lean();
    return NextResponse.json({ success: true, data: rates.map(rateToDocument) });
  } catch (err) {
    return errorResponse(err);
  }
}