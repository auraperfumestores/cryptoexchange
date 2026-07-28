import { NextResponse }            from 'next/server';
import { connectToDatabase }       from '@/lib/db';
import { getDynamicRateSettings }  from '@/lib/db/models/SiteSetting';

export const dynamic = 'force-dynamic';

/** GET /api/dynamic-rates — public endpoint, no auth required.
 *  Returns the active dynamic rate settings so the client can show
 *  real-time effective rates as the user types their trade amount. */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await getDynamicRateSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    // Non-fatal: client will fall back to base rates
    return NextResponse.json({ success: false, data: null });
  }
}
