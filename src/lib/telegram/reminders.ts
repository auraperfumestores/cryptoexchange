import { connectToDatabase, SupportChat, SupportMessage } from '@/lib/db';
import { sendTopicMessage, closeForumTopic } from '@/lib/telegram/bot';
import { sendSupportReminderEmail } from '@/lib/email';

// ── Admin Telegram reminder: agent hasn't replied to user yet ────────────────
const ADMIN_REMINDER_AFTER_MS = 5 * 60 * 1000; // 5 min

// ── User email reminder schedule: user hasn't replied to agent ───────────────
// Indexed by userReminderCount: threshold (ms since lastMessageAt) for each reminder.
const USER_REMINDER_SCHEDULE_MS = [
  15 * 60 * 1000,      // #0 → send after 15 min
  60 * 60 * 1000,      // #1 → send after 1 h
  3 * 60 * 60 * 1000,  // #2 → send after 3 h
  6 * 60 * 60 * 1000,  // #3 → send after 6 h
  12 * 60 * 60 * 1000, // #4 → send after 12 h
];
const AUTO_CLOSE_MS = 24 * 60 * 60 * 1000; // auto-close 24 h after agent's last reply

// Throttle the whole sweep to once per minute — rapid widget-polling traffic
// calls this function constantly, so we must avoid redundant DB hits.
const SWEEP_THROTTLE_MS = 60 * 1000;
let lastSweepAt = 0;

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && !url.startsWith('http://localhost')) return url;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return url ?? 'http://localhost:3000';
}

/**
 * Dual-sweep support reminder.
 *
 * Sweep A — admin Telegram ping (unchanged):
 *   When the AGENT has not replied to the user for > 5 min, ping the Telegram
 *   topic so the support team doesn't miss the message.
 *
 * Sweep B — user email reminders + auto-close (new):
 *   When the USER has not replied to an agent message, send escalating emails:
 *   15 min → 1 h → 3 h → 6 h → 12 h, then auto-close the chat at 24 h.
 *   If the agent sends another reply after a reminder, the cycle restarts from
 *   index 0 (detected via userReminderSentAt < lastMessageAt).
 *
 * Runs opportunistically from widget-polling and webhook traffic; throttled
 * to once per minute to avoid redundant DB work.
 */
export async function checkSupportReminders(): Promise<void> {
  const now = Date.now();
  if (now - lastSweepAt < SWEEP_THROTTLE_MS) return;
  lastSweepAt = now;

  await connectToDatabase();

  // ── Sweep A: admin Telegram ping ─────────────────────────────────────────
  const agentStale = await SupportChat.find({
    status: 'open',
    lastSenderRole: 'user',
    lastMessageAt: { $lt: now - ADMIN_REMINDER_AFTER_MS },
  });

  for (const chat of agentStale) {
    if (chat.reminderSentAt && chat.reminderSentAt > chat.lastMessageAt) continue;
    if (!chat.telegramTopicId) continue;
    const waitingMin = Math.round((now - chat.lastMessageAt) / 60_000);
    try {
      await sendTopicMessage(
        chat.telegramTopicId,
        `⏰ <b>Still waiting on a reply</b> — ${waitingMin} min and counting.`,
      );
      chat.reminderSentAt = Date.now();
      await chat.save();
    } catch (err) {
      console.error('[support-reminders] admin ping failed for chat', String(chat._id), err);
    }
  }

  // ── Sweep B: user email reminders + 24 h auto-close ──────────────────────
  // Fetch open chats where agent replied last and at least 15 min have elapsed.
  const userStale = await SupportChat.find({
    status: 'open',
    lastSenderRole: 'agent',
    lastMessageAt: { $lt: now - USER_REMINDER_SCHEDULE_MS[0] },
  });

  const appUrl = getAppUrl();

  for (const chat of userStale) {
    const elapsed = now - chat.lastMessageAt;

    // If the agent sent a new message after the last reminder, restart the cycle.
    // Signal: userReminderSentAt exists and is older than the current lastMessageAt.
    let count = chat.userReminderCount ?? 0;
    if (chat.userReminderSentAt && chat.userReminderSentAt < chat.lastMessageAt) {
      count = 0;
    }

    // ── Auto-close: 24 h of no user reply ────────────────────────────────
    if (elapsed >= AUTO_CLOSE_MS) {
      try {
        chat.status            = 'resolved';
        chat.userReminderCount  = 0;
        chat.userReminderSentAt = undefined;
        await chat.save();

        // System message visible in the chat widget
        await SupportMessage.create({
          chatId: String(chat._id),
          role: 'system',
          text: 'This chat was automatically closed after 24 hours of inactivity. If you still need help, please start a new chat.',
        });

        // Keep the Telegram inbox tidy
        if (chat.telegramTopicId) {
          await closeForumTopic(chat.telegramTopicId).catch(() => {});
          await sendTopicMessage(
            chat.telegramTopicId,
            '🕐 <b>Auto-closed</b> — no user response for 24 hours.',
          ).catch(() => {});
        }

        console.log('[support-reminders] auto-closed chat', String(chat._id));
      } catch (err) {
        console.error('[support-reminders] auto-close failed', String(chat._id), err);
      }
      continue;
    }

    // ── Send next scheduled reminder if threshold reached ────────────────
    if (count >= USER_REMINDER_SCHEDULE_MS.length) continue; // all 5 sent, waiting for 24 h
    if (elapsed < USER_REMINDER_SCHEDULE_MS[count]) continue; // not yet time

    try {
      await sendSupportReminderEmail(chat.email, chat.name, count, appUrl);
      chat.userReminderCount  = count + 1;
      chat.userReminderSentAt = now;
      await chat.save();
      console.log(`[support-reminders] email #${count} sent for chat`, String(chat._id));
    } catch (err) {
      console.error('[support-reminders] email failed for chat', String(chat._id), err);
    }
  }
}
