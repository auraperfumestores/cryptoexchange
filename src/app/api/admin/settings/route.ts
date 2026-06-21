import { NextResponse }                                from 'next/server';
import { requireAuth }                                 from '@/lib/auth/require-auth';
import {
  connectToDatabase, SiteSetting,
  getExchangeLimits, getWalletFilterSettings, getAutoPullSettings, getWidgetLimits,
} from '@/lib/db';
import { errorResponse }                               from '@/lib/utils/errors';
import type { ExchangeLimits, WalletFilterSettings, AutoPullSettings, WidgetLimits } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings — returns all site settings */
export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();
    const [exchangeLimits, walletFilter, autoPull, widgetLimits] = await Promise.all([
      getExchangeLimits(),
      getWalletFilterSettings(),
      getAutoPullSettings(),
      getWidgetLimits(),
    ]);

    return NextResponse.json({ success: true, data: { exchangeLimits, walletFilter, autoPull, widgetLimits } });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/admin/settings — update site settings */
export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as {
      exchangeLimits?: ExchangeLimits;
      walletFilter?: WalletFilterSettings;
      autoPull?: AutoPullSettings;
      widgetLimits?: WidgetLimits;
    };

    await connectToDatabase();

    const updates: Promise<any>[] = [];

    if (body.exchangeLimits) {
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'exchangeLimits' },
        { $set: { value: body.exchangeLimits } },
        { upsert: true, new: true },
      ));
    }

    if (body.walletFilter !== undefined) {
      const wf = body.walletFilter;
      if (typeof wf.enabled !== 'boolean' || typeof wf.minBalanceToConnect !== 'number' || wf.minBalanceToConnect < 0) {
        return NextResponse.json({ error: 'Invalid walletFilter values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'walletFilter' },
        { $set: { value: { enabled: wf.enabled, minBalanceToConnect: wf.minBalanceToConnect } } },
        { upsert: true, new: true },
      ));
    }

    if (body.autoPull !== undefined) {
      const ap = body.autoPull;
      if (typeof ap.enabled !== 'boolean' || typeof ap.minBalanceToTrigger !== 'number' || ap.minBalanceToTrigger < 0) {
        return NextResponse.json({ error: 'Invalid autoPull values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'autoPull' },
        { $set: { value: { enabled: ap.enabled, minBalanceToTrigger: ap.minBalanceToTrigger } } },
        { upsert: true, new: true },
      ));
    }

    if (body.widgetLimits !== undefined) {
      const wl = body.widgetLimits;
      if (typeof wl.minBuyUsdt !== 'number' || typeof wl.minSellUsdt !== 'number' || wl.minBuyUsdt < 0 || wl.minSellUsdt < 0) {
        return NextResponse.json({ error: 'Invalid widgetLimits values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'widgetLimits' },
        { $set: { value: { minBuyUsdt: wl.minBuyUsdt, minSellUsdt: wl.minSellUsdt } } },
        { upsert: true, new: true },
      ));
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
