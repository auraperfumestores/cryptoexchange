import { connectToDatabase, SiteSetting, getAutoScheduleConfig, getScheduledRateSettings } from '@/lib/db';
import type { AutoScheduleConfig, ScheduledRateSlot } from '@/lib/db';

function makeId(): string {
  return 'auto_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Generates a set of random, non-overlapping override slots for the given date
 * (defaults to today) based on the admin-configured auto-schedule rules.
 *
 * Cross-midnight windows (e.g. 8 PM → 2 AM) are fully supported: when
 * windowEndHour < windowStartHour the end boundary is pushed into the next day.
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

  // Random slot count within admin-defined range (at least 1)
  const slotCount = Math.max(
    1,
    Math.round(
      cfg.minSlotsPerDay +
      Math.random() * Math.max(0, cfg.maxSlotsPerDay - cfg.minSlotsPerDay),
    ),
  );

  // Window boundaries in LOCAL server time
  const base     = targetDate ?? new Date();
  const midnight = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime();
  const winStart = midnight + cfg.windowStartHour * 3_600_000;
  const rawEnd   = midnight + cfg.windowEndHour   * 3_600_000;
  // Cross-midnight: if endHour ≤ startHour, the window wraps into the next day
  const winEnd   = rawEnd <= winStart ? rawEnd + 24 * 3_600_000 : rawEnd;
  const winDurMs = winEnd - winStart;

  const maxDurMs = cfg.maxDurationMinutes * 60_000;
  // Window must be at least as long as the maximum possible slot duration
  if (winDurMs < maxDurMs) return [];

  // Per-(network, type) occupied intervals — prevents overlaps within the same pair
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
    if (startMs === null) continue; // window too packed — skip this slot

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

// In-process guard so parallel requests in the same Node.js instance don't double-generate
let _running = false;

/**
 * Called fire-and-forget from the rates API GET handler.
 * Generates today's auto schedule the first time it is needed each day,
 * then exits immediately on every subsequent call for the same day.
 */
export async function ensureAutoScheduleForToday(): Promise<void> {
  if (_running) return;

  await connectToDatabase();

  const [autoCfg, overrides] = await Promise.all([
    getAutoScheduleConfig(),
    getScheduledRateSettings(),
  ]);

  if (!autoCfg.enabled) return;

  const today = getTodayStr();
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

    console.log(`[auto-schedule] Generated ${generated.length} slots for ${today}`);
  } finally {
    _running = false;
  }
}
