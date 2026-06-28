import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, User, Wallet, PlatformWallet, WithdrawalRequest } from '@/lib/db';
import { OtpCode } from '@/lib/db/models/OtpCode';
import { errorResponse, badRequest } from '@/lib/utils/errors';
import { sendWithdrawalCreatedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

type Network = 'ERC20' | 'BEP20' | 'TRC20';

const NET_CHAIN: Record<Network, number> = { ERC20: 1, BEP20: 56, TRC20: 195 };
const NETWORK_FEE: Record<Network, number> = { ERC20: 3, BEP20: 0.5, TRC20: 1 };

/** POST /api/platform-wallet/withdraw — final step of the withdrawal flow.
 *  Requires a freshly-verified withdraw-OTP record for the caller's phone;
 *  re-validates every gate server-side (phone, KYC, per-network wallet) since
 *  the client-side popup is only a UX guide, not a security boundary. */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { amount, network } = (await req.json()) as { amount?: number; network?: string };

    if (!network || !(network in NET_CHAIN)) return badRequest('Select a valid network');
    const net = network as Network;
    const amt = Number(amount);
    if (!amt || !Number.isFinite(amt) || amt <= 0) return badRequest('Enter a valid withdrawal amount');

    await connectToDatabase();

    const user = await User.findById(auth.id).select('name email phone phoneVerified kycStatus').lean();
    const phone = (user as any)?.phone as string | undefined;
    if (!phone || !(user as any)?.phoneVerified) return badRequest('Verify your phone number first');
    if ((user as any)?.kycStatus !== 'verified') return badRequest('Identity verification is required before withdrawing');

    const chainId = NET_CHAIN[net];
    const wallet = await Wallet.findOne({ userId: auth.id, chainId, isVerified: true }).lean();
    if (!wallet) return badRequest(`Connect a wallet on the ${net} network before withdrawing`);

    const otpRecord = await OtpCode.findOne({ phone, purpose: 'withdraw-verify', verified: true }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return badRequest('Please verify the withdrawal code sent to your phone');
    }

    const uid = new mongoose.Types.ObjectId(auth.id);
    const fee = NETWORK_FEE[net] ?? 0;

    const pw = await PlatformWallet.findOne({ userId: uid });
    if (!pw || pw.balance < amt) return badRequest('Insufficient wallet balance');

    pw.balance -= amt;
    pw.transactions.push({
      type: 'debit',
      amount: amt,
      note: `Withdrawal to ${net} address ${(wallet as any).address.slice(0, 8)}…${(wallet as any).address.slice(-6)}`,
      addedBy: 'system',
      createdAt: new Date(),
    } as any);
    await pw.save();

    const withdrawal = await WithdrawalRequest.create({
      userId: uid,
      amount: amt,
      network: net,
      chainId,
      toAddress: (wallet as any).address,
      networkFee: fee,
      status: 'pending',
    });

    // Consume the OTP so it can't be replayed for a second withdrawal.
    await OtpCode.deleteOne({ _id: otpRecord._id });

    try {
      await sendWithdrawalCreatedEmail((user as any).email, (user as any).name, {
        amount: amt, network: net, toAddress: (wallet as any).address,
      });
    } catch (e) {
      console.error('[withdraw] Failed to send request-created email', e);
    }

    return NextResponse.json({ success: true, data: { id: String(withdrawal._id), balance: pw.balance } });
  } catch (err) {
    return errorResponse(err);
  }
}
