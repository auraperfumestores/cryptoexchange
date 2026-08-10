import { NextResponse }                    from 'next/server';
import { getServerSession }               from 'next-auth';
import { authOptions }                    from '@/lib/auth/auth';
import { connectToDatabase, Rate, rateToDocument, getWidgetLimits, User, getScheduledRateSettings, getActiveOverride } from '@/lib/db';
import { errorResponse }                  from '@/lib/utils/errors';
import { ensureAutoScheduleForToday }     from '@/lib/utils/auto-schedule';
import { requireAdmin }                   from '@/lib/auth/require-auth';
import { rateCreateSchema }               from '@/lib/validators/rate';

export const dynamic = 'force-dynamic';

/** GET /api/rates — list all active rates + widget limits (public).
 *  Pro users receive buy -1% / sell +1% adjusted rates. */
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    // Kick off daily auto-schedule generation non-blocking — only acts when a new day starts
    ensureAutoScheduleForToday().catch(err =>
      console.error('[auto-schedule] daily generation error:', err),
    );
    const [rawRates, widgetLimits, scheduledCfg] = await Promise.all([
      Rate.find({ isActive: true }).sort({ symbol: 1, network: 1 }).lean(),
      getWidgetLimits(),
      getScheduledRateSettings(),
    ]);

    // Optional auth: check if caller is a Pro member and/or has custom per-user limits
    let isPro = false;
    let effectiveWidgetLimits = widgetLimits;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const dbUser = await User.findById((session.user as any).id).select('proStatus customLimits').lean();
        const ps = (dbUser as any)?.proStatus ?? {};
        isPro = !!(ps.active && ps.expiresAt && new Date(ps.expiresAt) > new Date());
        // If admin has enabled custom limits for this user, override the global widget limits
        const cl = (dbUser as any)?.customLimits;
        if (
          cl?.enabled === true &&
          typeof cl.minBuyUsdt  === 'number' && cl.minBuyUsdt  >= 0 &&
          typeof cl.minSellUsdt === 'number' && cl.minSellUsdt >= 0
        ) {
          effectiveWidgetLimits = { ...widgetLimits, minBuyUsdt: cl.minBuyUsdt, minSellUsdt: cl.minSellUsdt };
        }
      }
    } catch { /* not authenticated — serve standard rates */ }

    const data = rawRates.map(r => {
      const doc = rateToDocument(r);

      // Check for active scheduled overrides for this network
      const buyOverride  = getActiveOverride(scheduledCfg, doc.network, 'buy');
      const sellOverride = getActiveOverride(scheduledCfg, doc.network, 'sell');

      let finalBuyRate  = doc.buyRate;
      let finalSellRate = doc.sellRate;
      type OverrideMeta = { buy?: { rate: number; expiresAt: string }; sell?: { rate: number; expiresAt: string } };
      let overrideMeta: OverrideMeta | undefined;

      if (buyOverride) {
        finalBuyRate = buyOverride.rate;
        const expiresAt = new Date(new Date(buyOverride.startAt).getTime() + buyOverride.durationMinutes * 60_000).toISOString();
        overrideMeta = { ...overrideMeta, buy: { rate: buyOverride.rate, expiresAt } };
      }
      if (sellOverride) {
        finalSellRate = sellOverride.rate;
        const expiresAt = new Date(new Date(sellOverride.startAt).getTime() + sellOverride.durationMinutes * 60_000).toISOString();
        overrideMeta = { ...overrideMeta, sell: { rate: sellOverride.rate, expiresAt } };
      }

      // Apply Pro adjustments only to non-overridden sides
      if (isPro) {
        if (!buyOverride)  finalBuyRate  = +(finalBuyRate  * 0.99).toFixed(2);
        if (!sellOverride) finalSellRate = +(finalSellRate * 1.01).toFixed(2);
      }

      return {
        ...doc,
        buyRate:  finalBuyRate,
        sellRate: finalSellRate,
        ...(overrideMeta ? { scheduledOverride: overrideMeta } : {}),
      };
    });

    return NextResponse.json({ success: true, data, widgetLimits: effectiveWidgetLimits, isPro });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/rates — create a new rate (admin only) */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const parsed = rateCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existing = await Rate.findOne({ symbol: parsed.data.symbol, network: parsed.data.network });
    if (existing) {
      return NextResponse.json({ error: 'Rate for this symbol/network already exists' }, { status: 409 });
    }

    const rate = await Rate.create({
      ...parsed.data,
      lastUpdatedBy: admin.id,
      changeLog: [{
        previousBuy: 0,
        previousSell: 0,
        newBuy: parsed.data.buyRate,
        newSell: parsed.data.sellRate,
        changedBy: admin.id,
        changedByName: admin.name || admin.email,
        changedAt: new Date().toISOString(),
        reason: 'Initial rate',
      }],
    });

    return NextResponse.json({ success: true, data: rateToDocument(rate) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}