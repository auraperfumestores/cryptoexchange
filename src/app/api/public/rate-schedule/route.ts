import { NextResponse } from 'next/server';
import { connectToDatabase, getScheduledRateSettings, Rate } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/rate-schedule
 *
 * Public, unauthenticated endpoint. Returns the current exchange rates and all
 * upcoming / currently-active scheduled rate overrides. Expired slots are omitted.
 *
 * Poll this endpoint from any external website to know exactly when scheduled
 * price changes will occur. Recommended polling interval: 30–60 seconds.
 *
 * CORS: open to all origins so any external domain can fetch it directly.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const [scheduledCfg, rawRates] = await Promise.all([
      getScheduledRateSettings(),
      Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean(),
    ]);

    const now = Date.now();

    // ── Current base rates (USDT only) ─────────────────────────────────────
    const currentRates: Record<string, { buyRate: number; sellRate: number }> = {};
    for (const r of rawRates) {
      if (r.symbol === 'USDT') {
        currentRates[r.network] = { buyRate: r.buyRate, sellRate: r.sellRate };
      }
    }

    // ── Build schedule — only upcoming and currently-active slots ──────────
    const schedule = scheduledCfg.slots
      .map(slot => {
        const startMs = new Date(slot.startAt).getTime();
        const endMs   = startMs + slot.durationMinutes * 60_000;
        const endAt   = new Date(endMs).toISOString();

        let status: 'upcoming' | 'active' | 'expired';
        let secondsUntilStart: number | null = null;
        let secondsUntilEnd:   number | null = null;

        if (now < startMs) {
          status = 'upcoming';
          secondsUntilStart = Math.floor((startMs - now) / 1000);
        } else if (now < endMs) {
          status = 'active';
          secondsUntilEnd = Math.floor((endMs - now) / 1000);
        } else {
          status = 'expired';
        }

        const baseRate =
          currentRates[slot.network]?.[slot.type === 'buy' ? 'buyRate' : 'sellRate'] ?? null;

        return {
          id: slot.id,
          network: slot.network,
          type: slot.type,
          overrideRate: slot.rate,
          baseRate,
          startAt: slot.startAt,
          endAt,
          durationMinutes: slot.durationMinutes,
          status,
          secondsUntilStart,
          secondsUntilEnd,
        };
      })
      .filter(s => s.status !== 'expired');

    const body = {
      success: true,
      serverTime: new Date(now).toISOString(),
      scheduledOverridesEnabled: scheduledCfg.enabled,
      currentRates,
      schedule,
    };

    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Failed to load rate schedule' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
}

/** Handle preflight CORS requests from external domains */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
