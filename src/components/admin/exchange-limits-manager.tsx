'use client';

import { useState } from 'react';
import type { ExchangeLimits } from '@/lib/db';

const TIERS: { key: keyof ExchangeLimits; label: string; color: string; bg: string; border: string; desc: string }[] = [
  { key: 'unverified', label: 'Unverified',  color: '#F87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', desc: 'Users who have not completed KYC' },
  { key: 'pending',    label: 'KYC Pending', color: '#FBBF24', bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)',  desc: 'KYC submitted, awaiting review' },
  { key: 'verified',   label: 'Verified',    color: '#00E5A0', bg: 'rgba(0,229,160,0.06)',   border: 'rgba(0,229,160,0.2)',   desc: 'Fully KYC verified users' },
];

function fmt(n: number) {
  if (n >= 100_00_000) return `₹${(n / 100_00_000).toFixed(0)} Cr`;
  if (n >= 1_00_000)   return `₹${(n / 1_00_000).toFixed(0)} L`;
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

interface LimitRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function LimitRow({ label, value, onChange }: LimitRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-text-primary)', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>{fmt(value)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)' }}>₹</span>
        <input
          type="number" value={value} min={0} step={1000}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: 130, padding: '8px 12px', background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 8, fontSize: 14, color: 'var(--fr-text-primary)', outline: 'none', fontFamily: 'var(--fr-font-mono)' }}
        />
      </div>
    </div>
  );
}

export function ExchangeLimitsManager({ initialLimits }: { initialLimits: ExchangeLimits }) {
  const [limits,  setLimits]  = useState<ExchangeLimits>(initialLimits);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  function updateLimit(tier: keyof ExchangeLimits, field: keyof ExchangeLimits[typeof tier], value: number) {
    setLimits(prev => ({ ...prev, [tier]: { ...prev[tier], [field]: value } }));
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchangeLimits: limits }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {TIERS.map(({ key, label, color, bg, border, desc }) => (
        <div key={key} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0 }}>{label}</h3>
              <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>{desc}</p>
            </div>
          </div>
          <div style={{ padding: '4px 22px 16px', display: 'flex', flexDirection: 'column' }}>
            {[
              { field: 'perTransaction' as const, label: 'Per transaction limit' },
              { field: 'daily' as const,          label: 'Daily limit' },
              { field: 'monthly' as const,        label: 'Monthly limit' },
            ].map(({ field, label: lbl }, i, arr) => (
              <div key={field} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <LimitRow
                  label={lbl}
                  value={limits[key][field]}
                  onChange={v => updateLimit(key, field, v)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 12, background: saving ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: saving ? 'rgba(255,255,255,0.3)' : '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saving ? (
            <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving…</>
          ) : 'Save Changes →'}
        </button>
        {saved && <span style={{ fontSize: 13, fontWeight: 700, color: '#00E5A0' }}>✓ Saved successfully</span>}
        {error && <span style={{ fontSize: 13, color: '#F87171' }}>{error}</span>}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
