import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-auth';
import { connectToDatabase, SpinDailyStat, SpinAccount, WithdrawalRequest, getSpinSettings } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { istDateKey } from '@/lib/spin/engine';

export const dynamic = 'force-dynamic';

/** GET /api/admin/spin/overview — today's budget usage and the outstanding liabilities. */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const dateKey = istDateKey();
    const [settings, today, liability, pending, processing] = await Promise.all([
      getSpinSettings(),
      SpinDailyStat.findOne({ dateKey }).lean(),
      SpinAccount.aggregate<{ _id: null; balance: number; spins: number; accounts: number }>([
        { $group: { _id: null, balance: { $sum: '$balance' }, spins: { $sum: '$spins' }, accounts: { $sum: 1 } } },
      ]),
      WithdrawalRequest.countDocuments({ source: 'spin', status: 'pending' }),
      WithdrawalRequest.countDocuments({ source: 'spin', status: 'processing' }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dateKey,
        dailyBudgetUsdt:   settings.dailyBudgetUsdt,
        paidTodayUsdt:     today?.paidUsdt ?? 0,
        spinsToday:        today?.spins ?? 0,
        outstandingUsdt:   liability[0]?.balance ?? 0,   // unwithdrawn spin balances across all users
        outstandingSpins:  liability[0]?.spins ?? 0,     // unplayed spins across all users
        accounts:          liability[0]?.accounts ?? 0,
        withdrawalsPending:    pending,
        withdrawalsProcessing: processing,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
