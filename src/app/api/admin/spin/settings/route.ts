import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-auth';
import { connectToDatabase, SiteSetting, getSpinSettings } from '@/lib/db';
import type { SpinSettings, SpinTierRule } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

/** GET /api/admin/spin/settings — current Spin & Win configuration. */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    return NextResponse.json({ success: true, data: await getSpinSettings() });
  } catch (err) {
    return errorResponse(err);
  }
}

function num(v: unknown, min = 0): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= min ? v : null;
}
function tier(v: unknown): SpinTierRule | null {
  if (!v || typeof v !== 'object') return null;
  const t = v as Partial<SpinTierRule>;
  const winRatePct = num(t.winRatePct);
  const maxWinUsdt = num(t.maxWinUsdt);
  if (winRatePct === null || winRatePct > 100 || maxWinUsdt === null) return null;
  return { winRatePct, maxWinUsdt };
}

/** PATCH /api/admin/spin/settings — validate and save the full settings object. */
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = (await req.json()) as Partial<SpinSettings>;

    const enabled            = typeof body.enabled === 'boolean' ? body.enabled : null;
    // Missing (e.g. an older admin tab) keeps the saved value rather than silently un-hiding.
    const hiddenFromUsers    = typeof body.hiddenFromUsers === 'boolean' ? body.hiddenFromUsers : undefined;
    const autoApproveMaxUsdt = num(body.autoApproveMaxUsdt);
    const spinsPer100Usdt    = num(body.spinsPer100Usdt);
    const requireMinOrder    = typeof body.requireMinOrderForDeposit === 'boolean' ? body.requireMinOrderForDeposit : null;
    const dailyBudgetUsdt    = num(body.dailyBudgetUsdt);
    const signupSpins        = num(body.signupSpins);
    const freeTier           = tier(body.freeTier);
    const depositTier        = tier(body.depositTier);

    if (
      enabled === null || autoApproveMaxUsdt === null || spinsPer100Usdt === null || requireMinOrder === null ||
      dailyBudgetUsdt === null || signupSpins === null || !freeTier || !depositTier
    ) {
      return NextResponse.json({ error: 'Invalid spin settings — all fields are required and must be non-negative (win rates 0–100).' }, { status: 400 });
    }

    await connectToDatabase();
    const value: SpinSettings = {
      enabled,
      hiddenFromUsers: hiddenFromUsers ?? (await getSpinSettings()).hiddenFromUsers,
      autoApproveMaxUsdt,
      spinsPer100Usdt: Math.floor(spinsPer100Usdt),
      requireMinOrderForDeposit: requireMinOrder,
      dailyBudgetUsdt,
      signupSpins: Math.floor(signupSpins),
      freeTier,
      depositTier,
    };

    await SiteSetting.findOneAndUpdate({ key: 'spinSettings' }, { $set: { value } }, { upsert: true });
    return NextResponse.json({ success: true, data: value });
  } catch (err) {
    return errorResponse(err);
  }
}
