import { connectToDatabase, SupportChat } from '@/lib/db';
import { sendTopicMessage } from '@/lib/telegram/bot';

const REMINDER_AFTER_MS = 5 * 60 * 1000;
const SWEEP_THROTTLE_MS = 60 * 1000;

let lastSweepAt = 0;

/** Pings the Telegram topic for any chat that's been waiting on an agent reply
 *  past the threshold, so no message silently goes unanswered. Vercel's Hobby
 *  plan only allows daily cron jobs, so instead of relying on a cron schedule
 *  this is invoked opportunistically from real traffic (webhook updates and
 *  widget polling) and throttled in-memory to avoid redundant DB hits. */
export async function checkSupportReminders(): Promise<void> {
  const now = Date.now();
  if (now - lastSweepAt < SWEEP_THROTTLE_MS) return;
  lastSweepAt = now;

  await connectToDatabase();

  const stale = await SupportChat.find({
    status: 'open',
    lastSenderRole: 'user',
    lastMessageAt: { $lt: now - REMINDER_AFTER_MS },
  });

  for (const chat of stale) {
    if (chat.reminderSentAt && chat.reminderSentAt > chat.lastMessageAt) continue;
    if (!chat.telegramTopicId) continue;

    const waitingMin = Math.round((now - chat.lastMessageAt) / 60000);
    try {
      await sendTopicMessage(
        chat.telegramTopicId,
        `⏰ <b>Still waiting on a reply</b> — ${waitingMin} min and counting.`,
      );
      chat.reminderSentAt = Date.now();
      await chat.save();
    } catch (err) {
      console.error('[support-reminders] failed for chat', String(chat._id), err);
    }
  }
}
