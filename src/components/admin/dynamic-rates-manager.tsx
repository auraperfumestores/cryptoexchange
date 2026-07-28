'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import type { DynamicRateSettings, DynamicRateTier } from '@/lib/db';

// ── Styles ───────────────────────────────────────────────────────────────────

const T = {
  card:       { background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 14, padding: '20px 22px' } as React.CSSProperties,
  label:      { fontSize: 12, fontWeight: 700, color: 'var(--fr-text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  input:      { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
  badge: (on: boolean) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: on ? 'rgba(204,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: on ? '#CCFF00' : 'var(--fr-text-tertiary)', border: `1px solid ${on ? 'rgba(204,255,0,0.25)' : 'rgba(255,255,255,0.1)'}` }),
};

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--fr-dark-4)', borderRadius: 10, border: `1px solid ${enabled ? 'rgba(204,255,0,0.2)' : 'var(--fr-border-subtle)'}` }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{label}</span>
        <div style={{ marginTop: 3 }}>
          <span style={T.badge(enabled)}>{enabled ? 'ACTIVE' : 'DISABLED'}</span>
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: enabled ? '#CCFF00' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: 3, left: enabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: enabled ? '#000' : 'rgba(255,255,255,0.4)', transition: 'left 0.2s', display: 'block' }} />
      </button>
    </div>
  );
}

function TierTable({
  tiers,
  onChange,
  forSell,
}: {
  tiers:   DynamicRateTier[];
  onChange: (next: DynamicRateTier[]) => void;
  forSell:  boolean;
}) {
  function update(i: number, field: keyof DynamicRateTier, raw: string) {
    const val = parseFloat(raw);
    if (raw !== '' && (isNaN(val) || val < 0)) return;
    const next = tiers.map((t, idx) => idx === i ? { ...t, [field]: raw === '' ? 0 : val } : t);
    onChange(next);
  }

  function addTier() {
    const last = tiers[tiers.length - 1];
    onChange([...tiers, { minAmount: (last?.minAmount ?? 0) + 500, bonus: (last?.bonus ?? 0) + 0.5 }]);
  }

  function removeTier(i: number) {
    if (tiers.length <= 1) return;
    onChange(tiers.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
        <span style={T.label}>Min USDT</span>
        <span style={T.label}>{forSell ? 'Rate bonus (₹ added/USDT)' : 'Rate discount (₹ off/USDT)'}</span>
        <span />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tiers.map((tier, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              min={0}
              step={50}
              value={tier.minAmount}
              onChange={e => update(i, 'minAmount', e.target.value)}
              style={T.input}
              placeholder="0"
            />
            <input
              type="number"
              min={0}
              step={0.1}
              value={tier.bonus}
              onChange={e => update(i, 'bonus', e.target.value)}
              style={T.input}
              placeholder="0.00"
            />
            <button
              onClick={() => removeTier(i)}
              disabled={tiers.length <= 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.08)', color: '#F87171', cursor: tiers.length <= 1 ? 'not-allowed' : 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tiers.length <= 1 ? 0.35 : 1, flexShrink: 0 }}
              title="Remove tier"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addTier}
        style={{ marginTop: 10, padding: '7px 14px', borderRadius: 8, border: '1px dashed rgba(204,255,0,0.25)', background: 'rgba(204,255,0,0.04)', color: '#CCFF00', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
      >
        + Add tier
      </button>
      <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '8px 0 0', lineHeight: 1.5 }}>
        Tiers are matched by the largest <strong>Min USDT</strong> that is ≤ the trade size.
        {forSell
          ? ' Bonus is added to the base sell rate — the user receives more INR per USDT.'
          : ' Discount is subtracted from the base buy rate — the user pays less INR per USDT.'}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DynamicRatesManager({ initialSettings }: { initialSettings: DynamicRateSettings }) {
  const router  = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DynamicRateSettings>(initialSettings);

  function patch<K extends keyof DynamicRateSettings>(key: K, value: DynamicRateSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dynamicRates: settings }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return; }
      toast.success('Dynamic rate settings saved');
      router.refresh();
    } catch {
      toast.error('Failed to save dynamic rate settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Sell rates ─────────────────────────────────────────── */}
      <div style={T.card}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px' }}>Sell Rate Tiers</h3>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>When enabled, users selling larger USDT amounts receive a higher rate — earning more INR per USDT.</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Toggle
            enabled={settings.sellEnabled}
            onToggle={() => patch('sellEnabled', !settings.sellEnabled)}
            label="Dynamic sell rates"
          />
        </div>
        <TierTable
          tiers={settings.sellTiers}
          onChange={tiers => patch('sellTiers', tiers)}
          forSell
        />
      </div>

      {/* ── Buy rates ──────────────────────────────────────────── */}
      <div style={T.card}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px' }}>Buy Rate Tiers</h3>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>When enabled, users buying larger USDT amounts pay a lower rate — spending less INR per USDT.</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Toggle
            enabled={settings.buyEnabled}
            onToggle={() => patch('buyEnabled', !settings.buyEnabled)}
            label="Dynamic buy rates"
          />
        </div>
        <TierTable
          tiers={settings.buyTiers}
          onChange={tiers => patch('buyTiers', tiers)}
          forSell={false}
        />
      </div>

      {/* ── Save ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: saving ? 'rgba(204,255,0,0.4)' : '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save dynamic rates'}
        </button>
      </div>
    </div>
  );
}
