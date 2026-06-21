'use client';

import { useState } from 'react';
import type { ProSettings } from '@/lib/db';

interface Props { initialSettings: ProSettings }

export function ProSettingsManager({ initialSettings }: Props) {
  const [price,    setPrice]    = useState(String(initialSettings.priceUsdt));
  const [days,     setDays]     = useState(String(initialSettings.durationDays));
  const [telegram, setTelegram] = useState(initialSettings.managerTelegram ?? '');
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg,   setErrMsg]   = useState('');

  async function save() {
    const priceUsdt    = parseFloat(price);
    const durationDays = parseInt(days, 10);
    if (!priceUsdt || priceUsdt <= 0 || !durationDays || durationDays <= 0) {
      setErrMsg('Price and duration must be positive numbers.'); setStatus('err'); return;
    }
    setSaving(true); setStatus('idle'); setErrMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proSettings: { priceUsdt, durationDays, managerTelegram: telegram.trim() } }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed'); }
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (e: any) {
      setErrMsg(e.message ?? 'Save failed'); setStatus('err');
    } finally { setSaving(false); }
  }

  return (
    <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Price + Duration row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Price (USDT)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>$</span>
              <input
                type="number" min="1" step="0.5"
                value={price} onChange={e => setPrice(e.target.value)}
                style={{ width: '100%', padding: '11px 14px 11px 26px', background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
              Duration (days)
            </label>
            <input
              type="number" min="1" max="365"
              value={days} onChange={e => setDays(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Telegram */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Manager Telegram URL
          </label>
          <input
            type="url"
            value={telegram}
            onChange={e => setTelegram(e.target.value)}
            placeholder="https://t.me/yourusername"
            style={{ width: '100%', padding: '11px 14px', background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          {telegram && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(0,136,204,0.08)', border: '1px solid rgba(0,136,204,0.2)', borderRadius: 10 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.248 13.78l-2.95-.924c-.64-.204-.657-.64.136-.954l11.498-4.431c.535-.194 1.003.131.63.777z"/></svg>
              <a href={telegram} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#0088cc', textDecoration: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{telegram}</a>
            </div>
          )}
        </div>

        {/* Info callout */}
        <div style={{ padding: '10px 14px', background: 'rgba(255,210,0,0.05)', border: '1px solid rgba(255,210,0,0.15)', borderRadius: 10, fontSize: 12, color: 'rgba(255,210,0,0.8)', lineHeight: 1.7 }}>
          Users pay <strong>{price || '?'} USDT</strong> to treasury and receive PRO for <strong>{days || '?'} days</strong>. Payment is verified on-chain within seconds. Manager link appears on Pro users&apos; profile page.
        </div>

        {/* Status + save */}
        {status === 'err' && (
          <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, fontSize: 12, color: '#F87171' }}>{errMsg}</div>
        )}
        {status === 'ok' && (
          <div style={{ padding: '10px 14px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10, fontSize: 12, color: '#00E5A0', fontWeight: 700 }}>✓ PRO settings saved</div>
        )}

        <button
          onClick={save} disabled={saving}
          style={{ alignSelf: 'flex-end', padding: '10px 24px', borderRadius: 'var(--fr-radius-md)', background: saving ? 'rgba(204,255,0,0.2)' : 'var(--fr-lime)', color: '#000', fontSize: 13, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save PRO Settings →'}
        </button>
      </div>
    </div>
  );
}
