import { connectToDatabase, SiteSetting, getAutoScheduleConfig, getScheduledRateSettings } from '@/lib/db';
import type { AutoScheduleConfig, ScheduledRateSlot } from '@/lib/db';

function makeId(): string {
  return 'auto_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Returns 'YYYY-MM-DD' for the current date in the given UTC offset timezone.
 * tzOffsetMinutes: minutes ahead of UTC (+330 for IST, 0 for UTC, -300 for EST).
 * Uses UTC arithmetic so it is server-timezone-independent.
 */
export function getTodayStr(tzOffsetMinutes: number): string {
  // Shift 'now' by the timezone offset, then read the UTC date fields
  const shifted = new Date(Date.now() + tzOffsetMinutes * 60_000);
  return (
    shifted.getUTCFullYear() +
    '-' + String(shifted.getUTCMonth() + 1).padStart(2, '0') +
    '-' + String(shifted.getUTCDate()).padStart(2, '0')
  );
}

/**
 * Calculates the UTC millisecond timestamp for midnight of the current day
 * in the admin's timezone — server-timezone-independent.
 *
 * Example (IST = UTC+5:30, tzOffsetMinutes = +330):
 *   Admin's midnight 2026-08-07 00:00 IST = 2026-08-06 18:30 UTC
 */
function adminMidnightUtcMs(tzOffsetMinutes: number, targetDate?: Date): number {
  const nowMs = (targetDate ?? new Date()).getTime();
  // Shift the timestamp into the admin's timezone, find midnight there,
  // then shift back to UTC.
  const tzMs    = tzOffsetMinutes * 60_000;
  const inTz    = nowMs + tzMs;                              // 'now' expressed in admin tz
  const dayMs   = Math.floor(inTz / 86_400_000) * 86_400_000; // midnight in admin tz (as UTC number)
  return dayMs - tzMs;                                        // convert back to true UTC ms
}

/**
 * Generates a set of random, non-overlapping override slots for the given date
 * (defaults to today) based on the admin-configured auto-schedule rules.
 *
 * All hour values (windowStartHour / windowEndHour) are interpreted in the
 * admin's timezone stored as cfg.tzOffsetMinutes — NOT server local time.
 * Cross-midnight windows (e.g. 8 PM → 2 AM) are fully supported.
 */
export function buildSlots(cfg: AutoScheduleConfig, targetDate?: Date): ScheduledRateSlot[] {
  type Network   = 'BEP20' | 'ERC20' | 'TRC20';
  type OrderType = 'buy' | 'sell';

  const combos: { network: Network; type: OrderType }[] = [];
  for (const network of ['BEP20', 'ERC20', 'TRC20'] as Network[]) {
    const n = cfg.networks[network];
    if (!n.enabled) continue;
    if (n.includeSell) combos.push({ network, type: 'sell' });
    if (n.includeBuy)  combos.push({ network, type: 'buy' });
  }
  if (combos.length === 0) return [];

  // Random slot count within admin-defined range
  const slotCount = Math.max(
    1,
    Math.round(
      cfg.minSlotsPerDay +
      Math.random() * Math.max(0, cfg.maxSlotsPerDay - cfg.minSlotsPerDay),
    ),
  );

  // ── Window calculation in admin's timezone ──────────────────────────────
  // midnight = UTC timestamp for 00:00 on the target date in admin's timezone
  const midnight = adminMidnightUtcMs(cfg.tzOffsetMinutes, targetDate);

  const winStart = midnight + cfg.windowStartHour * 3_600_000;
  const rawEnd   = midnight + cfg.windowEndHour   * 3_600_000;
  // Cross-midnight: if endHour ≤ startHour the window wraps into the next day
  const winEnd   = rawEnd <= winStart ? rawEnd + 24 * 3_600_000 : rawEnd;
  const winDurMs = winEnd - winStart;

  // Log so the server terminal shows exactly which window was used — helps verify timezone fix
  console.log(
    `[auto-schedule] window tz=UTC${cfg.tzOffsetMinutes >= 0 ? '+' : ''}${cfg.tzOffsetMinutes / 60}` +
    ` start=${new Date(winStart).toISOString()} end=${new Date(winEnd).toISOString()}` +
    ` (${cfg.windowStartHour}h–${cfg.windowEndHour}h local)`,
  );

  const maxDurMs = cfg.maxDurationMinutes * 60_000;
  if (winDurMs < maxDurMs) return []; // window too tight to fit even one slot

  // ── Slot generation ─────────────────────────────────────────────────────
  const occupied = new Map<string, { s: number; e: number }[]>();
  const slots: ScheduledRateSlot[] = [];

  for (let i = 0; i < slotCount; i++) {
    const combo = combos[i % combos.length];
    const key   = `${combo.network}:${combo.type}`;
    if (!occupied.has(key)) occupied.set(key, []);
    const occ = occupied.get(key)!;

    const durMin = Math.round(
      cfg.minDurationMinutes +
      Math.random() * Math.max(0, cfg.maxDurationMinutes - cfg.minDurationMinutes),
    );
    const durMs = durMin * 60_000;

    let startMs: number | null = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const available = winDurMs - durMs;
      if (available <= 0) break;
      const candidate = winStart + Math.floor(Math.random() * available);
      const endMs     = candidate + durMs;
      if (!occ.some(w => candidate < w.e && endMs > w.s)) {
        startMs = candidate;
        occ.push({ s: candidate, e: endMs });
        break;
      }
    }
    if (startMs === null) continue;

    const rate = Math.round(
      (cfg.minRate + Math.random() * Math.max(0, cfg.maxRate - cfg.minRate)) * 100,
    ) / 100;

    slots.push({
      id: makeId(),
      network: combo.network,
      type: combo.type,
      rate,
      startAt: new Date(startMs).toISOString(),
      durationMinutes: durMin,
      auto: true,
    });
  }

  return slots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

// In-process guard — prevents duplicate generation within one Node.js process instance
let _running = false;

/**
 * Called fire-and-forget from the rates API GET handler.
 * Generates today's auto schedule the first time it is needed each day
 * (keyed to admin's timezone), then exits immediately on every subsequent call.
 */
export async function ensureAutoScheduleForToday(): Promise<void> {
  if (_running) return;

  await connectToDatabase();

  const [autoCfg, overrides] = await Promise.all([
    getAutoScheduleConfig(),
    getScheduledRateSettings(),
  ]);

  if (!autoCfg.enabled) return;

  // 'today' is computed in the admin's timezone so the day boundary is correct
  const today = getTodayStr(autoCfg.tzOffsetMinutes);
  if (autoCfg.lastGeneratedDate === today) return;

  _running = true;
  try {
    const generated   = buildSlots(autoCfg);
    const manualSlots = overrides.slots.filter(s => !s.auto);
    const merged      = [...manualSlots, ...generated];

    await Promise.all([
      SiteSetting.findOneAndUpdate(
        { key: 'scheduledRateOverrides' },
        { $set: { value: { enabled: overrides.enabled, slots: merged } } },
        { upsert: true },
      ),
      SiteSetting.findOneAndUpdate(
        { key: 'autoScheduleConfig' },
        { $set: { value: { ...autoCfg, lastGeneratedDate: today } } },
        { upsert: true },
      ),
    ]);

    console.log(`[auto-schedule] Generated ${generated.length} slots for ${today} (tz offset: UTC${autoCfg.tzOffsetMinutes >= 0 ? '+' : ''}${autoCfg.tzOffsetMinutes / 60})`);
  } finally {
    _running = false;
  }
}
