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

/**
 * Debits a user's platform wallet — used by admin reversals (e.g. voiding a
 * referral reward after a dispute). Never throws; never lets balance go negative.
 */
export async function debitPlatformWallet(
  userId: string | mongoose.Types.ObjectId,
  amount: number,
  note: string,
  addedBy: 'admin' | 'system' = 'admin',
): Promise<void> {
  if (!amount || amount <= 0) return;
  try {
    await connectToDatabase();
    const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const wallet = await PlatformWallet.findOne({ userId: uid });
    const debitAmount = Math.min(amount, wallet?.balance ?? 0);
    if (debitAmount <= 0) return;
    await PlatformWallet.findOneAndUpdate(
      { userId: uid },
      {
        $inc:  { balance: -debitAmount },
        $push: { transactions: { type: 'debit', amount: debitAmount, note, addedBy, createdAt: new Date() } },
      },
    );
  } catch (err) {
    console.error('[platform-wallet] debit failed:', { userId: String(userId), amount, note, err });
  }
}
