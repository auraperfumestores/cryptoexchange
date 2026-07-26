import { NextResponse } from 'next/server';
import { connectToDatabase, getDebugLogEnabled } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/debug-log-enabled — public endpoint so compact overlay pages (Trust Wallet in-app
 *  browser) can check if the admin wants debug panels shown. No auth required — the value is
 *  a non-sensitive display flag. */
export async function GET() {
  try {
    await connectToDatabase();
    const enabled = await getDebugLogEnabled();
    return NextResponse.json({ enabled });
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
