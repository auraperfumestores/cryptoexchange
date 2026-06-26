'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { upload } from '@vercel/blob/client';
import { Headset, X, PaperPlaneRight, Image as ImageIcon, CheckCircle } from '@phosphor-icons/react';

/** Any component can call this to open the global support widget instead of
 *  linking out to WhatsApp — e.g. onClick={() => openSupportChat()}. */
export function openSupportChat() {
  window.dispatchEvent(new Event('open-support-chat'));
}

interface SupportMessage {
  _id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  imageUrls: string[];
  createdAt: string;
}

const STORAGE_PREFIX = 'swappinr_support_chat_id';
const POLL_MS = 4000;

/** Keys the stored chat id by the logged-in user (or 'guest') so switching accounts on
 *  the same browser never resurfaces a previous account's chat. */
function storageKeyFor(userId?: string | null) {
  return `${STORAGE_PREFIX}:${userId || 'guest'}`;
}

function mergeMessages(prev: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  const existingIds = new Set(prev.map(m => m._id));
  const fresh = incoming.filter(m => !existingIds.has(m._id));
  return fresh.length ? [...prev, ...fresh] : prev;
}

function SupportAvatar({ size = 28 }: { size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (!imgFailed) {
    return (
      <img
        src="/support-avatar.png"
        alt="Support"
        onError={() => setImgFailed(true)}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0,
          objectFit: 'cover', boxShadow: '0 2px 8px rgba(204,255,0,0.25)',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--fr-lime), #9ad900)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(204,255,0,0.25)',
    }}>
      <Headset size={size * 0.56} color="#000" weight="fill" />
    </div>
  );
}

