import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { connectToDatabase, SiteSetting, getAutoScheduleConfig, getScheduledRateSettings } from '@/lib/db';
import { errorResponse } from '@/lib/utils/errors';
import { buildSlots, getTodayStr } from '@/lib/utils/auto-schedule';

export const dynamic = 'force-dynamic';

/** POST /api/admin/auto-schedule/generate
 *  Generates (or re-generates) today's random override slots from the saved
 *  auto-schedule config.  Replaces any previous auto slots; manual slots are
 *  always preserved.  Returns the full merged slot list so the admin UI can
 *  update immediately without waiting for a page refresh. */
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

    const generated   = buildSlots(autoCfg);
    const manualSlots = overrides.slots.filter(s => !s.auto);
    const merged      = [...manualSlots, ...generated];
    const today       = getTodayStr(autoCfg.tzOffsetMinutes);

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

    return NextResponse.json({
      success: true,
      data: { generated: generated.length, totalSlots: merged.length, slots: merged },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
