import { NextResponse } from 'next/server';
import { checkSupportReminders } from '@/lib/telegram/reminders';

export const dynamic = 'force-dynamic';

/** GET /api/cron/support-reminders — manual/external trigger for the reminder sweep.
 *  Not registered in vercel.json (Hobby plan only allows daily cron); the sweep
 *  normally runs opportunistically from webhook and widget-polling traffic instead. */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  await checkSupportReminders();
  return NextResponse.json({ ok: true });
}
