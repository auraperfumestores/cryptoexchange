import { NextResponse }      from 'next/server';
import { requireAuth }       from '@/lib/auth/require-auth';
import { connectToDatabase, User, WalletOtpIpLog } from '@/lib/db';
import { OtpCode, generateOtp, hashOtp } from '@/lib/db/models/OtpCode';
import { sendOtpSms }         from '@/lib/sms/gonums';
import { errorResponse }      from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const OTP_TTL_MINUTES       = 10;
const IP_WINDOW_MS          = 6 * 60 * 60 * 1000; /* 6 hours */
const IP_MAX_SENDS          = 8;

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** POST /api/wallet-otp/send — sends a wallet-confirmation OTP to the caller's own verified phone */
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    await connectToDatabase();

    const user = await User.findById(auth.id).select('phone phoneVerified').lean();
    const phone = (user as any)?.phone as string | undefined;
    if (!phone || !(user as any)?.phoneVerified) {
      return NextResponse.json({ error: 'Verify your phone number first' }, { status: 400 });
    }

    const ip = clientIp(req);
    const ipCount = await WalletOtpIpLog.countDocuments({ ip, createdAt: { $gt: new Date(Date.now() - IP_WINDOW_MS) } } as any);
    if (ipCount >= IP_MAX_SENDS) {
      return NextResponse.json({ error: 'Too many wallet-confirmation attempts from this connection. Please try again later.' }, { status: 429 });
    }

    const recent = await OtpCode.findOne({ phone, purpose: 'wallet-verify' }).sort({ createdAt: -1 }).lean();
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

    await OtpCode.create({ phone, codeHash: hash, purpose: 'wallet-verify', expiresAt: exp });
    await WalletOtpIpLog.create({ ip, expiresAt: new Date(Date.now() + IP_WINDOW_MS) });
    await sendOtpSms(phone, otp, 'wallet-verify');

    return NextResponse.json({ success: true, phone });
  } catch (err) {
    return errorResponse(err);
  }
}
