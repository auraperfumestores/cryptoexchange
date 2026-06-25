'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
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

const STORAGE_KEY = 'swappinr_support_chat_id';
const POLL_MS = 4000;

function mergeMessages(prev: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  const existingIds = new Set(prev.map(m => m._id));
  const fresh = incoming.filter(m => !existingIds.has(m._id));
  return fresh.length ? [...prev, ...fresh] : prev;
}

export default function SupportChatWidget() {
  const { data: session } = useSession();
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
  const lastFetchedAt = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setChatId(stored);
  }, []);

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
      localStorage.setItem(STORAGE_KEY, data.data._id);
      setChatId(data.data._id);
      setStatus('open');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage(text?: string, imageUrls?: string[]) {
    if (!chatId) return;
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
        if (status === 'resolved') setStatus('open');
      }
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await sendMessage(text);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        await sendMessage(undefined, [data.data.url]);
      } else {
        setUploadError(data.error || 'Could not attach image. Please try again.');
      }
    } catch {
      setUploadError('Could not attach image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function endChat() {
    localStorage.removeItem(STORAGE_KEY);
    setChatId(null);
    setMessages([]);
    setReason('');
  }

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 9979,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        />
      )}
      <button
        onClick={() => setOpen(v => !v)}
        title="Live support"
        style={{
          position: 'fixed', bottom: 84, right: 20, zIndex: 9980,
          width: 50, height: 50, borderRadius: '50%',
          background: 'var(--fr-lime)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(204,255,0,0.45)',
          animation: open ? 'none' : 'supportPulse 3s ease-in-out infinite',
        }}
      >
        {open ? <X size={22} color="#000" weight="bold" /> : <Headset size={22} color="#000" weight="fill" />}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 144, right: 20, zIndex: 9981,
          width: 360, maxWidth: 'calc(100vw - 32px)', maxHeight: 'min(560px, calc(100dvh - 180px))',
          background: 'var(--fr-dark-0)', border: '1px solid var(--fr-border-md)', borderRadius: 16,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>SwappINR Support</div>
              <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'resolved' ? 'var(--fr-text-disabled)' : '#22C55E', display: 'inline-block' }} />
                {status === 'resolved' ? 'Chat resolved' : 'Usually replies in minutes'}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)' }}>
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
              <button type="submit" disabled={starting} className="fr-btn fr-btn--primary fr-btn--full" style={{ marginTop: 2 }}>
                {starting ? 'Starting…' : 'Start chat'}
              </button>
            </form>
          ) : (
            <>
              <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '78%', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.45,
                      background: m.role === 'user' ? 'var(--fr-lime)' : 'var(--fr-faint)',
                      color: m.role === 'user' ? '#000' : 'var(--fr-text-primary)',
                    }}>
                      {m.text && <div>{m.text}</div>}
                      {m.imageUrls.map(url => (
                        <img key={url} src={url} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, marginTop: m.text ? 6 : 0 }} />
                      ))}
                    </div>
                  </div>
                ))}
                {status === 'resolved' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'var(--fr-text-tertiary)', padding: '4px 0' }}>
                    <CheckCircle size={14} /> This chat was marked resolved. Send a message to reopen it.
                  </div>
                )}
              </div>
              {uploadError && (
                <div style={{ padding: '6px 14px', fontSize: 11, color: '#F87171', borderTop: '1px solid var(--fr-border-subtle)' }}>
                  {uploadError}
                </div>
              )}
              <div style={{ padding: 10, borderTop: '1px solid var(--fr-border-subtle)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Attach image"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 6 }}
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
              <button onClick={endChat} style={{ background: 'none', border: 'none', borderTop: '1px solid var(--fr-border-subtle)', padding: '8px 0', fontSize: 11, color: 'var(--fr-text-disabled)', cursor: 'pointer' }}>
                End chat & start a new one
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  background: 'var(--fr-faint)', border: '1px solid var(--fr-border-subtle)',
  color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none',
};
