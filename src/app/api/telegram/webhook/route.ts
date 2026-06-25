import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { connectToDatabase, SupportChat, SupportMessage } from '@/lib/db';
import {
  answerCallbackQuery, chatActionKeyboard, closeForumTopic, reopenForumTopic,
  editForumTopic, editMessageReplyMarkup, getFileUrl, sendTopicMessage,
  topicDeepLink, supportGroupId,
} from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

/** POST /api/telegram/webhook — receives all updates from the support bot:
 *  agent replies inside a forum topic, and Resolve/Urgent/Reopen button presses. */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = await req.json();
    await connectToDatabase();

    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message) {
      await handleMessage(update.message);
    }
  } catch (err) {
    console.error('[telegram/webhook]', err);
  }

  // Always 200 quickly — Telegram retries aggressively on non-2xx responses.
  return NextResponse.json({ ok: true });
}

async function handleMessage(msg: any) {
  if (String(msg.chat?.id) !== String(supportGroupId())) return;

  if (typeof msg.text === 'string' && msg.text.trim() === '/pending') {
    await replyPendingList(msg.message_thread_id);
    return;
  }

  if (msg.from?.is_bot || !msg.message_thread_id) return;

  const chat = await SupportChat.findOne({ telegramTopicId: msg.message_thread_id });
  if (!chat) return;

  const text: string | undefined = msg.text || msg.caption;
  const imageUrls: string[] = [];

  if (Array.isArray(msg.photo) && msg.photo.length) {
    try {
      const largest = msg.photo[msg.photo.length - 1];
      const tgUrl = await getFileUrl(largest.file_id);
      const res = await fetch(tgUrl);
      const blob = await put(`support/${Date.now()}-${largest.file_id}.jpg`, await res.blob(), { access: 'public' });
      imageUrls.push(blob.url);
    } catch (err) {
      console.error('[telegram/webhook] image relay failed:', err);
    }
  }

  if (!text && !imageUrls.length) return;

  await SupportMessage.create({
    chatId: String(chat._id),
    role: 'agent',
    text,
    imageUrls,
    telegramMessageId: msg.message_id,
  });

  chat.lastMessageAt = Date.now();
  chat.lastSenderRole = 'agent';
  chat.reminderSentAt = undefined;
  await chat.save();
}

async function handleCallback(cq: any) {
  const [action, chatId] = String(cq.data ?? '').split(':');
  const chat = await SupportChat.findById(chatId);
  if (!chat) {
    await answerCallbackQuery(cq.id, 'Chat not found');
    return;
  }

  const threadId = chat.telegramTopicId;
  const messageId = cq.message?.message_id;

  if (action === 'resolve') {
    chat.status = 'resolved';
    await chat.save();
    if (threadId) {
      await closeForumTopic(threadId).catch(() => {});
      await sendTopicMessage(threadId, '✅ Marked resolved by support.');
    }
    await answerCallbackQuery(cq.id, 'Marked resolved');
  } else if (action === 'urgent') {
    chat.urgent = true;
    await chat.save();
    if (threadId) await editForumTopic(threadId, `🔥 ${chat.name} — ${chat.email}`).catch(() => {});
    await answerCallbackQuery(cq.id, 'Marked urgent');
  } else if (action === 'reopen') {
    chat.status = 'open';
    await chat.save();
    if (threadId) {
      await reopenForumTopic(threadId).catch(() => {});
      await sendTopicMessage(threadId, '↩️ Reopened.');
    }
    await answerCallbackQuery(cq.id, 'Reopened');
  } else {
    await answerCallbackQuery(cq.id);
    return;
  }

  if (messageId) {
    await editMessageReplyMarkup(messageId, threadId, chatActionKeyboard(chatId, chat.status, chat.urgent)).catch(() => {});
  }
}

async function replyPendingList(threadId: number | undefined) {
  const pending = await SupportChat.find({ status: 'open', lastSenderRole: 'user' })
    .sort({ lastMessageAt: 1 })
    .limit(20)
    .lean();

  if (!pending.length) {
    await sendTopicMessage(threadId, '✅ No support chats are waiting on a reply right now.');
    return;
  }

  const lines = pending.map((c: any) => {
    const waitingMin = Math.round((Date.now() - c.lastMessageAt) / 60000);
    const link = c.telegramTopicId ? topicDeepLink(c.telegramTopicId) : undefined;
    const label = `${c.urgent ? '🔥 ' : ''}${c.name} (${waitingMin}m waiting)`;
    return link ? `• <a href="${link}">${label}</a>` : `• ${label}`;
  });

  await sendTopicMessage(threadId, `<b>⏳ Pending replies (${pending.length})</b>\n\n${lines.join('\n')}`);
}
