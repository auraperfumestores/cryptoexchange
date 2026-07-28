import type { DynamicRateTier, DynamicRateSettings } from '@/lib/db/models/SiteSetting';

/**
 * Compute the effective exchange rate for a given trade size.
 *
 * Sell: effective = base + bonus   (higher INR per USDT → user earns more)
 * Buy:  effective = base - bonus   (lower INR per USDT → user pays less)
 *
 * Tiers are applied on a "best applicable" basis: the tier with the highest
 * minAmount that is still ≤ the trade size wins.
 */
export function getEffectiveRate(
  baseRate: number,
  amount:   number,
  tiers:    DynamicRateTier[],
  isSell:   boolean,
): number {
  if (!tiers.length || amount <= 0) return baseRate;
  const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);
  const tier   = sorted.find(t => amount >= t.minAmount);
  const bonus  = tier?.bonus ?? 0;
  return isSell
    ? baseRate + bonus
    : Math.max(0, baseRate - bonus);
}

/**
 * Shorthand: given the full settings object, return the effective rate
 * for a buy or sell of `amount` USDT.  Returns base rate unchanged when
 * the relevant toggle is disabled.
 */
export function applyDynamicRate(
  baseRate: number,
  amount:   number,
  settings: Pick<DynamicRateSettings, 'sellEnabled' | 'buyEnabled' | 'sellTiers' | 'buyTiers'>,
  isSell:   boolean,
): number {
  const enabled = isSell ? settings.sellEnabled : settings.buyEnabled;
  if (!enabled) return baseRate;
  const tiers = isSell ? settings.sellTiers : settings.buyTiers;
  return getEffectiveRate(baseRate, amount, tiers, isSell);
}

/** Returns the bonus amount in INR at the applicable tier (0 if none / disabled). */
export function getRateBonus(
  amount:   number,
  settings: Pick<DynamicRateSettings, 'sellEnabled' | 'buyEnabled' | 'sellTiers' | 'buyTiers'>,
  isSell:   boolean,
): number {
  const enabled = isSell ? settings.sellEnabled : settings.buyEnabled;
  if (!enabled || amount <= 0) return 0;
  const tiers  = isSell ? settings.sellTiers : settings.buyTiers;
  const sorted = [...tiers].sort((a, b) => b.minAmount - a.minAmount);
  return sorted.find(t => amount >= t.minAmount)?.bonus ?? 0;
}
