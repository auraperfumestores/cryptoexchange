import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';

export const dynamic = 'force-dynamic';

const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

/* Bank handle → display name map (common Indian UPI handles) */
const BANK_HANDLES: Record<string, string> = {
  okaxis: 'Axis Bank', axis: 'Axis Bank', axisbank: 'Axis Bank',
  okhdfcbank: 'HDFC Bank', hdfc: 'HDFC Bank', hdfcbank: 'HDFC Bank',
  okicici: 'ICICI Bank', icici: 'ICICI Bank',
  oksbi: 'State Bank of India', sbi: 'State Bank of India', ybl: 'PhonePe (Yes Bank)',
  paytm: 'Paytm Payments Bank', ptyes: 'Paytm (Yes Bank)',
  upi: 'UPI', gpay: 'Google Pay', ibl: 'IndusInd Bank',
  kotak: 'Kotak Bank', kotakbank: 'Kotak Bank',
  pnb: 'Punjab National Bank', cnrb: 'Canara Bank', boi: 'Bank of India',
  unionbank: 'Union Bank', aubank: 'AU Small Finance Bank',
  rapl: 'Razorpay', rzp: 'Razorpay',
  apl: 'Amazon Pay', amazonpay: 'Amazon Pay',
  freecharge: 'Freecharge', fc: 'Freecharge',
  airtel: 'Airtel Payments Bank', airtelpaymentsbank: 'Airtel Payments Bank',
  jio: 'Jio Payments Bank', mahb: 'Bank of Maharashtra',
  idbi: 'IDBI Bank', federal: 'Federal Bank',
  rbl: 'RBL Bank', cub: 'City Union Bank',
  kvb: 'Karur Vysya Bank', tmb: 'Tamilnad Mercantile Bank',
  idfcbank: 'IDFC FIRST Bank', idfc: 'IDFC FIRST Bank',
};

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { upiId } = await req.json() as { upiId?: string };

    if (!upiId || typeof upiId !== 'string') {
      return NextResponse.json({ valid: false, error: 'UPI ID is required' }, { status: 400 });
    }

    const trimmed = upiId.trim().toLowerCase();

    if (!UPI_REGEX.test(trimmed)) {
      return NextResponse.json({ valid: false, error: 'Invalid UPI ID format. Expected format: name@bank' });
    }

    const handle = trimmed.split('@')[1];
    const bankName = BANK_HANDLES[handle] ?? null;

    if (!bankName) {
      return NextResponse.json({
        valid: true,
        verified: false,
        message: 'UPI ID format is valid. Bank handle not recognised — please double-check before proceeding.',
      });
    }

    return NextResponse.json({
      valid: true,
      verified: true,
      bankName,
      message: `Linked to ${bankName}`,
    });
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
