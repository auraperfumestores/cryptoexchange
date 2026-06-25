import { NextResponse }            from 'next/server';
import { requireAuth }             from '@/lib/auth/require-auth';
import { connectToDatabase, User } from '@/lib/db';
import { errorResponse }           from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** POST /api/otp/verify — verifies the OTP via MSG91 and marks the user's phone as verified */
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

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      console.error('[OTP] MSG91_AUTH_KEY not configured');
      return NextResponse.json({ error: 'OTP service is not configured. Please contact support.' }, { status: 500 });
    }

    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${encodeURIComponent(otpCode)}&mobile=91${digits}&authkey=${encodeURIComponent(authKey)}`;
    const res  = await fetch(url, { method: 'POST' });
    const data = await res.json().catch(() => ({}));

    if (data?.type !== 'success') {
      const msg: string = data?.message || 'Invalid or expired OTP';
      const friendly = /invalid/i.test(msg) ? 'Wrong OTP. Try again.' : msg;
      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    await connectToDatabase();
    await User.updateOne({ _id: auth.id }, { $set: { phone: digits, phoneVerified: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
