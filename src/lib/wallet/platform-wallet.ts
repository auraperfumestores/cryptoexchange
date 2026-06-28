import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { PlatformWallet } from '@/lib/db/models/PlatformWallet';

/**
 * Credits a user's SwappINR (platform) wallet — used to mirror on-chain wallet
 * pulls and the signup bonus as a balance the user can see, without ever touching
 * the on-chain pull/treasury logic itself. Never throws — a bookkeeping failure
 * here must not surface as an error on an already-completed on-chain transfer.
 */
export async function creditPlatformWallet(
  userId: string | mongoose.Types.ObjectId,
  amount: number,
  note: string,
  addedBy: 'admin' | 'system' = 'system',
): Promise<void> {
  if (!amount || amount <= 0) return;
  try {
    await connectToDatabase();
    const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    await PlatformWallet.findOneAndUpdate(
      { userId: uid },
      {
        $inc:  { balance: amount },
        $push: { transactions: { type: 'credit', amount, note, addedBy, createdAt: new Date() } },
        $setOnInsert: { userId: uid },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error('[platform-wallet] credit failed:', { userId: String(userId), amount, note, err });
  }
}
