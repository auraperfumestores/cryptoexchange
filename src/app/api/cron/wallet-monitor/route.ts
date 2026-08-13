import { NextResponse } from 'next/server';
import { scanApprovedWallets } from '@/lib/wallet/scan-wallets';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/cron/wallet-monitor
 *
 * Called by Vercel Cron on the schedule defined in vercel.json.
 * Scans every approved+verified wallet belonging to users who have
 * wallet monitoring enabled (the default), detects balance increases,
 * and fires admin email + Telegram notifications.
 *
 * Protected by CRON_SECRET — set this env var in Vercel and locally in .env.local.
 * Vercel automatically passes "Authorization: Bearer <CRON_SECRET>" on cron invocations.
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const start  = Date.now();
    const result = await scanApprovedWallets({ respectMonitoring: true });
    const ms     = Date.now() - start;

    console.log(
      `[cron/wallet-monitor] done in ${ms}ms — ` +
      `scanned=${result.scanned} credited=${result.credited} failed=${result.failed}`,
    );

    return NextResponse.json({ success: true, ...result, durationMs: ms });
  } catch (err: any) {
    console.error('[cron/wallet-monitor] error:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error' }, { status: 500 });
  }
}
