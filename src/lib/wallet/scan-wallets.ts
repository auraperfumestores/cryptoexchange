/**
 * Core wallet balance scanning logic — shared by the manual admin scan
 * endpoint and the automated cron job.
 *
 * - Manual scan  (scan-balances): respectMonitoring=false — scans every
 *   approved+verified wallet regardless of per-user monitoring toggle.
 * - Cron scan    (cron/wallet-monitor): respectMonitoring=true — skips wallets
 *   whose owner has explicitly disabled monitoring.
 */

import { connectToDatabase, Wallet, User } from '@/lib/db';
import { fetchUsdtBalance } from '@/lib/wallet/fetch-usdt-balance';
import { notifyAdminBalanceCredited } from '@/lib/notifications/admin';

const CREDIT_THRESHOLD = 0.01; // minimum USDT increase to trigger a notification
const BATCH_SIZE = 5;           // concurrent RPC calls per batch

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

export interface ScanResult {
  scanned: number;
  credited: number;
  failed: number;
}

export async function scanApprovedWallets(options?: { respectMonitoring?: boolean }): Promise<ScanResult> {
  await connectToDatabase();

  const walletFilter: Record<string, any> = { isVerified: true, approved: true };

  if (options?.respectMonitoring) {
    // Treat missing walletMonitoring field as enabled (default = true)
    const monitoredUsers = await User
      .find({ $or: [{ walletMonitoring: true }, { walletMonitoring: { $exists: false } }] })
      .select('_id')
      .lean<{ _id: any }[]>();

    if (monitoredUsers.length === 0) return { scanned: 0, credited: 0, failed: 0 };
    walletFilter.userId = { $in: monitoredUsers.map(u => u._id) };
  }

  const wallets = await Wallet.find(walletFilter).lean<RawWallet[]>();
  if (wallets.length === 0) return { scanned: 0, credited: 0, failed: 0 };

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

  // Resolve user details and fire credit notifications (fire-and-forget)
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
      }).catch(err => console.error('[scan-wallets] notify failed:', err));
    }
  }

  return { scanned, credited, failed };
}
