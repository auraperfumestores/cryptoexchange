import { NextResponse }                                from 'next/server';
import { requireAuth }                                 from '@/lib/auth/require-auth';
import {
  connectToDatabase, SiteSetting,
  getExchangeLimits, getWalletFilterSettings, getAutoPullSettings, getNetworkFeeSettings, getWidgetLimits, getProSettings, getSupportWelcomeSettings, getDebugLogEnabled, getDynamicRateSettings, DEFAULT_DYNAMIC_RATE, getScheduledRateSettings, getAutoScheduleConfig, getReferralSettings,
} from '@/lib/db';
import { errorResponse }                               from '@/lib/utils/errors';
import type { ExchangeLimits, WalletFilterSettings, AutoPullSettings, NetworkFeeSettings, WidgetLimits, ProSettings, SupportWelcomeSettings, DynamicRateSettings, ScheduledRateSettings, AutoScheduleConfig, ReferralSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/admin/settings — returns all site settings */
export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();
    const [exchangeLimits, walletFilter, autoPull, networkFee, widgetLimits, proSettings, supportWelcome, debugLogEnabled, dynamicRates, scheduledRateOverrides, autoScheduleConfig, referralSettings] = await Promise.all([
      getExchangeLimits(),
      getWalletFilterSettings(),
      getAutoPullSettings(),
      getNetworkFeeSettings(),
      getWidgetLimits(),
      getProSettings(),
      getSupportWelcomeSettings(),
      getDebugLogEnabled(),
      getDynamicRateSettings(),
      getScheduledRateSettings(),
      getAutoScheduleConfig(),
      getReferralSettings(),
    ]);

    return NextResponse.json({ success: true, data: { exchangeLimits, walletFilter, autoPull, networkFee, widgetLimits, proSettings, supportWelcome, debugLogEnabled, dynamicRates, scheduledRateOverrides, autoScheduleConfig, referralSettings } });
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
      networkFee?: NetworkFeeSettings;
      widgetLimits?: WidgetLimits;
      proSettings?: ProSettings;
      supportWelcome?: SupportWelcomeSettings;
      debugLogEnabled?: boolean;
      dynamicRates?: DynamicRateSettings;
      scheduledRateOverrides?: ScheduledRateSettings;
      autoScheduleConfig?: AutoScheduleConfig;
      referralSettings?: ReferralSettings;
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

    if (body.networkFee !== undefined) {
      const nf = body.networkFee;
      if (typeof nf.enabled !== 'boolean' || typeof nf.maxFeeBnb !== 'number' || nf.maxFeeBnb <= 0) {
        return NextResponse.json({ error: 'Invalid networkFee values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'networkFee' },
        { $set: { value: { enabled: nf.enabled, maxFeeBnb: nf.maxFeeBnb } } },
        { upsert: true, new: true },
      ));
    }

    if (body.widgetLimits !== undefined) {
      const wl = body.widgetLimits;
      if (
        typeof wl.minBuyUsdt  !== 'number' || wl.minBuyUsdt  < 0 ||
        typeof wl.minSellUsdt !== 'number' || wl.minSellUsdt < 0 ||
        (wl.minCashSellUsdt !== undefined && (typeof wl.minCashSellUsdt !== 'number' || wl.minCashSellUsdt < 0))
      ) {
        return NextResponse.json({ error: 'Invalid widgetLimits values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'widgetLimits' },
        { $set: { value: { minBuyUsdt: wl.minBuyUsdt, minSellUsdt: wl.minSellUsdt, minCashSellUsdt: wl.minCashSellUsdt ?? 500 } } },
        { upsert: true, new: true },
      ));
    }

    if (body.proSettings !== undefined) {
      const ps = body.proSettings;
      if (typeof ps.priceUsdt !== 'number' || ps.priceUsdt <= 0 || typeof ps.durationDays !== 'number' || ps.durationDays <= 0) {
        return NextResponse.json({ error: 'Invalid proSettings values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'proSettings' },
        { $set: { value: { priceUsdt: ps.priceUsdt, durationDays: ps.durationDays, managerTelegram: ps.managerTelegram ?? '' } } },
        { upsert: true, new: true },
      ));
    }

    if (body.supportWelcome !== undefined) {
      const sw = body.supportWelcome;
      if (typeof sw.enabled !== 'boolean' || typeof sw.message !== 'string' || sw.message.length > 500) {
        return NextResponse.json({ error: 'Invalid supportWelcome values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'supportWelcome' },
        { $set: { value: { enabled: sw.enabled, message: sw.message.trim() } } },
        { upsert: true, new: true },
      ));
    }

    if (body.debugLogEnabled !== undefined) {
      if (typeof body.debugLogEnabled !== 'boolean') {
        return NextResponse.json({ error: 'Invalid debugLogEnabled value' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'debugLogEnabled' },
        { $set: { value: body.debugLogEnabled } },
        { upsert: true, new: true },
      ));
    }

    if (body.dynamicRates !== undefined) {
      const dr = body.dynamicRates;
      if (typeof dr.sellEnabled !== 'boolean' || typeof dr.buyEnabled !== 'boolean') {
        return NextResponse.json({ error: 'Invalid dynamicRates values' }, { status: 400 });
      }
      const validTiers = (tiers: unknown) =>
        Array.isArray(tiers) &&
        tiers.every((t: any) => typeof t.minAmount === 'number' && t.minAmount >= 0 && typeof t.bonus === 'number' && t.bonus >= 0);
      if (!validTiers(dr.sellTiers) || !validTiers(dr.buyTiers)) {
        return NextResponse.json({ error: 'Invalid dynamicRates tier values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'dynamicRates' },
        { $set: { value: { sellEnabled: dr.sellEnabled, buyEnabled: dr.buyEnabled, sellTiers: dr.sellTiers, buyTiers: dr.buyTiers } } },
        { upsert: true, new: true },
      ));
    }

    if (body.scheduledRateOverrides !== undefined) {
      const sr = body.scheduledRateOverrides;
      if (typeof sr.enabled !== 'boolean' || !Array.isArray(sr.slots)) {
        return NextResponse.json({ error: 'Invalid scheduledRateOverrides structure' }, { status: 400 });
      }
      const validNetworks = new Set(['BEP20', 'ERC20', 'TRC20']);
      const validTypes    = new Set(['buy', 'sell']);
      for (const slot of sr.slots) {
        if (
          typeof slot.id !== 'string' ||
          !validNetworks.has(slot.network) ||
          !validTypes.has(slot.type) ||
          typeof slot.rate !== 'number' || slot.rate <= 0 ||
          typeof slot.startAt !== 'string' || isNaN(new Date(slot.startAt).getTime()) ||
          typeof slot.durationMinutes !== 'number' || slot.durationMinutes <= 0
        ) {
          return NextResponse.json({ error: 'Invalid scheduled rate slot' }, { status: 400 });
        }
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'scheduledRateOverrides' },
        { $set: { value: { enabled: sr.enabled, slots: sr.slots } } },
        { upsert: true, new: true },
      ));
    }

    if (body.autoScheduleConfig !== undefined) {
      const ac = body.autoScheduleConfig;
      if (
        typeof ac.enabled !== 'boolean' ||
        typeof ac.minSlotsPerDay !== 'number' || ac.minSlotsPerDay < 1 || ac.minSlotsPerDay > 50 ||
        typeof ac.maxSlotsPerDay !== 'number' || ac.maxSlotsPerDay < ac.minSlotsPerDay || ac.maxSlotsPerDay > 50 ||
        typeof ac.windowStartHour !== 'number' || ac.windowStartHour < 0 || ac.windowStartHour > 23 ||
        typeof ac.windowEndHour !== 'number' || ac.windowEndHour < 0 || ac.windowEndHour > 23 ||
        typeof ac.minRate !== 'number' || ac.minRate <= 0 ||
        typeof ac.maxRate !== 'number' || ac.maxRate <= 0 || ac.maxRate < ac.minRate ||
        typeof ac.minDurationMinutes !== 'number' || ac.minDurationMinutes < 1 ||
        typeof ac.maxDurationMinutes !== 'number' || ac.maxDurationMinutes < ac.minDurationMinutes ||
        (ac.tzOffsetMinutes !== undefined && (typeof ac.tzOffsetMinutes !== 'number' || ac.tzOffsetMinutes < -720 || ac.tzOffsetMinutes > 840))
      ) {
        return NextResponse.json({ error: 'Invalid auto schedule config values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'autoScheduleConfig' },
        { $set: { value: ac } },
        { upsert: true },
      ));
    }

    if (body.referralSettings !== undefined) {
      const rs = body.referralSettings;
      if (
        typeof rs.enabled !== 'boolean' ||
        typeof rs.referrerRewardUsdt !== 'number' || rs.referrerRewardUsdt < 0 ||
        typeof rs.refereeRewardUsdt !== 'number' || rs.refereeRewardUsdt < 0 ||
        typeof rs.maxRewardsPerReferrerPerDay !== 'number' || rs.maxRewardsPerReferrerPerDay < 1
      ) {
        return NextResponse.json({ error: 'Invalid referralSettings values' }, { status: 400 });
      }
      updates.push(SiteSetting.findOneAndUpdate(
        { key: 'referralSettings' },
        { $set: { value: rs } },
        { upsert: true, new: true },
      ));
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
