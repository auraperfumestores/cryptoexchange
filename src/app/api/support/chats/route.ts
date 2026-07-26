import { NextResponse } from 'next/server';
import { connectToDatabase, SupportChat, SupportMessage, supportChatToDocument, getSupportWelcomeSettings } from '@/lib/db';
import { errorResponse, badRequest } from '@/lib/utils/errors';
import { createForumTopic, sendTopicMessage, chatActionKeyboard, escapeHtml } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

/** POST /api/support/chats — start a new live support chat. Opens a Telegram forum topic
 *  and posts the user's details + opening message there for the admin to pick up. */
export async function POST(req: Request) {
  try {
    const { name, email, reason, userId } = await req.json() as {
      name?: string; email?: string; reason?: string; userId?: string;
    };
    if (!name?.trim()) return badRequest('Name is required');
    if (!email?.trim()) return badRequest('Email is required');
    if (!reason?.trim()) return badRequest('Please tell us the reason for contact');

    await connectToDatabase();

    const chat = await SupportChat.create({
      userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      reason: reason.trim(),
      status: 'open',
      urgent: false,
      lastMessageAt: Date.now(),
      lastSenderRole: 'user',
    });

    await SupportMessage.create({ chatId: String(chat._id), role: 'user', text: reason.trim() });

    // Auto-post welcome message as agent if configured in admin settings
    try {
      const welcome = await getSupportWelcomeSettings();
      if (welcome.enabled && welcome.message.trim()) {
        await SupportMessage.create({ chatId: String(chat._id), role: 'agent', text: welcome.message.trim() });
        await SupportChat.updateOne(
          { _id: chat._id },
          { $set: { lastMessageAt: Date.now(), lastSenderRole: 'agent' } },
        );
      }
    } catch { /* non-fatal — chat works fine even without the welcome message */ }

    try {
      const topic = await createForumTopic(`${name.trim()} — ${email.trim()}`);
      chat.telegramTopicId = topic.message_thread_id;
      await chat.save();

      await sendTopicMessage(
        topic.message_thread_id,
        `🆕 <b>New support chat</b>\n\n` +
          `<b>Name:</b> ${escapeHtml(name.trim())}\n` +
          `<b>Email:</b> ${escapeHtml(email.trim())}\n\n` +
          `<b>Reason:</b>\n${escapeHtml(reason.trim())}`,
        { replyMarkup: chatActionKeyboard(String(chat._id), 'open', false) },
      );
    } catch (err) {
      // Chat still works for the user even if Telegram delivery fails — log for ops visibility.
      console.error('[support/chats] telegram delivery failed:', err);
    }

    return NextResponse.json({ success: true, data: supportChatToDocument(chat) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
