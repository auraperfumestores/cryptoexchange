import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import {
  connectToDatabase, SiteSetting,
  getAutoScheduleConfig, getScheduledRateSettings,
} from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import type { AutoScheduleConfig, ScheduledRateSlot } from '@/lib/db';

export const dynamic = 'force-dynamic';

function makeId(): string {
  return 'auto_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function buildSlots(cfg: AutoScheduleConfig): ScheduledRateSlot[] {
  type Network   = 'BEP20' | 'ERC20' | 'TRC20';
  type OrderType = 'buy' | 'sell';

  // Build the list of (network, type) combos that are enabled
  const combos: { network: Network; type: OrderType }[] = [];
  for (const network of ['BEP20', 'ERC20', 'TRC20'] as Network[]) {
    const n = cfg.networks[network];
    if (!n.enabled) continue;
    if (n.includeSell) combos.push({ network, type: 'sell' });
    if (n.includeBuy)  combos.push({ network, type: 'buy' });
  }
  if (combos.length === 0) return [];

  // Window boundaries in LOCAL server time
  const today     = new Date();
  const midnight  = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const winStart  = midnight + cfg.windowStartHour * 3_600_000;
  const winEnd    = midnight + cfg.windowEndHour   * 3_600_000;
  const winDurMs  = winEnd - winStart;
  if (winDurMs <= 0) return [];

  const maxDurMs = cfg.maxDurationMinutes * 60_000;
  if (winDurMs < maxDurMs) return [];

  // Per-(network,type) occupied intervals to prevent overlaps
  const occupied = new Map<string, { s: number; e: number }[]>();

  const slots: ScheduledRateSlot[] = [];

  for (let i = 0; i < cfg.slotsPerDay; i++) {
    const combo = combos[i % combos.length];
    const key   = `${combo.network}:${combo.type}`;
    if (!occupied.has(key)) occupied.set(key, []);
    const occ = occupied.get(key)!;

    // Random duration within admin-defined bounds
    const durMin = Math.round(
      cfg.minDurationMinutes +
      Math.random() * Math.max(0, cfg.maxDurationMinutes - cfg.minDurationMinutes),
    );
    const durMs = durMin * 60_000;

    // Attempt up to 40 random positions to find a non-overlapping window
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
    if (startMs === null) continue; // couldn't fit; skip this slot

    // Random rate within admin-defined range, rounded to 2 dp
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

  // Sort chronologically
  return slots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/** POST /api/admin/auto-schedule/generate
 *  Generates today's random override slots from the saved auto-schedule config,
 *  replaces any previously-generated auto slots, and preserves all manual slots. */
export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    const [autoCfg, overrides] = await Promise.all([
      getAutoScheduleConfig(),
      getScheduledRateSettings(),
    ]);

    if (!autoCfg.enabled) {
      return NextResponse.json(
        { error: 'Auto-schedule is disabled. Enable it and save the config first.' },
        { status: 400 },
      );
    }

    const generated  = buildSlots(autoCfg);
    const manualSlots = overrides.slots.filter(s => !s.auto);
    const merged     = [...manualSlots, ...generated];

    const d        = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    await Promise.all([
      SiteSetting.findOneAndUpdate(
        { key: 'scheduledRateOverrides' },
        { $set: { value: { enabled: overrides.enabled, slots: merged } } },
        { upsert: true },
      ),
      SiteSetting.findOneAndUpdate(
        { key: 'autoScheduleConfig' },
        { $set: { value: { ...autoCfg, lastGeneratedDate: todayStr } } },
        { upsert: true },
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: { generated: generated.length, totalSlots: merged.length },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
