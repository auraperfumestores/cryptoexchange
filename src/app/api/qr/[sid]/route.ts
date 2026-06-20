import { NextResponse }                    from 'next/server';
import { connectToDatabase, WalletSession } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/qr/:sid
 *
 * Public (no auth) short-URL redirect for QR codes.
 * The desktop QR encodes this ~50-char URL instead of the full 500-char deep link,
 * making the QR scannable at a fraction of the density.
 *
 * Looks up the stored deepLink on the WalletSession and 302-redirects to it.
 */
export async function GET(
  _req: Request,
  { params }: { params: { sid: string } },
) {
  try {
    await connectToDatabase();
    const session = await WalletSession.findOne({ sid: params.sid }).select('deepLink').lean();

    if (!session?.deepLink) {
      return NextResponse.json({ error: 'QR link not found or expired' }, { status: 404 });
    }

    return NextResponse.redirect(session.deepLink, 302);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
