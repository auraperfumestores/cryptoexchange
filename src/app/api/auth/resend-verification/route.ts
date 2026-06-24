import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase, User } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 60 * 1000;

/** POST /api/auth/resend-verification
 *  Re-sends the verification email for an unverified account. Always returns
 *  200 with a generic message to avoid leaking which emails are registered. */
export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email) return NextResponse.json({ success: true });

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+emailVerifyToken +emailVerifyExpiresAt +verifyEmailLastSentAt');

    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const lastSent = user.verifyEmailLastSentAt ?? 0;
    const elapsed = Date.now() - lastSent;
    if (elapsed < COOLDOWN_MS) {
      return NextResponse.json({
        success: true,
        cooldownSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
      });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    user.emailVerifyToken = verifyToken;
    user.emailVerifyExpiresAt = verifyExpiresAt;
    user.verifyEmailLastSentAt = Date.now();
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (err) {
      console.error('[resend-verification] email send failed:', err);
    }

    return NextResponse.json({ success: true, cooldownSeconds: COOLDOWN_MS / 1000 });
  } catch (err) {
    console.error('[resend-verification]', err);
    return NextResponse.json({ success: true });
  }
}
