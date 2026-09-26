import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, SpinResult, isSpinHiddenFromUsers } from '@/lib/db';
import { errorResponse, badRequest } from '@/lib/utils/errors';
import { getOrCreateSpinAccount, creditSpinBalance } from '@/lib/spin/account';

export const dynamic = 'force-dynamic';

/**
 * POST /api/spin/claim — credits a won prize to the spin balance.
 *
 * The flip from credited:false → true is a single atomic update filtered on the
 * caller's own userId, so a prize can only be claimed once, only by its winner,
 * and two racing clicks can't credit it twice.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { spinId } = (await req.json()) as { spinId?: string };
    if (!spinId || !mongoose.Types.ObjectId.isValid(spinId)) return badRequest('Invalid spin');

    await connectToDatabase();
    if (await isSpinHiddenFromUsers()) return NextResponse.json({ error: 'Not found', code: 'SPIN_HIDDEN' }, { status: 404 });

    const spin = await SpinResult.findOneAndUpdate(
      { _id: spinId, userId: new mongoose.Types.ObjectId(auth.id), prizeUsdt: { $gt: 0 }, credited: false },
      { $set: { credited: true } },
      { new: true },
    ).lean();

    if (!spin) {
      return NextResponse.json({ error: 'This prize has already been claimed.', code: 'ALREADY_CLAIMED' }, { status: 409 });
    }

    await creditSpinBalance(auth.id, spin.prizeUsdt, `Spin & Win prize — ${spin.prizeUsdt} USDT`);

    const account = await getOrCreateSpinAccount(auth.id);
    return NextResponse.json({
      success: true,
      data: {
        prizeUsdt:   spin.prizeUsdt,
        spinBalance: account?.balance ?? 0,
        spinsLeft:   account?.spins ?? 0,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
