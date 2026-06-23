import { NextResponse }                       from 'next/server';
import { requireAuth }                        from '@/lib/auth/require-auth';
import { connectToDatabase, User, ProPayment, getProSettings } from '@/lib/db';
import { errorResponse }                      from '@/lib/utils/errors';
import type { ProNetwork }                    from '@/lib/db';

export const dynamic = 'force-dynamic';

const TREASURY: Record<ProNetwork, string> = {
  BEP20: (process.env.VAULT_BEP20 ?? '').trim(),
  ERC20: (process.env.VAULT_ERC20 ?? '').trim(),
  TRC20: (process.env.VAULT_TRC20 ?? '').trim(),
};

/** Decorate the base price with a small unique cents offset so a payment can be
 *  identified on a shared treasury address regardless of which wallet sent it. */
async function uniqueAmount(network: ProNetwork, depositAddress: string, basePrice: number): Promise<number> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const offset = Math.floor(Math.random() * 99) + 1; // 0.01 – 0.99
    const amount = Math.round((basePrice + offset / 100) * 1000) / 1000;
    const clash = await ProPayment.findOne({
      network, depositAddress, amountUsdt: amount,
      status: { $in: ['pending', 'awaiting_phone'] },
    }).lean();
    if (!clash) return amount;
  }
  return Math.round((basePrice + Math.random()) * 1000) / 1000;
}

/** POST /api/pro/initiate
 *  Body: { network: 'BEP20' | 'ERC20' | 'TRC20' }
 *  No wallet connection required — Pro can be paid from any address.
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

    // Cancel any existing pending/awaiting payments for this user
    await ProPayment.updateMany(
      { userId: String(auth.id), status: { $in: ['pending', 'awaiting_phone'] } },
      { $set: { status: 'expired' } },
    );

    const amountUsdt = await uniqueAmount(net, treasury, proSettings.priceUsdt);

    // Create new payment
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const payment = await ProPayment.create({
      userId:         String(auth.id),
      network:        net,
      fromAddress:    '',
      depositAddress: treasury,
      amountUsdt,
      status:         'pending',
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId:      String(payment._id),
        depositAddress: treasury,
        amountUsdt,
        fromAddress:    '',
        network:        net,
        expiresAt,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
