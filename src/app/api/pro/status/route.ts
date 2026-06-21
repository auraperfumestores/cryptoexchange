import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase, User, ProPayment, getProSettings, Wallet } from '@/lib/db';
import { errorResponse }           from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/pro/status — returns current pro status + any pending payment */
export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const [user, proSettings] = await Promise.all([
      User.findById(auth.id).lean(),
      getProSettings(),
    ]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ps = (user as any).proStatus ?? {};
    const isActive = ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date();

    // Check for a pending payment (not expired, not confirmed)
    const pending = await ProPayment.findOne({
      userId: String(auth.id),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).lean();

    // Check prerequisites
    const wallets = await Wallet.find({ userId: String(auth.id), isVerified: true }).lean();
    const phoneVerified = !!(user as any).phoneVerified;
    const hasWallet = wallets.length > 0;

    return NextResponse.json({
      success: true,
      data: {
        isPro:         !!isActive,
        activatedAt:   ps.activatedAt ?? null,
        expiresAt:     ps.expiresAt   ?? null,
        phoneVerified,
        hasWallet,
        priceUsdt:     proSettings.priceUsdt,
        durationDays:  proSettings.durationDays,
        managerTelegram: proSettings.managerTelegram,
        pendingPayment: pending ? {
          id:             String((pending as any)._id),
          network:        pending.network,
          depositAddress: pending.depositAddress,
          amountUsdt:     pending.amountUsdt,
          fromAddress:    pending.fromAddress,
          expiresAt:      pending.expiresAt,
        } : null,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
