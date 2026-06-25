const API_BASE = 'https://api.telegram.org';

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  return t;
}

export function supportGroupId(): string {
  const id = process.env.TELEGRAM_SUPPORT_GROUP_ID;
  if (!id) throw new Error('TELEGRAM_SUPPORT_GROUP_ID is not configured');
  return id;
}

async function call<T = any>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API ${method} failed: ${data.description ?? res.statusText}`);
  }
  return data.result as T;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export function chatActionKeyboard(chatId: string, status: 'open' | 'resolved', urgent: boolean) {
  const row: InlineButton[] = [];
  if (status === 'open') {
    row.push({ text: '✅ Resolve', callback_data: `resolve:${chatId}` });
    if (!urgent) row.push({ text: '🔥 Mark urgent', callback_data: `urgent:${chatId}` });
  } else {
    row.push({ text: '↩️ Reopen', callback_data: `reopen:${chatId}` });
  }
  return { inline_keyboard: [row] };
}

/** Creates a forum topic in the support supergroup — one topic per support chat. */
export async function createForumTopic(name: string): Promise<{ message_thread_id: number }> {
  return call('createForumTopic', { chat_id: supportGroupId(), name: name.slice(0, 128) });
}

export async function closeForumTopic(threadId: number) {
  return call('closeForumTopic', { chat_id: supportGroupId(), message_thread_id: threadId });
}

export async function reopenForumTopic(threadId: number) {
  return call('reopenForumTopic', { chat_id: supportGroupId(), message_thread_id: threadId });
}

export async function editForumTopic(threadId: number, name: string) {
  return call('editForumTopic', { chat_id: supportGroupId(), message_thread_id: threadId, name: name.slice(0, 128) });
}

export async function sendTopicMessage(
  threadId: number | undefined,
  text: string,
  opts: { replyMarkup?: ReturnType<typeof chatActionKeyboard> } = {},
): Promise<{ message_id: number }> {
  return call('sendMessage', {
    chat_id: supportGroupId(),
    message_thread_id: threadId,
    text,
    parse_mode: 'HTML',
    reply_markup: opts.replyMarkup,
  });
}

export async function sendTopicPhoto(
  threadId: number | undefined,
  photoUrl: string,
  caption?: string,
): Promise<{ message_id: number }> {
  return call('sendPhoto', {
    chat_id: supportGroupId(),
    message_thread_id: threadId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
  });
}

export async function sendTopicDocument(
  threadId: number | undefined,
  documentUrl: string,
  caption?: string,
): Promise<{ message_id: number }> {
  return call('sendDocument', {
    chat_id: supportGroupId(),
    message_thread_id: threadId,
    document: documentUrl,
    caption,
    parse_mode: 'HTML',
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return call('answerCallbackQuery', { callback_query_id: callbackQueryId, text, cache_time: 1 });
}

export async function editMessageReplyMarkup(
  messageId: number,
  threadId: number | undefined,
  replyMarkup: ReturnType<typeof chatActionKeyboard> | null,
) {
  return call('editMessageReplyMarkup', {
    chat_id: supportGroupId(),
    message_id: messageId,
    reply_markup: replyMarkup ?? { inline_keyboard: [] },
  });
}

/** Deep link straight into a forum topic, for use in /pending listings etc. */
export function topicDeepLink(threadId: number): string {
  const groupId = supportGroupId().replace(/^-100/, '');
  return `https://t.me/c/${groupId}/${threadId}`;
}

/** Resolves a Telegram file_id to a temporary download URL (valid ~1hr). */
export async function getFileUrl(fileId: string): Promise<string> {
  const result = await call<{ file_path: string }>('getFile', { file_id: fileId });
  return `${API_BASE}/file/bot${token()}/${result.file_path}`;
}

export async function setWebhook(url: string) {
  return call('setWebhook', { url, allowed_updates: ['message', 'callback_query'] });
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
