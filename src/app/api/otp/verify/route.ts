import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase, User } from '@/lib/db';
import { OtpCode, hashOtp }        from '@/lib/db/models/OtpCode';
import { errorResponse }           from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;

/** POST /api/otp/verify — checks the OTP against the stored hash and marks the user's phone as verified */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();

    const { phone, otp } = await req.json() as { phone?: string; otp?: string };
    const digits  = (phone ?? '').replace(/\D/g, '');
    const otpCode = (otp ?? '').replace(/\D/g, '');
    if (digits.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    if (otpCode.length !== 6) {
      return NextResponse.json({ error: 'Enter all 6 digits' }, { status: 400 });
    }

    await connectToDatabase();

    const record = await OtpCode.findOne({ phone: digits, purpose: 'phone-verify', verified: false })
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

    await User.updateOne({ _id: auth.id }, { $set: { phone: digits, phoneVerified: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
