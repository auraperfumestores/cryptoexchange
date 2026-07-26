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
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Toggle */}
        <button
          onClick={toggle}
          disabled={saving}
          aria-pressed={enabled}
          style={{
            flexShrink: 0,
            width: 48, height: 28,
            borderRadius: 14,
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            background: enabled ? '#CCFF00' : 'var(--fr-border-default)',
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
            background: enabled ? '#000' : 'var(--fr-text-tertiary)',
            transition: 'left 0.2s',
          }} />
        </button>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)' }}>
            {enabled ? 'Debug panel visible' : 'Debug panel hidden'}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--fr-text-tertiary)', lineHeight: 1.5 }}>
            When enabled, a scrollable debug log box appears on wallet verification pages opened inside Trust Wallet's in-app browser. Disable for production — enable only when diagnosing connection issues.
          </p>
        </div>

        {status === 'saved' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00E5A0', flexShrink: 0 }}>Saved ✓</span>
        )}
        {status === 'error' && (
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-red)', flexShrink: 0 }}>Failed — try again</span>
        )}
      </div>
    </div>
  );
}
