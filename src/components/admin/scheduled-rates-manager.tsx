'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import type { ScheduledRateSettings, ScheduledRateSlot } from '@/lib/db';

// ── Styles ───────────────────────────────────────────────────────────────────

const T = {
  card:   { background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 14, padding: '20px 22px' } as React.CSSProperties,
  label:  { fontSize: 12, fontWeight: 700, color: 'var(--fr-text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  input:  { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const } as React.CSSProperties,
  select: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
  badge: (on: boolean) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: on ? 'rgba(204,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: on ? '#CCFF00' : 'var(--fr-text-tertiary)', border: `1px solid ${on ? 'rgba(204,255,0,0.25)' : 'rgba(255,255,255,0.1)'}` }),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

type SlotStatus = 'upcoming' | 'active' | 'expired';

function getSlotStatus(slot: ScheduledRateSlot, now: number): SlotStatus {
  const start = new Date(slot.startAt).getTime();
  const end   = start + slot.durationMinutes * 60_000;
  if (now < start) return 'upcoming';
  if (now < end)   return 'active';
  return 'expired';
}

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string {
  const d = new Date(local);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function formatExpiry(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function StatusPill({ status }: { status: SlotStatus }) {
  const cfg = {
    upcoming: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.28)', label: 'UPCOMING' },
    active:   { color: '#CCFF00', bg: 'rgba(204,255,0,0.12)',  border: 'rgba(204,255,0,0.28)',  label: 'ACTIVE'   },
    expired:  { color: 'rgba(255,255,255,0.28)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', label: 'EXPIRED' },
  }[status];
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 5, fontSize: 10, fontWeight: 800, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: '0.07em' }}>
      {status === 'active' && '● '}{cfg.label}
    </span>
  );
}

