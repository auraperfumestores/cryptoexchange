import { NextResponse }                       from 'next/server';
import { requireAuth }                        from '@/lib/auth/require-auth';
import { connectToDatabase, User, ProPayment, Wallet, getProSettings } from '@/lib/db';
import { errorResponse }                      from '@/lib/utils/errors';
import type { ProNetwork }                    from '@/lib/db';

export const dynamic = 'force-dynamic';

const TREASURY: Record<ProNetwork, string> = {
  BEP20: (process.env.VAULT_BEP20 ?? '').trim(),
  ERC20: (process.env.VAULT_ERC20 ?? '').trim(),
  TRC20: (process.env.VAULT_TRC20 ?? '').trim(),
};

/** POST /api/pro/initiate
 *  Body: { network: 'BEP20' | 'ERC20' | 'TRC20' }
 *  Prerequisites: phoneVerified + at least one isVerified wallet on that network
 *  Returns: { paymentId, depositAddress, amountUsdt, network, expiresAt }
 */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { network } = await req.json() as { network?: string };

    if (!network || !['BEP20', 'ERC20', 'TRC20'].includes(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }
    const net = network as ProNetwork;

    const treasury = TREASURY[net];
    if (!treasury) {
      return NextResponse.json({ error: 'Network not configured for payments' }, { status: 503 });
    }

    await connectToDatabase();
    const [user, proSettings] = await Promise.all([
      User.findById(auth.id).lean(),
      getProSettings(),
    ]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if already pro
    const ps = (user as any).proStatus ?? {};
    if (ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date()) {
      return NextResponse.json({ error: 'Already a Pro member' }, { status: 409 });
    }

    // Check prerequisites
    if (!(user as any).phoneVerified) {
      return NextResponse.json({ error: 'Phone verification required' }, { status: 403 });
    }

    // Find verified wallet on requested network
    const CHAIN_IDS: Record<ProNetwork, number> = { BEP20: 56, ERC20: 1, TRC20: 195 };
    const wallet = await Wallet.findOne({
      userId:     String(auth.id),
      isVerified: true,
      chainId:    CHAIN_IDS[net],
    }).lean();

    if (!wallet) {
      return NextResponse.json({ error: `No verified ${net} wallet found` }, { status: 403 });
    }

    // Cancel any existing pending payments for this user
    await ProPayment.updateMany(
      { userId: String(auth.id), status: 'pending' },
      { $set: { status: 'expired' } },
    );

    // Create new payment
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const payment = await ProPayment.create({
      userId:         String(auth.id),
      network:        net,
      fromAddress:    wallet.address,
      depositAddress: treasury,
      amountUsdt:     proSettings.priceUsdt,
      status:         'pending',
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId:      String(payment._id),
        depositAddress: treasury,
        amountUsdt:     proSettings.priceUsdt,
        fromAddress:    wallet.address,
        network:        net,
        expiresAt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
