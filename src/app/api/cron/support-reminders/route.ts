import { NextResponse } from 'next/server';
import { connectToDatabase, SupportChat } from '@/lib/db';
import { sendTopicMessage } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

const REMINDER_AFTER_MS = 5 * 60 * 1000;

/** GET /api/cron/support-reminders — invoked by Vercel Cron (see vercel.json).
 *  Pings the Telegram topic for any chat that's been waiting on an agent reply
 *  past the threshold, so no message silently goes unanswered. */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  await connectToDatabase();

  const stale = await SupportChat.find({
    status: 'open',
    lastSenderRole: 'user',
    lastMessageAt: { $lt: Date.now() - REMINDER_AFTER_MS },
  });

  let reminded = 0;
  for (const chat of stale) {
    if (chat.reminderSentAt && chat.reminderSentAt > chat.lastMessageAt) continue;
    if (!chat.telegramTopicId) continue;

    const waitingMin = Math.round((Date.now() - chat.lastMessageAt) / 60000);
    try {
      await sendTopicMessage(
        chat.telegramTopicId,
        `⏰ <b>Still waiting on a reply</b> — ${waitingMin} min and counting.`,
      );
      chat.reminderSentAt = Date.now();
      await chat.save();
      reminded++;
    } catch (err) {
      console.error('[cron/support-reminders] failed for chat', String(chat._id), err);
    }
  }

  return NextResponse.json({ ok: true, checked: stale.length, reminded });
}
