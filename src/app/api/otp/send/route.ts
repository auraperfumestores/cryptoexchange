import { NextResponse }    from 'next/server';
import { requireAuth }     from '@/lib/auth/require-auth';
import { errorResponse }   from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** POST /api/otp/send — sends a fresh OTP to a 10-digit Indian mobile number via MSG91 */
export async function POST(req: Request) {
  try {
    await requireAuth();

    const { phone } = await req.json() as { phone?: string };
    const digits = (phone ?? '').replace(/\D/g, '');
    if (digits.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    const authKey    = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (!authKey || !templateId) {
      console.error('[OTP] MSG91_AUTH_KEY / MSG91_TEMPLATE_ID not configured');
      return NextResponse.json({ error: 'OTP service is not configured. Please contact support.' }, { status: 500 });
    }

    const url = `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(templateId)}&mobile=91${digits}&authkey=${encodeURIComponent(authKey)}`;
    const res  = await fetch(url, { method: 'POST' });
    const data = await res.json().catch(() => ({}));

    if (data?.type !== 'success') {
      console.error('[OTP] MSG91 send failed:', data);
      return NextResponse.json({ error: data?.message || 'Failed to send OTP. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