export default function SupportChatWidget() {
  const { data: session, status: sessionStatus } = useSession();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [status, setStatus] = useState<'open' | 'resolved'>('open');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const lastFetchedAt = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    const stored = localStorage.getItem(storageKeyFor(session?.user?.id));
    setChatId(stored || null);
    setMessages([]);
  }, [sessionStatus, session?.user?.id]);

  useEffect(() => {
    if (session?.user) {
      setName(prev => prev || session.user.name || '');
      setEmail(prev => prev || session.user.email || '');
    }
  }, [session]);

  useEffect(() => {
    if (!open || !chatId) return;
    let cancelled = false;
    let inFlight = false;

    async function poll() {
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(`/api/support/chats/${chatId}/messages?after=${lastFetchedAt.current}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.data.status);
        if (data.data.messages.length) {
          setMessages(prev => mergeMessages(prev, data.data.messages));
          lastFetchedAt.current = new Date(data.data.messages[data.data.messages.length - 1].createdAt).getTime();
        }
      } catch { /* network blip — next poll will catch up */ } finally {
        inFlight = false;
      }
    }

    lastFetchedAt.current = 0;
    setMessages([]);
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(t); };
  }, [open, chatId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleStartChat(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const res = await fetch('/api/support/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, reason, userId: session?.user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start chat');
      localStorage.setItem(storageKeyFor(session?.user?.id), data.data._id);
      setChatId(data.data._id);
      setStatus('open');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage(text?: string, imageUrls?: string[]) {
    if (!chatId || status === 'resolved') return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, imageUrls }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => mergeMessages(prev, [data.data]));
        lastFetchedAt.current = new Date(data.data.createdAt).getTime();
      }
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || status === 'resolved') return;
    setDraft('');
    await sendMessage(text);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || status === 'resolved') return;
    setUploading(true);
    setUploadError('');
    try {
      const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
      await sendMessage(undefined, [blob.url]);
    } catch {
      setUploadError('Could not attach image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function startNewChat() {
    localStorage.removeItem(storageKeyFor(session?.user?.id));
    setChatId(null);
    setMessages([]);
    setReason('');
    setConfirmClose(false);
    setStatus('open');
  }

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9979,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />
      <button
        onClick={() => setOpen(v => !v)}
        title="Live support"
        style={{
          position: 'fixed', bottom: 84, right: 20, zIndex: 9980,
          width: 50, height: 50, borderRadius: '50%',
          background: 'var(--fr-lime)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? '0 4px 24px rgba(204,255,0,0.6)' : '0 4px 20px rgba(204,255,0,0.45)',
          transform: open ? 'scale(1.06) rotate(90deg)' : 'scale(1) rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
          animation: open ? 'none' : 'supportPulse 3s ease-in-out infinite',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: open ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {open ? <X size={22} color="#000" weight="bold" /> : <Headset size={22} color="#000" weight="fill" />}
        </span>
      </button>

      <div style={{
        position: 'fixed', bottom: 144, right: 20, zIndex: 9981,
        width: 360, maxWidth: 'calc(100vw - 32px)', maxHeight: 'min(560px, calc(100dvh - 180px))',
        background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 18,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
        pointerEvents: open ? 'auto' : 'none',
        transformOrigin: 'bottom right',
        transition: 'opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid var(--fr-border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(204,255,0,0.06), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <SupportAvatar size={34} />
              <span style={{
                position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
                borderRadius: '50%', background: status === 'resolved' ? 'var(--fr-text-disabled)' : '#22C55E',
                border: '2px solid var(--fr-dark-0)',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>SwappINR Support</div>
              <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>
                {status === 'resolved' ? 'Chat resolved' : 'Usually replies in minutes'}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {!chatId ? (
          <form onSubmit={handleStartChat} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            <p style={{ fontSize: 12, color: 'var(--fr-text-secondary)', margin: '0 0 4px', lineHeight: 1.5 }}>
              Tell us a bit about yourself and what you need help with — an agent will join the chat shortly.
            </p>
            {error && <div className="fr-alert fr-alert--error" style={{ fontSize: 12 }}>{error}</div>}
            <input
              placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              style={inputStyle} required
            />
            <input
              type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} required
            />
            <textarea
              placeholder="What can we help you with?" value={reason} onChange={e => setReason(e.target.value)}
              rows={3} style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} required
            />
            <button type="submit" disabled={starting} className="fr-btn fr-btn--primary fr-btn--md fr-btn--full" style={{ marginTop: 2 }}>
              {starting ? 'Starting…' : 'Start chat'}
            </button>
          </form>
        ) : (
          <>
            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(m => (
                <div key={m._id} style={{ display: 'flex', gap: 7, alignItems: 'flex-end', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role !== 'user' && <SupportAvatar size={24} />}
                  <div style={{
                    maxWidth: '74%', padding: '8px 12px', borderRadius: 14, fontSize: 13, lineHeight: 1.45,
                    background: m.role === 'user' ? 'var(--fr-lime)' : 'var(--fr-dark-4)',
                    color: m.role === 'user' ? '#000' : 'var(--fr-text-primary)',
                    boxShadow: m.role === 'user' ? '0 2px 10px rgba(204,255,0,0.18)' : '0 1px 4px rgba(0,0,0,0.2)',
                  }}>
                    {m.text && <div>{m.text}</div>}
                    {m.imageUrls.map(url => (
                      <img key={url} src={url} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, marginTop: m.text ? 6 : 0 }} />
                    ))}
                  </div>
                </div>
              ))}
              {status === 'resolved' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 10px 4px', textAlign: 'center',
                }}>
                  <CheckCircle size={22} color="var(--fr-lime)" weight="fill" />
                  <div style={{ fontSize: 12, color: 'var(--fr-text-secondary)', lineHeight: 1.5 }}>
                    This chat has been resolved.<br />Start a new chat if you need more help.
                  </div>
                  <button onClick={startNewChat} className="fr-btn fr-btn--primary fr-btn--sm" style={{ marginTop: 2 }}>
                    Start a new chat
                  </button>
                </div>
              )}
            </div>

            {uploadError && (
              <div style={{ padding: '6px 14px', fontSize: 11, color: '#F87171', borderTop: '1px solid var(--fr-border-subtle)' }}>
                {uploadError}
              </div>
            )}

            {status !== 'resolved' && (
              <div style={{ padding: 10, borderTop: '1px solid var(--fr-border-subtle)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Attach image"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 6, opacity: uploading ? 0.5 : 1 }}
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message…"
                  style={{ ...inputStyle, flex: 1, padding: '9px 12px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  title="Send"
                  style={{ background: 'var(--fr-lime)', border: 'none', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: sending || !draft.trim() ? 0.5 : 1 }}
                >
                  <PaperPlaneRight size={15} color="#000" weight="fill" />
                </button>
              </div>
            )}

            {confirmClose ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderTop: '1px solid var(--fr-border-subtle)', padding: '8px 0', fontSize: 11 }}>
                <span style={{ color: 'var(--fr-text-tertiary)' }}>End this chat?</span>
                <button onClick={startNewChat} style={{ background: 'none', border: 'none', color: '#F87171', fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                  Yes, end chat
                </button>
                <button onClick={() => setConfirmClose(false)} style={{ background: 'none', border: 'none', color: 'var(--fr-text-tertiary)', cursor: 'pointer', fontSize: 11 }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmClose(true)} style={{ background: 'none', border: 'none', borderTop: '1px solid var(--fr-border-subtle)', padding: '8px 0', fontSize: 11, color: 'var(--fr-text-disabled)', cursor: 'pointer' }}>
                Close chat & start a new one
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  background: 'var(--fr-dark-4)', border: '1px solid var(--fr-border-subtle)',
  color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none',
};
