import { NextResponse }    from 'next/server';
import { requireAuth }     from '@/lib/auth/require-auth';
import { connectToDatabase } from '@/lib/db';
import { OtpCode, generateOtp, hashOtp } from '@/lib/db/models/OtpCode';
import { sendOtpSms }       from '@/lib/sms/gonums';
import { errorResponse }   from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const OTP_TTL_MINUTES      = 10;

/** POST /api/otp/send — sends a fresh OTP to a 10-digit Indian mobile number via Gonums */
export async function POST(req: Request) {
  try {
    await requireAuth();

    const { phone } = await req.json() as { phone?: string };
    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    await connectToDatabase();

    const recent = await OtpCode.findOne({ phone: digits, purpose: 'phone-verify' }).sort({ createdAt: -1 }).lean();
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

    await OtpCode.create({ phone: digits, codeHash: hash, purpose: 'phone-verify', expiresAt: exp });
    await sendOtpSms(digits, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
