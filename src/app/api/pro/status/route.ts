import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase, User, ProPayment, getProSettings } from '@/lib/db';
import { errorResponse }           from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/pro/status — returns current pro status + any pending/awaiting payment.
 *  Pro can be paid from any wallet — no wallet connection is required to upgrade. */
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
    const phoneVerified = !!(user as any).phoneVerified;

    // Check for a pending or phone-pending payment (not expired)
    const pending = await ProPayment.findOne({
      userId: String(auth.id),
      status: { $in: ['pending', 'awaiting_phone'] },
      expiresAt: { $gt: new Date() },
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        isPro:         !!isActive,
        activatedAt:   ps.activatedAt ?? null,
        expiresAt:     ps.expiresAt   ?? null,
        phoneVerified,
        priceUsdt:     proSettings.priceUsdt,
        durationDays:  proSettings.durationDays,
        managerTelegram: proSettings.managerTelegram,
        pendingPayment: pending ? {
          id:             String((pending as any)._id),
          status:         pending.status,
          network:        pending.network,
          depositAddress: pending.depositAddress,
          amountUsdt:     pending.amountUsdt,
          expiresAt:      pending.expiresAt,
        } : null,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
