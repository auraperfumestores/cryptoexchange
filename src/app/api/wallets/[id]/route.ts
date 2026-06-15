import { NextResponse } from 'next/server';
import { connectToDatabase, Wallet } from '@/lib/db';
import { errorResponse, notFound, forbidden } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/auth/require-auth';

type RouteParams = { params: { id: string } };

/** DELETE /api/wallets/[id] — disconnect a wallet */
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await connectToDatabase();

    const wallet = await Wallet.findById(params.id);
    if (!wallet) return notFound('Wallet not found');
    if (String(wallet.userId) !== user.id) return forbidden();

    await wallet.deleteOne();
    return NextResponse.json({ success: true, message: 'Wallet disconnected' });
  } catch (err) {
    return errorResponse(err);
  }
}