import { NextResponse } from 'next/server';
import { connectToDatabase, User, userToDocument } from '@/lib/db';
import { errorResponse, notFound } from '@/lib/utils/errors';
import { requireAdmin } from '@/lib/auth/require-auth';
import { isPhoneAlreadyVerified } from '@/lib/phone/uniqueness';

type RouteParams = { params: { id: string } };

/** GET /api/users/[id] — single user (admin only) */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) return notFound('User not found');
    return NextResponse.json({ success: true, data: userToDocument(user) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/users/[id] — update user (admin only, e.g. toggle active) */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const user = await User.findById(params.id);
    if (!user) return notFound('User not found');

    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.kycStatus) user.kycStatus = body.kycStatus;
    if (body.role && ['client', 'admin'].includes(body.role)) user.role = body.role;
    if (typeof body.platformWalletFallback === 'boolean') user.platformWalletFallback = body.platformWalletFallback;
    if (typeof body.walletMonitoring       === 'boolean') user.walletMonitoring       = body.walletMonitoring;

    if (body.customLimits !== undefined) {
      const cl = body.customLimits;
      if (typeof cl.enabled !== 'boolean') {
        return NextResponse.json({ error: 'customLimits.enabled must be a boolean' }, { status: 400 });
      }
      if (
        typeof cl.minBuyUsdt  !== 'number' || cl.minBuyUsdt  < 0 ||
        typeof cl.minSellUsdt !== 'number' || cl.minSellUsdt < 0 ||
        (cl.minWithdrawUsdt !== undefined && (typeof cl.minWithdrawUsdt !== 'number' || cl.minWithdrawUsdt < 0))
      ) {
        return NextResponse.json({ error: 'customLimits amounts must be non-negative numbers' }, { status: 400 });
      }
      user.customLimits = {
        enabled:         cl.enabled,
        minBuyUsdt:      cl.minBuyUsdt,
        minSellUsdt:     cl.minSellUsdt,
        // Preserve any existing value when the client omits the field.
        minWithdrawUsdt: cl.minWithdrawUsdt ?? user.customLimits?.minWithdrawUsdt ?? 0,
      };
    }

    // ── Admin phone / OTP bypass ────────────────────────────────────────────
    // Shape: { enabled: boolean, skipAllOtp: boolean, phone?: '9876543210' }
    // Enabling with a phone marks it verified without an OTP round-trip. Phone
    // uniqueness is still enforced, so the one-phone-per-account invariant that
    // registration and OTP flows rely on is never violated.
    if (body.phoneBypass !== undefined) {
      const pb = body.phoneBypass;
      if (typeof pb.enabled !== 'boolean' || typeof pb.skipAllOtp !== 'boolean') {
        return NextResponse.json({ error: 'phoneBypass.enabled and .skipAllOtp must be booleans' }, { status: 400 });
      }

      if (pb.enabled && pb.phone !== undefined && String(pb.phone).trim() !== '') {
        const digits = String(pb.phone).replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(digits)) {
          return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
        }
        if (await isPhoneAlreadyVerified(digits, params.id)) {
          return NextResponse.json(
            { error: 'This phone number is already verified on another account. Use a different number.' },
            { status: 409 },
          );
        }
        user.phone = digits;
        user.phoneVerified = true;
      }

      // Turning the bypass off only clears the flags. The phone number and its
      // verified state are left as-is, so disabling never silently locks the
      // user out of flows that already depend on a verified phone.
      user.phoneBypass = { enabled: pb.enabled, skipAllOtp: pb.enabled ? pb.skipAllOtp : false };
    }

    if (body.proAction === 'grant') {
      const days = Math.max(1, Number(body.proDays) || 30);
      const activatedAt = new Date();
      const expiresAt   = new Date(activatedAt.getTime() + days * 24 * 60 * 60 * 1000);
      user.proStatus = { active: true, activatedAt, expiresAt, paymentId: null };
    } else if (body.proAction === 'revoke') {
      user.proStatus = { active: false, activatedAt: null, expiresAt: null, paymentId: null };
    }

    await user.save();
    return NextResponse.json({ success: true, data: userToDocument(user) });
  } catch (err) {
    return errorResponse(err);
  }
}