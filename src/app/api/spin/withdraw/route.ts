import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, User, Wallet, WithdrawalRequest, getSpinSettings, isSpinHiddenFromUsers } from '@/lib/db';
import { errorResponse, badRequest } from '@/lib/utils/errors';
import { sendWithdrawalCreatedEmail } from '@/lib/email';
import { debitSpinBalance, creditSpinBalance } from '@/lib/spin/account';

export const dynamic = 'force-dynamic';

type Network = 'ERC20' | 'BEP20' | 'TRC20';
const NET_CHAIN:   Record<Network, number> = { ERC20: 1, BEP20: 56, TRC20: 195 };
const NETWORK_FEE: Record<Network, number> = { ERC20: 3, BEP20: 0.5, TRC20: 1 };

/**
 * POST /api/spin/withdraw — withdraws from the SPIN balance to the user's own
 * connected wallet on the chosen network.
 *
 * Follows the wallet-connection rule (a verified wallet on that network is the
 * destination), but has NO minimum amount and no OTP step. Funds are debited
 * atomically up front, exactly as the platform-wallet flow does, and refunded by
 * the admin decision route if the request is later rejected.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { amount, network } = (await req.json()) as { amount?: number; network?: string };

    if (!network || !(network in NET_CHAIN)) return badRequest('Select a valid network');
    const net = network as Network;
    const amt = Math.round(Number(amount) * 100) / 100;
    if (!amt || !Number.isFinite(amt) || amt <= 0) return badRequest('Enter a valid withdrawal amount');

    await connectToDatabase();
    if (await isSpinHiddenFromUsers()) return NextResponse.json({ error: 'Not found', code: 'SPIN_HIDDEN' }, { status: 404 });

    const chainId = NET_CHAIN[net];
    const wallet = await Wallet.findOne({ userId: auth.id, chainId, isVerified: true }).lean();
    if (!wallet) {
      return NextResponse.json(
        { error: `Connect a wallet on the ${net} network before withdrawing`, code: 'NO_WALLET' },
        { status: 400 },
      );
    }

    const toAddress = (wallet as any).address as string;
    const debited = await debitSpinBalance(auth.id, amt, `Withdrawal to ${net} ${toAddress.slice(0, 8)}…${toAddress.slice(-6)}`);
    if (!debited) return badRequest('Insufficient spin balance');

    // Requests at or below the admin-set threshold go straight to `processing`
    // (pre-approved, awaiting payout). Larger ones enter `pending` for review.
    const { autoApproveMaxUsdt } = await getSpinSettings();

    let withdrawal;
    try {
      withdrawal = await WithdrawalRequest.create({
        userId: new mongoose.Types.ObjectId(auth.id),
        amount: amt,
        network: net,
        chainId,
        toAddress,
        networkFee: NETWORK_FEE[net] ?? 0,
        source: 'spin',
        status: amt <= autoApproveMaxUsdt ? 'processing' : 'pending',
      });
    } catch (e) {
      // Never leave the user's balance debited without a request to back it.
      await creditSpinBalance(auth.id, amt, 'Reversal — withdrawal request could not be created');
      throw e;
    }

    const user = await User.findById(auth.id).select('name email').lean();
    if (user) {
      try {
        await sendWithdrawalCreatedEmail((user as any).email, (user as any).name, { amount: amt, network: net, toAddress });
      } catch (e) {
        console.error('[spin/withdraw] Failed to send request-created email', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(withdrawal._id),
        status: withdrawal.status,
        autoApproved: withdrawal.status === 'processing',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
