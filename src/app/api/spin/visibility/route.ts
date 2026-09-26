import { NextResponse } from 'next/server';
import { connectToDatabase, isSpinHiddenFromUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/spin/visibility — whether Spin & Win entry points should be shown to users.
 *  Fails closed: any error reports the feature as hidden. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    await connectToDatabase();
    const visible = !(await isSpinHiddenFromUsers());
    return NextResponse.json({ success: true, data: { visible } }, { headers });
  } catch {
    return NextResponse.json({ success: true, data: { visible: false } }, { headers });
  }
}
