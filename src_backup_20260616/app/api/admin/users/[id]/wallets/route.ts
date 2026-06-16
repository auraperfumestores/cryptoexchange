import { NextResponse } from 'next/server';
import { connectToDatabase, Transaction } from '@/lib/db';
import { requireAuth } from '@/lib/auth/require-auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/** GET /api/admin/users/[id]/wallets
 *  Returns unique wallet+network combos for a user, derived from their transactions.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    let userId: mongoose.Types.ObjectId;
    try { userId = new mongoose.Types.ObjectId(params.id); }
    catch { return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 }); }

    // Aggregate unique wallet+network pairs for this user
    const wallets = await Transaction.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { address: '$walletAddress', network: '$network' },
          verificationTxHash: { $first: '$verificationTxHash' },
          depositAddress:     { $first: '$depositAddress' },
          lastUsed:           { $first: '$createdAt' },
          orderCount:         { $sum: 1 },
          networks:           { $addToSet: '$network' },
        },
      },
      {
        $project: {
          _id: 0,
          address:            '$_id.address',
          network:            '$_id.network',
          verificationTxHash: 1,
          depositAddress:     1,
          lastUsed:           1,
          orderCount:         1,
        },
      },
      { $sort: { lastUsed: -1 } },
    ]);

    return NextResponse.json({ success: true, data: wallets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
