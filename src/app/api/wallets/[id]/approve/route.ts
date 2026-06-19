/**
 * PATCH /api/wallets/:id/approve
 * Called by the vault-approve in-app browser page after USDT.approve() confirms.
 * Sets wallet.approved = true and stores the approval txHash.
 */
import { NextResponse }              from 'next/server';
import { requireAuth }               from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAuth();
    const body = await req.json() as { approved?: boolean; approvalTxHash?: string };

    await connectToDatabase();
    const wallet = await Wallet.findOne({ _id: params.id, userId: user.id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const update: Record<string, unknown> = { approved: body.approved ?? true };
    if (body.approvalTxHash) update.approvalTxHash = body.approvalTxHash;

    await Wallet.findByIdAndUpdate(params.id, update);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[wallets/approve]', err);
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