function SlotRow({
  slot,
  now,
  onUpdate,
  onRemove,
}: {
  slot: ScheduledRateSlot;
  now: number;
  onUpdate: (field: keyof ScheduledRateSlot, value: unknown) => void;
  onRemove: () => void;
}) {
  const status = getSlotStatus(slot, now);
  return (
    <div style={{ background: 'var(--fr-dark-4)', borderRadius: 10, border: `1px solid ${status === 'active' ? 'rgba(204,255,0,0.22)' : 'var(--fr-border-subtle)'}`, padding: '14px 16px' }}>
      {/* Header row: status + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <StatusPill status={status} />
        <button
          onClick={onRemove}
          style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(248,113,113,0.22)', background: 'rgba(248,113,113,0.08)', color: '#F87171', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          title="Delete this override"
        >
          ×
        </button>
      </div>

      {/* Inputs grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {/* Network */}
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Network</div>
          <select
            value={slot.network}
            onChange={e => onUpdate('network', e.target.value)}
            style={T.select}
          >
            <option value="BEP20">BEP20 (BSC)</option>
            <option value="ERC20">ERC20 (Ethereum)</option>
            <option value="TRC20">TRC20 (TRON)</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Order type</div>
          <select
            value={slot.type}
            onChange={e => onUpdate('type', e.target.value)}
            style={T.select}
          >
            <option value="sell">Sell (user sells USDT)</option>
            <option value="buy">Buy (user buys USDT)</option>
          </select>
        </div>

        {/* Rate */}
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Exact rate (₹ per USDT)</div>
          <input
            type="number"
            min={0}
            step={0.01}
            value={slot.rate || ''}
            onChange={e => onUpdate('rate', parseFloat(e.target.value) || 0)}
            style={T.input}
            placeholder="e.g. 111.00"
          />
        </div>

        {/* Duration */}
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Duration (minutes)</div>
          <input
            type="number"
            min={1}
            step={1}
            value={slot.durationMinutes || ''}
            onChange={e => onUpdate('durationMinutes', parseInt(e.target.value, 10) || 1)}
            style={T.input}
            placeholder="e.g. 5"
          />
        </div>

        {/* Start datetime — spans full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ ...T.label, marginBottom: 5 }}>Start date &amp; time (your local timezone)</div>
          <input
            type="datetime-local"
            value={isoToDatetimeLocal(slot.startAt)}
            onChange={e => onUpdate('startAt', datetimeLocalToIso(e.target.value))}
            style={T.input}
          />
          {status !== 'upcoming' && (
            <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '5px 0 0' }}>
              {status === 'active'
                ? `Active until ${formatExpiry(new Date(new Date(slot.startAt).getTime() + slot.durationMinutes * 60_000).toISOString())}`
                : `Expired at ${formatExpiry(new Date(new Date(slot.startAt).getTime() + slot.durationMinutes * 60_000).toISOString())}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ScheduledRatesManager({ initialSettings }: { initialSettings: ScheduledRateSettings }) {
  const router  = useRouter();
  const [saving, setSaving]   = useState(false);
  const [settings, setSettings] = useState<ScheduledRateSettings>(initialSettings);
  const [now, setNow]         = useState(Date.now());

  // Refresh status badges every 10 seconds
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(iv);
  }, []);

  function addSlot() {
    const startAt = new Date(Date.now() + 3_600_000).toISOString(); // default: 1h from now
    const newSlot: ScheduledRateSlot = {
      id: genId(),
      network: 'BEP20',
      type: 'sell',
      rate: 0,
      startAt,
      durationMinutes: 5,
    };
    setSettings(prev => ({ ...prev, slots: [...prev.slots, newSlot] }));
  }

  function removeSlot(id: string) {
    setSettings(prev => ({ ...prev, slots: prev.slots.filter(s => s.id !== id) }));
  }

  function updateSlot(id: string, field: keyof ScheduledRateSlot, value: unknown) {
    setSettings(prev => ({
      ...prev,
      slots: prev.slots.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  }

  async function save() {
    // Validate: all slots must have a rate > 0
    for (const slot of settings.slots) {
      if (!slot.rate || slot.rate <= 0) {
        toast.error('All override slots must have a rate greater than 0');
        return;
      }
      if (!slot.startAt || isNaN(new Date(slot.startAt).getTime())) {
        toast.error('All override slots must have a valid start time');
        return;
      }
      if (slot.durationMinutes <= 0) {
        toast.error('Duration must be at least 1 minute');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledRateOverrides: settings }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return; }
      toast.success('Scheduled rate overrides saved');
      router.refresh();
    } catch {
      toast.error('Failed to save scheduled rate overrides');
    } finally {
      setSaving(false);
    }
  }

  const activeCount = settings.slots.filter(s => getSlotStatus(s, now) === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Feature toggle ─────────────────────────────────────── */}
      <div style={T.card}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px' }}>Scheduled Rate Overrides</h3>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
            When enabled, rates for selected network/type revert to the exact scheduled rate during the configured time window. Dynamic tier bonuses are suspended for overridden rates.
          </p>
        </div>
        <Toggle
          enabled={settings.enabled}
          onToggle={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
          label="Scheduled rate overrides"
        />
        {settings.enabled && activeCount > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#CCFF00' }}>
              ● {activeCount} override{activeCount !== 1 ? 's' : ''} currently live
            </span>
          </div>
        )}
      </div>

      {/* ── Override slots ──────────────────────────────────────── */}
      <div style={T.card}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 3px' }}>Scheduled Slots</h3>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>
              Each slot sets an exact rate for a specific network/type at a specific time.
            </p>
          </div>
          <button
            onClick={addSlot}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px dashed rgba(204,255,0,0.3)', background: 'rgba(204,255,0,0.05)', color: '#CCFF00', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Add override slot
          </button>
        </div>

        {settings.slots.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>
              No override slots configured. Click &quot;Add override slot&quot; to create one.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {settings.slots.map(slot => (
              <SlotRow
                key={slot.id}
                slot={slot}
                now={now}
                onUpdate={(field, value) => updateSlot(slot.id, field, value)}
                onRemove={() => removeSlot(slot.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Info note ───────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <p style={{ fontSize: 11, color: 'rgba(96,165,250,0.8)', margin: 0, lineHeight: 1.6 }}>
          <strong>How it works:</strong> When a slot is active, users trading that network/type see and are charged the exact rate you set — ignoring the base rate and any volume tier bonuses. The rate reverts automatically when the window ends. Times are shown in your local timezone.
        </p>
      </div>

      {/* ── Save ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: saving ? 'rgba(204,255,0,0.4)' : '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save scheduled overrides'}
        </button>
      </div>

    </div>
  );
}
