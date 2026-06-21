'use client';

import { useState } from 'react';
import type { WidgetLimits } from '@/lib/db';

interface Props {
  initialLimits: WidgetLimits;
}

function NumberInput({ value, onChange, prefix = '', suffix = '' }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 8, padding: '8px 12px' }}>
      {prefix && <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', flexShrink: 0 }}>{prefix}</span>}
      <input
        type="number" value={value} min={0} step={1}
        onChange={e => onChange(Math.max(0, Number(e.target.value)))}
        style={{ width: 80, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}
      />
      {suffix && <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', flexShrink: 0 }}>{suffix}</span>}
    </div>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>{hint}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export function WidgetLimitsManager({ initialLimits }: Props) {
  const [limits, setLimits] = useState<WidgetLimits>(initialLimits);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetLimits: limits }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M8 2v12" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="8" cy="8" r="6" stroke="#CCFF00" strokeWidth="1.6"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0 }}>Widget Minimum Order</h3>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>
            Set the minimum order size for buy and sell transactions on the exchange widget. Users below the limit see an inline error and cannot proceed.
          </p>
        </div>
      </div>

      <div style={{ padding: '0 22px 6px' }}>
        <SettingRow
          label="Minimum buy order"
          hint="Users must buy at least this much USDT equivalent to proceed"
        >
          <NumberInput
            value={limits.minBuyUsdt}
            onChange={v => setLimits(l => ({ ...l, minBuyUsdt: v }))}
            prefix="$"
            suffix="USDT"
          />
        </SettingRow>

        <SettingRow
          label="Minimum sell order"
          hint="Users must sell at least this much USDT to proceed"
        >
          <NumberInput
            value={limits.minSellUsdt}
            onChange={v => setLimits(l => ({ ...l, minSellUsdt: v }))}
            prefix="$"
            suffix="USDT"
          />
        </SettingRow>
      </div>

      <div style={{ padding: '14px 22px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 12, background: saving ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: saving ? 'rgba(255,255,255,0.3)' : '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saving
            ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving…</>
            : 'Save Widget Limits →'}
        </button>
        {saved && <span style={{ fontSize: 13, fontWeight: 700, color: '#00E5A0' }}>✓ Saved</span>}
        {error && <span style={{ fontSize: 13, color: '#F87171' }}>{error}</span>}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
