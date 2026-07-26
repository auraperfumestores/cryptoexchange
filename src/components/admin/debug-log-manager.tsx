'use client';

import { useState } from 'react';

interface Props {
  initialEnabled: boolean;
}

export function DebugLogManager({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState<'idle' | 'saved' | 'error'>('idle');

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debugLogEnabled: next }),
      });
      if (!res.ok) throw new Error();
      setEnabled(next);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: 'var(--fr-dark-3)', border: `1px solid ${enabled ? 'rgba(248,113,113,0.35)' : 'var(--fr-border-default)'}`, borderRadius: 14, padding: '20px 24px', transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Toggle */}
        <button
          onClick={toggle}
          disabled={saving}
          aria-pressed={enabled}
          title={enabled ? 'Click to hide debug log' : 'Click to show debug log'}
          style={{
            flexShrink: 0,
            marginTop: 2,
            width: 48, height: 28,
            borderRadius: 14,
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            background: enabled ? '#F87171' : 'var(--fr-border-default)',
            position: 'relative',
            transition: 'background 0.2s',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <span style={{
            position: 'absolute',
            top: 4, left: enabled ? 24 : 4,
            width: 20, height: 20,
            borderRadius: '50%',
            background: '#ffffff',
            transition: 'left 0.2s',
          }} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)' }}>
              Debug Log Panel
            </p>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: enabled ? 'rgba(248,113,113,0.12)' : 'rgba(0,229,160,0.10)',
              color: enabled ? '#F87171' : '#00E5A0',
              border: `1px solid ${enabled ? 'rgba(248,113,113,0.25)' : 'rgba(0,229,160,0.2)'}`,
              textTransform: 'uppercase' as const, letterSpacing: '0.06em',
            }}>
              {enabled ? 'ON — visible to users' : 'OFF — hidden from users'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--fr-text-tertiary)', lineHeight: 1.6 }}>
            {enabled
              ? '⚠️ The debug log box is currently shown on wallet verification pages inside Trust Wallet\'s browser. Turn this OFF after testing — it exposes internal connection logs to all users.'
              : 'The debug log box is hidden on wallet pages. Turn ON only when diagnosing wallet connection issues inside Trust Wallet\'s in-app browser.'}
          </p>
        </div>

        {status === 'saved' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00E5A0', flexShrink: 0, marginTop: 4 }}>Saved ✓</span>
        )}
        {status === 'error' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F87171', flexShrink: 0, marginTop: 4 }}>Failed</span>
        )}
      </div>
    </div>
  );
}
