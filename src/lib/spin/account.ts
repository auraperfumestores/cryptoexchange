import mongoose from 'mongoose';
import { connectToDatabase, User, getWidgetLimits, getSpinSettings } from '@/lib/db';
import { SpinAccount } from '@/lib/db/models/SpinAccount';

function oid(id: string | mongoose.Types.ObjectId) {
  return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
}

/** Returns the user's spin account, creating it on first touch. New accounts
 *  start with zero spins — spins come from KYC approval and qualifying deposits. */
export async function getOrCreateSpinAccount(userId: string | mongoose.Types.ObjectId) {
  await connectToDatabase();
  const uid = oid(userId);
  return SpinAccount.findOneAndUpdate(
    { userId: uid },
    { $setOnInsert: { userId: uid, balance: 0, spins: 0, transactions: [], hasDeposited: false, depositedUsdt: 0, signupSpinsGranted: false } },
    { upsert: true, new: true },
  );
}

/** Atomically uses one spin. Returns false if the user has none left. */
export async function consumeSpin(userId: string | mongoose.Types.ObjectId): Promise<boolean> {
  await getOrCreateSpinAccount(userId);
  const res = await SpinAccount.updateOne(
    { userId: oid(userId), spins: { $gte: 1 } },
    { $inc: { spins: -1 } },
  );
  return res.modifiedCount === 1;
}

/** Credits winnings to the spin balance (never the platform wallet). */
export async function creditSpinBalance(userId: string | mongoose.Types.ObjectId, amount: number, note: string): Promise<void> {
  if (!amount || amount <= 0) return;
  await getOrCreateSpinAccount(userId);
  await SpinAccount.updateOne(
    { userId: oid(userId) },
    { $inc: { balance: amount }, $push: { transactions: { type: 'credit', amount, note, createdAt: new Date() } } },
  );
}

/**
 * Atomically debits the spin balance. The `balance >= amount` filter makes this
 * safe against double-submits — a second concurrent request simply matches
 * nothing and returns false, so a user can never withdraw more than they hold.
 */
export async function debitSpinBalance(userId: string | mongoose.Types.ObjectId, amount: number, note: string): Promise<boolean> {
  if (!amount || amount <= 0) return false;
  await getOrCreateSpinAccount(userId);
  const res = await SpinAccount.updateOne(
    { userId: oid(userId), balance: { $gte: amount } },
    { $inc: { balance: -amount }, $push: { transactions: { type: 'debit', amount, note, createdAt: new Date() } } },
  );
  return res.modifiedCount === 1;
}

/** Grants spins directly (admin tooling / future promotions). */
export async function awardSpins(userId: string | mongoose.Types.ObjectId, count: number): Promise<void> {
  if (!count || count <= 0) return;
  await getOrCreateSpinAccount(userId);
  await SpinAccount.updateOne({ userId: oid(userId) }, { $inc: { spins: Math.floor(count) } });
}

/** The user's effective minimum sell amount: their custom limit when the admin
 *  has enabled one, otherwise the global widget minimum. */
async function effectiveMinSell(userId: string): Promise<number> {
  const [limits, user] = await Promise.all([
    getWidgetLimits(),
    User.findById(userId).select('customLimits').lean<{ customLimits?: { enabled?: boolean; minSellUsdt?: number } }>(),
  ]);
  const cl = user?.customLimits;
  if (cl?.enabled === true && typeof cl.minSellUsdt === 'number' && cl.minSellUsdt >= 0) return cl.minSellUsdt;
  return limits.minSellUsdt ?? 0;
}

/**
 * Called when USDT is pulled from a user's connected wallet into their platform
 * wallet ("Add funds"). Awards spins at the admin-set rate and promotes the user
 * to the deposit tier. A deposit below the user's effective minimum sell amount
 * earns nothing and does not promote them — that respects per-user custom limits.
 * Returns the number of spins awarded. Never throws.
 */
export async function awardSpinsForDeposit(userId: string, amountUsdt: number): Promise<number> {
  try {
    if (!amountUsdt || amountUsdt <= 0) return 0;
    const settings = await getSpinSettings();
    if (!settings.enabled || settings.hiddenFromUsers) return 0;

    if (settings.requireMinOrderForDeposit) {
      const min = await effectiveMinSell(userId);
      if (amountUsdt < min) return 0;
    }

    const spins = Math.floor((amountUsdt / 100) * Math.max(0, settings.spinsPer100Usdt));
    await getOrCreateSpinAccount(userId);
    await SpinAccount.updateOne(
      { userId: oid(userId) },
      { $inc: { spins, depositedUsdt: amountUsdt }, $set: { hasDeposited: true } },
    );
    return spins;
  } catch (err) {
    console.error('[spin] awardSpinsForDeposit failed:', { userId, amountUsdt, err });
    return 0;
  }
}

/**
 * Grants the admin-set signup spins exactly once, at KYC approval. The filter on
 * `signupSpinsGranted: { $ne: true }` makes a repeat call a no-op.
 * Returns the number granted (0 if already granted or disabled). Never throws.
 */
export async function grantSignupSpins(userId: string): Promise<number> {
  try {
    const settings = await getSpinSettings();
    const n = Math.floor(Math.max(0, settings.signupSpins));
    if (!settings.enabled || settings.hiddenFromUsers || n <= 0) return 0;
    await getOrCreateSpinAccount(userId);
    const res = await SpinAccount.updateOne(
      { userId: oid(userId), signupSpinsGranted: { $ne: true } },
      { $inc: { spins: n }, $set: { signupSpinsGranted: true } },
    );
    return res.modifiedCount === 1 ? n : 0;
  } catch (err) {
    console.error('[spin] grantSignupSpins failed:', { userId, err });
    return 0;
  }
}
