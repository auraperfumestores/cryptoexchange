import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, FeeTransfer } from '@/lib/db';
import { reportFeeTransferOutcome } from '@/lib/wallet/fee-funding';
import { errorResponse, notFound } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/**
 * POST /api/wallets/fund-network-fee/result
 * Body: { feeTransferId: string, success: boolean }
 *
 * Closes the loop on a funding log row once the approve() transaction it paid for
 * either confirms or fails — lets the admin panel show whether the fee spend was worth it.
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json() as { feeTransferId?: string; success?: boolean };
    if (!body.feeTransferId || typeof body.success !== 'boolean') {
      return NextResponse.json({ error: 'feeTransferId and success required' }, { status: 400 });
    }

    await connectToDatabase();
    const record = await FeeTransfer.findById(body.feeTransferId).lean();
    if (!record || String((record as any).userId) !== user.id) return notFound('Fee transfer not found');

    await reportFeeTransferOutcome(body.feeTransferId, body.success);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
