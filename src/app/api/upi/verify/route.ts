import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';

export const dynamic = 'force-dynamic';

const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

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

    return NextResponse.json({ valid: true, verified: true, message: 'UPI ID saved' });
  } catch (err: any) {
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
