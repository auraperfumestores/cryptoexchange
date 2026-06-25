import { NextResponse } from 'next/server';
import { connectToDatabase, SupportChat, SupportMessage, supportMessageToDocument } from '@/lib/db';
import { errorResponse, badRequest, notFound } from '@/lib/utils/errors';
import { sendTopicMessage, sendTopicPhoto, escapeHtml } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

/** GET /api/support/chats/[id]/messages?after=<ms> — used by the widget to poll for new
 *  messages (including the admin's replies relayed in from Telegram). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const chat = await SupportChat.findById(params.id).lean();
    if (!chat) return notFound('Chat not found');

    const { searchParams } = new URL(req.url);
    const after = Number(searchParams.get('after')) || 0;

    const filter: any = { chatId: params.id };
    if (after > 0) filter.createdAt = { $gt: new Date(after) };

    const docs = await SupportMessage.find(filter).sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: {
        status: (chat as any).status,
        messages: docs.map(supportMessageToDocument),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/support/chats/[id]/messages — user sends a message/image into the live chat;
 *  it's saved and relayed into the chat's Telegram topic for the admin to see in real time. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { text, imageUrls } = await req.json() as { text?: string; imageUrls?: string[] };
    if (!text?.trim() && !imageUrls?.length) return badRequest('Message cannot be empty');

    await connectToDatabase();
    const chat = await SupportChat.findById(params.id);
    if (!chat) return notFound('Chat not found');

    const message = await SupportMessage.create({
      chatId: params.id,
      role: 'user',
      text: text?.trim(),
      imageUrls: imageUrls ?? [],
    });

    chat.lastMessageAt = Date.now();
    chat.lastSenderRole = 'user';
    chat.reminderSentAt = undefined;
    if (chat.status === 'resolved') chat.status = 'open';
    await chat.save();

    try {
      if (text?.trim()) {
        await sendTopicMessage(chat.telegramTopicId, escapeHtml(text.trim()));
      }
      for (const url of imageUrls ?? []) {
        await sendTopicPhoto(chat.telegramTopicId, url);
      }
    } catch (err) {
      console.error('[support/messages] telegram relay failed:', err);
    }

    return NextResponse.json({ success: true, data: supportMessageToDocument(message) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
