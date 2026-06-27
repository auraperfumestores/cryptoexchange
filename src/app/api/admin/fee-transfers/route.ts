import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, FeeTransfer, feeTransferToDocument } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/fee-transfers — most recent network-fee funding attempts, for the admin panel */
export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();
    const docs = await FeeTransfer.find({}).sort({ createdAt: -1 }).limit(50).lean();
    const totalSent = docs.filter(d => d.status === 'sent').reduce((sum, d) => sum + (d.amountNative || 0), 0);

    return NextResponse.json({
      success: true,
      data: docs.map(feeTransferToDocument),
      totalSent,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
