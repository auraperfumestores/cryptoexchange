import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, Wallet, User } from '@/lib/db';
import { fetchUsdtBalance } from '@/lib/wallet/fetch-usdt-balance';
import { notifyAdminBalanceCredited } from '@/lib/notifications/admin';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CREDIT_THRESHOLD = 0.01;
const BATCH_SIZE = 5;

interface RawWallet {
  _id: any;
  userId: any;
  address: string;
  chainId: number;
  chainName: string;
  lastKnownBalance?: number;
}

interface CreditEvent {
  userId: string;
  address: string;
  network: string;
  prev: number;
  curr: number;
  change: number;
}

/** POST /api/admin/wallets/scan-balances — admin only */
export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    const wallets = await Wallet.find({}).lean<RawWallet[]>();

    let scanned = 0;
    let credited = 0;
    let failed = 0;
    const creditEvents: CreditEvent[] = [];

    for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
      const batch = wallets.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(batch.map(async (w) => {
        try {
          const newBalance = await fetchUsdtBalance(w.chainId, w.address);
          if (newBalance === null) { failed++; return; }

          const prevBalance = w.lastKnownBalance ?? 0;

          await Wallet.updateOne(
            { _id: w._id },
            { $set: { lastKnownBalance: newBalance, balanceCheckedAt: new Date() } },
          );

          scanned++;

          if (newBalance - prevBalance > CREDIT_THRESHOLD) {
            credited++;
            creditEvents.push({
              userId:  String(w.userId),
              address: w.address,
              network: w.chainName,
              prev:    prevBalance,
              curr:    newBalance,
              change:  newBalance - prevBalance,
            });
          }
        } catch {
          failed++;
        }
      }));
    }

    // Fire balance-credit notifications (fire-and-forget, non-blocking)
    for (const ev of creditEvents) {
      const u = await User.findById(ev.userId).select('name email').lean<{ name: string; email: string }>();
      if (u) {
        notifyAdminBalanceCredited({
          userName:       u.name,
          userEmail:      u.email,
          address:        ev.address,
          network:        ev.network,
          prevBalance:    ev.prev,
          newBalance:     ev.curr,
          creditedAmount: ev.change,
        }).catch(err => console.error('[scan-balances] notify failed:', err));
      }
    }

    return NextResponse.json({ success: true, scanned, credited, failed });
  } catch (err) {
    return errorResponse(err);
  }
}
