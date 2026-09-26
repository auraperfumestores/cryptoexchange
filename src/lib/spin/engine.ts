import { randomInt } from 'crypto';
import { SPIN_PRIZES } from '@/lib/spin/prizes';
import type { SpinTierRule } from '@/lib/db/models/SiteSetting';

/* ── IST day helpers ─────────────────────────────────────────────────────── */
const IST_OFFSET_MS = 330 * 60 * 1000;

/** 'YYYY-MM-DD' for the IST calendar day containing `now`. */
export function istDateKey(now: Date = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** How far through the IST day we are, 0..1. Used to pace the budget. */
export function istDayElapsedFraction(now: Date = new Date()): number {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  const msIntoDay = shifted.getUTCHours() * 3_600_000 + shifted.getUTCMinutes() * 60_000 + shifted.getUTCSeconds() * 1_000;
  return Math.min(1, Math.max(0, msIntoDay / 86_400_000));
}

/* ── Prize engine ────────────────────────────────────────────────────────── */
export interface PickContext {
  tier: SpinTierRule;
  dailyBudgetUsdt: number;
  paidTodayUsdt: number;
  dayElapsedFraction: number;
}

/** Uniform float in [0, 1) from the OS CSPRNG. */
function rand(): number {
  return randomInt(0, 1_000_000_007) / 1_000_000_007;
}

const NOTHING_INDEX = SPIN_PRIZES.findIndex(p => p.usdt === 0);

/**
 * Chooses the wheel segment a spin lands on. The client never decides this.
 *
 * Rules, in order:
 *  1. The tier's win rate is honoured exactly: P(any prize) = winRatePct / 100.
 *  2. A prize is only eligible if it is ≤ the tier's max win AND ≤ the budget
 *     still unspent today. If nothing is eligible, the spin lands on "Nothing".
 *  3. Among eligible prizes, base weights are used, but prizes ≥ 1 USDT are
 *     suppressed as the day's budget drains — steeply for larger prizes, not at
 *     all for the small ones. This is what keeps payouts flowing near the end of
 *     the budget instead of the wheel going dead: it gets stingier, not shut.
 *  4. If spending is running ahead of the clock (e.g. 70% of the budget gone by
 *     noon), the suppression tightens further; if it is behind, it relaxes.
 */
export function pickSegmentIndex(ctx: PickContext): number {
  const winRate  = Math.min(1, Math.max(0, ctx.tier.winRatePct / 100));
  const budget   = Math.max(0, ctx.dailyBudgetUsdt);
  const remaining = Math.max(0, budget - ctx.paidTodayUsdt);

  // 1. Win or nothing.
  if (rand() >= winRate) return NOTHING_INDEX;

  // 2. Eligibility.
  const eligible = SPIN_PRIZES
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.usdt > 0 && p.usdt <= ctx.tier.maxWinUsdt && p.usdt <= remaining);
  if (eligible.length === 0) return NOTHING_INDEX;

  // 3 + 4. Budget pressure. `pressure` ∈ (0, 1]: 1 = budget untouched, → 0 as it empties.
  //    `pace` < 1 when spend is ahead of the clock, > 1 (capped) when behind.
  const pressure  = budget > 0 ? remaining / budget : 1;
  const spentFrac = budget > 0 ? ctx.paidTodayUsdt / budget : 0;
  const pace      = Math.min(1.25, Math.max(0.35, 1 - (spentFrac - ctx.dayElapsedFraction)));
  const p         = Math.min(1, Math.max(0.02, pressure * pace));

  const weighted = eligible.map(({ p: prize, i }) => {
    // Small prizes (< 1 USDT) never get suppressed; larger ones fall off as p^k,
    // with k growing with prize size so a 100 USDT jackpot fades long before a 1 USDT win.
    const k = prize.usdt < 1 ? 0 : 1 + Math.log2(prize.usdt) / 2;
    const w = prize.weight * Math.pow(p, k);
    return { i, w };
  });

  const total = weighted.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return NOTHING_INDEX;
  let r = rand() * total;
  for (const { i, w } of weighted) {
    r -= w;
    if (r < 0) return i;
  }
  return weighted[weighted.length - 1].i;
}
