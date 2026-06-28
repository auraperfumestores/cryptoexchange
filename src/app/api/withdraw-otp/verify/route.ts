import { NextResponse }      from 'next/server';
import { requireAuth }       from '@/lib/auth/require-auth';
import { connectToDatabase, User } from '@/lib/db';
import { OtpCode, hashOtp }   from '@/lib/db/models/OtpCode';
import { errorResponse }      from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;

/** POST /api/withdraw-otp/verify — confirms the withdrawal-confirmation OTP for the caller's own phone */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    const { otp } = await req.json() as { otp?: string };
    const otpCode = (otp ?? '').replace(/\D/g, '');
    if (otpCode.length !== 6) {
      return NextResponse.json({ error: 'Enter all 6 digits' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(auth.id).select('phone phoneVerified').lean();
    const phone = (user as any)?.phone as string | undefined;
    if (!phone || !(user as any)?.phoneVerified) {
      return NextResponse.json({ error: 'Verify your phone number first' }, { status: 400 });
    }

    const record = await OtpCode.findOne({ phone, purpose: 'withdraw-verify', verified: false })
      .sort({ createdAt: -1 });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
    }

    if (hashOtp(otpCode) !== record.codeHash) {
      record.attempts += 1;
      await record.save();
      return NextResponse.json({ error: 'Wrong OTP. Try again.' }, { status: 400 });
    }

    record.verified = true;
    await record.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
