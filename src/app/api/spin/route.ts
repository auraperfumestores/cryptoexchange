import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, SpinResult, SpinDailyStat, getSpinSettings, isSpinHiddenFromUsers } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { SPIN_PRIZES } from '@/lib/spin/prizes';
import { getOrCreateSpinAccount, consumeSpin } from '@/lib/spin/account';
import { pickSegmentIndex, istDateKey, istDayElapsedFraction } from '@/lib/spin/engine';

export const dynamic = 'force-dynamic';

/** GET /api/spin — balances, tier and odds info, totals, recent spins, and any
 *  prize won but never claimed (so the claim popup can be re-shown on reload). */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();
    if (await isSpinHiddenFromUsers()) return NextResponse.json({ error: 'Not found', code: 'SPIN_HIDDEN' }, { status: 404 });
    const uid = new mongoose.Types.ObjectId(auth.id);

    const [account, settings, recent, agg, unclaimed] = await Promise.all([
      getOrCreateSpinAccount(auth.id),
      getSpinSettings(),
      SpinResult.find({ userId: uid }).sort({ createdAt: -1 }).limit(12).lean(),
      SpinResult.aggregate<{ _id: null; totalWon: number; count: number }>([
        { $match: { userId: uid } },
        { $group: { _id: null, totalWon: { $sum: '$prizeUsdt' }, count: { $sum: 1 } } },
      ]),
      SpinResult.findOne({ userId: uid, prizeUsdt: { $gt: 0 }, credited: false }).sort({ createdAt: -1 }).lean(),
    ]);

    const tier = account?.hasDeposited ? 'deposit' : 'free';
    const rule = tier === 'deposit' ? settings.depositTier : settings.freeTier;

    return NextResponse.json({
      success: true,
      data: {
        enabled:         settings.enabled,
        spinBalance:     account?.balance ?? 0,
        spinsLeft:       account?.spins ?? 0,
        totalWon:        agg[0]?.totalWon ?? 0,
        totalSpins:      agg[0]?.count ?? 0,
        tier,
        maxWinUsdt:      rule.maxWinUsdt,
        spinsPer100Usdt: settings.spinsPer100Usdt,
        unclaimed:       unclaimed ? { spinId: String(unclaimed._id), prizeUsdt: unclaimed.prizeUsdt } : null,
        recent: recent.map(r => ({
          _id: String(r._id),
          prizeUsdt: r.prizeUsdt,
          createdAt: new Date((r as any).createdAt).toISOString(),
        })),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/spin — uses one spin and resolves the outcome server-side against the
 *  user's tier and today's budget. The prize is recorded but NOT credited here: it
 *  stays pending until claimed via POST /api/spin/claim. */
export async function POST() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const settings = await getSpinSettings();
    if (settings.hiddenFromUsers) return NextResponse.json({ error: 'Not found', code: 'SPIN_HIDDEN' }, { status: 404 });
    if (!settings.enabled) {
      return NextResponse.json({ error: 'Spin & Win is currently paused.', code: 'DISABLED' }, { status: 503 });
    }

    // Atomic decrement — fails cleanly at zero, and a double-click can't spend two.
    if (!(await consumeSpin(auth.id))) {
      return NextResponse.json({ error: 'You have no spins left.', code: 'NO_SPINS' }, { status: 409 });
    }

    const now = new Date();
    const dateKey = istDateKey(now);
    const [account, today] = await Promise.all([
      getOrCreateSpinAccount(auth.id),
      SpinDailyStat.findOne({ dateKey }).lean(),
    ]);

    const tier = account?.hasDeposited ? settings.depositTier : settings.freeTier;
    const segmentIndex = pickSegmentIndex({
      tier,
      dailyBudgetUsdt: settings.dailyBudgetUsdt,
      paidTodayUsdt: today?.paidUsdt ?? 0,
      dayElapsedFraction: istDayElapsedFraction(now),
    });
    const prize = SPIN_PRIZES[segmentIndex];

    const [spin] = await Promise.all([
      SpinResult.create({ userId: auth.id, prizeUsdt: prize.usdt, segmentIndex, credited: prize.usdt === 0 }),
      // Budget is a liability the moment a prize is won, claimed or not.
      SpinDailyStat.updateOne(
        { dateKey },
        { $inc: { spins: 1, paidUsdt: prize.usdt }, $setOnInsert: { dateKey } },
        { upsert: true },
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        spinId: String(spin._id),
        segmentIndex,
        prizeUsdt: prize.usdt,
        spinBalance: account?.balance ?? 0,
        // `account` was read after consumeSpin(), so this is already the post-spin count.
        spinsLeft:   account?.spins ?? 0,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
