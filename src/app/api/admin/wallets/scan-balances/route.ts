import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { scanApprovedWallets } from '@/lib/wallet/scan-wallets';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** POST /api/admin/wallets/scan-balances — admin only.
 *  Scans ALL approved+verified wallets regardless of the per-user monitoring toggle.
 *  Used by the admin panel "Scan Wallets" button and the page-load auto-scan. */
export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const result = await scanApprovedWallets({ respectMonitoring: false });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return errorResponse(err);
  }
}
