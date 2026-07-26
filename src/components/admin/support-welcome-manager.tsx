'use client';

import { useState } from 'react';
import type { SupportWelcomeSettings } from '@/lib/db';

const MAX_CHARS = 500;

interface Props { initialSettings: SupportWelcomeSettings }

export function SupportWelcomeManager({ initialSettings }: Props) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [message, setMessage] = useState(initialSettings.message);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  async function save() {
    if (enabled && !message.trim()) {
      setErrMsg('Message cannot be empty when enabled.'); setStatus('err'); return;
    }
    setSaving(true); setStatus('idle'); setErrMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportWelcome: { enabled, message: message.trim() } }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed'); }
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e: any) {
      setErrMsg(e.message ?? 'Save failed'); setStatus('err');
    } finally { setSaving(false); }
  }

  const remaining = MAX_CHARS - message.length;

  return (
    <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)' }}>Auto welcome message</div>
            <div style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', marginTop: 2 }}>
              Posted instantly as the first agent reply when a new chat session starts.
            </div>
          </div>
          <button
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            style={{
              flexShrink: 0, width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: enabled ? 'var(--fr-lime)' : 'var(--fr-dark-4)',
              transition: 'background 0.2s ease', position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: enabled ? 23 : 3, width: 18, height: 18,
              borderRadius: '50%', background: enabled ? '#000' : 'rgba(255,255,255,0.35)',
              transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </button>
        </div>

        {/* Message textarea */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
              Welcome message
            </label>
            <span style={{ fontSize: 11, color: remaining < 50 ? '#F87171' : 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>
              {remaining} left
            </span>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            placeholder="Type the welcome message users will see after submitting their first message…"
            style={{
              width: '100%', padding: '11px 14px', background: 'var(--fr-dark-1)',
              border: `1px solid ${remaining < 0 ? '#F87171' : 'var(--fr-border-default)'}`,
              borderRadius: 'var(--fr-radius-md)', fontSize: 13, color: 'var(--fr-text-primary)',
              outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
              boxSizing: 'border-box', opacity: enabled ? 1 : 0.45, transition: 'opacity 0.2s',
            }}
            disabled={!enabled}
          />
        </div>

        {/* Live chat preview */}
        {enabled && message.trim() && (
          <div style={{ padding: '12px 14px', background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.12)', borderRadius: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(204,255,0,0.5)', marginBottom: 10 }}>
              Preview — how users will see it
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--fr-lime), #9ad900)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000',
              }}>S</div>
              <div style={{
                maxWidth: '80%', padding: '8px 12px', borderRadius: 14, fontSize: 13, lineHeight: 1.45,
                background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}>
                {message.trim()}
              </div>
            </div>
          </div>
        )}

        {/* Status messages */}
        {status === 'err' && (
          <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, fontSize: 12, color: '#F87171' }}>{errMsg}</div>
        )}
        {status === 'ok' && (
          <div style={{ padding: '10px 14px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, fontSize: 12, color: '#00E5A0', fontWeight: 700 }}>✓ Welcome message saved</div>
        )}

        <button
          onClick={save} disabled={saving}
          style={{ alignSelf: 'flex-end', padding: '10px 24px', borderRadius: 'var(--fr-radius-md)', background: saving ? 'rgba(204,255,0,0.2)' : 'var(--fr-lime)', color: '#000', fontSize: 13, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save Welcome Message →'}
        </button>
      </div>
    </div>
  );
}
