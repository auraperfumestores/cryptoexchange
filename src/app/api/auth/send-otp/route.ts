import { NextResponse }     from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OtpCode, generateOtp, hashOtp } from '@/lib/db/models/OtpCode';
import { sendOtpSms }        from '@/lib/sms/send-sms';
import { requireAuth }       from '@/lib/auth/require-auth';
import { errorResponse }     from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;  /* 1 minute between resends */
const OTP_TTL_MINUTES      = 10;

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { phone, purpose = 'phone-verify' } = await req.json() as { phone?: string; purpose?: string };

    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    await connectToDatabase();

    /* Rate-limit: block if a code was sent in the last 60 seconds */
    const recent = await OtpCode.findOne({ phone: digits, purpose }).sort({ createdAt: -1 }).lean();
    if (recent) {
      const age = Date.now() - new Date((recent as any).createdAt).getTime();
      if (age < RATE_LIMIT_WINDOW_MS) {
        const wait = Math.ceil((RATE_LIMIT_WINDOW_MS - age) / 1000);
        return NextResponse.json({ error: `Please wait ${wait}s before requesting another OTP` }, { status: 429 });
      }
    }

    const otp  = generateOtp();
    const hash = hashOtp(otp);
    const exp  = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await OtpCode.create({ phone: digits, codeHash: hash, purpose, expiresAt: exp });
    await sendOtpSms(digits, otp);

    return NextResponse.json({ success: true, message: `OTP sent to +91 ${digits}` });
  } catch (err) {
    return errorResponse(err);
  }
}
