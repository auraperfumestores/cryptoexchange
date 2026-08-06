'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import type { ScheduledRateSettings, ScheduledRateSlot, AutoScheduleConfig } from '@/lib/db';

// ── Design tokens ────────────────────────────────────────────────────────────

const T = {
  card:   { background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 14, padding: '20px 22px' } as React.CSSProperties,
  label:  { fontSize: 12, fontWeight: 700, color: 'var(--fr-text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
  input:  { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const } as React.CSSProperties,
  select: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' } as React.CSSProperties,
  badge:  (on: boolean) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: on ? 'rgba(204,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: on ? '#CCFF00' : 'var(--fr-text-tertiary)', border: `1px solid ${on ? 'rgba(204,255,0,0.25)' : 'rgba(255,255,255,0.1)'}` }),
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatHour(h: number): string {
  if (h === 0)  return '12:00 AM (midnight)';
  if (h === 12) return '12:00 PM (noon)';
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

// ── Shared sub-components ────────────────────────────────────────────────────

function Toggle({
  enabled, onToggle, label, subtitle,
}: { enabled: boolean; onToggle: () => void; label: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--fr-dark-4)', borderRadius: 10, border: `1px solid ${enabled ? 'rgba(204,255,0,0.2)' : 'var(--fr-border-subtle)'}` }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{label}</span>
        {subtitle && <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.4 }}>{subtitle}</p>}
        <div style={{ marginTop: 4 }}>
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
    upcoming: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.28)',  label: 'UPCOMING' },
    active:   { color: '#CCFF00', bg: 'rgba(204,255,0,0.12)',   border: 'rgba(204,255,0,0.28)',   label: 'ACTIVE'   },
    expired:  { color: 'rgba(255,255,255,0.28)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', label: 'EXPIRED' },
  }[status];
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 5, fontSize: 10, fontWeight: 800, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: '0.07em' }}>
      {status === 'active' && '● '}{cfg.label}
    </span>
  );
}

function AutoBadge() {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 800, background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.28)', letterSpacing: '0.07em' }}>
      AUTO
    </span>
  );
}

// ── SlotRow ──────────────────────────────────────────────────────────────────

function SlotRow({ slot, now, onUpdate, onRemove }: {
  slot: ScheduledRateSlot;
  now: number;
  onUpdate: (field: keyof ScheduledRateSlot, value: unknown) => void;
  onRemove: () => void;
}) {
  const status = getSlotStatus(slot, now);
  return (
    <div style={{ background: 'var(--fr-dark-4)', borderRadius: 10, border: `1px solid ${status === 'active' ? 'rgba(204,255,0,0.22)' : 'var(--fr-border-subtle)'}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <StatusPill status={status} />
          {slot.auto && <AutoBadge />}
        </div>
        <button onClick={onRemove} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(248,113,113,0.22)', background: 'rgba(248,113,113,0.08)', color: '#F87171', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Delete">×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Network</div>
          <select value={slot.network} onChange={e => onUpdate('network', e.target.value)} style={T.select}>
            <option value="BEP20">BEP20 (BSC)</option>
            <option value="ERC20">ERC20 (Ethereum)</option>
            <option value="TRC20">TRC20 (TRON)</option>
          </select>
        </div>
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Order type</div>
          <select value={slot.type} onChange={e => onUpdate('type', e.target.value)} style={T.select}>
            <option value="sell">Sell (user sells USDT)</option>
            <option value="buy">Buy (user buys USDT)</option>
          </select>
        </div>
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Exact rate (₹/USDT)</div>
          <input type="number" min={0} step={0.01} value={slot.rate || ''} onChange={e => onUpdate('rate', parseFloat(e.target.value) || 0)} style={T.input} placeholder="e.g. 111.00" />
        </div>
        <div>
          <div style={{ ...T.label, marginBottom: 5 }}>Duration (minutes)</div>
          <input type="number" min={1} step={1} value={slot.durationMinutes || ''} onChange={e => onUpdate('durationMinutes', parseInt(e.target.value, 10) || 1)} style={T.input} placeholder="e.g. 5" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ ...T.label, marginBottom: 5 }}>Start date &amp; time (your local timezone)</div>
          <input type="datetime-local" value={isoToDatetimeLocal(slot.startAt)} onChange={e => onUpdate('startAt', datetimeLocalToIso(e.target.value))} style={T.input} />
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

// ── UpcomingAutoList ─────────────────────────────────────────────────────────

function UpcomingAutoList({ slots, now }: { slots: ScheduledRateSlot[]; now: number }) {
  const upcoming = slots
    .filter(s => s.auto && getSlotStatus(s, now) !== 'expired')
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  if (upcoming.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>
          No upcoming auto-generated overrides. Click &quot;Generate today&apos;s schedule&quot; to create them.
        </p>
      </div>
    );
  }

  const NET_COLOR: Record<string, string> = {
    BEP20: '#F0B90B',
    ERC20: '#627EEA',
    TRC20: '#EF0027',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {upcoming.map(slot => {
        const status  = getSlotStatus(slot, now);
        const startMs = new Date(slot.startAt).getTime();
        const endIso  = new Date(startMs + slot.durationMinutes * 60_000).toISOString();
        return (
          <div
            key={slot.id}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr auto auto',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 9,
              background: status === 'active' ? 'rgba(204,255,0,0.04)' : 'var(--fr-dark-4)',
              border: `1px solid ${status === 'active' ? 'rgba(204,255,0,0.18)' : 'var(--fr-border-subtle)'}`,
            }}
          >
            {/* Network chip */}
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: `${NET_COLOR[slot.network]}18`, color: NET_COLOR[slot.network], border: `1px solid ${NET_COLOR[slot.network]}40`, whiteSpace: 'nowrap' }}>
              {slot.network}
            </span>

            {/* Type chip */}
            <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: slot.type === 'sell' ? 'rgba(96,165,250,0.1)' : 'rgba(52,211,153,0.1)', color: slot.type === 'sell' ? '#60A5FA' : '#34D399', border: `1px solid ${slot.type === 'sell' ? 'rgba(96,165,250,0.25)' : 'rgba(52,211,153,0.25)'}`, whiteSpace: 'nowrap' }}>
              {slot.type.toUpperCase()}
            </span>

            {/* Time window */}
            <span style={{ fontSize: 12, color: 'var(--fr-text-secondary)', fontFamily: 'inherit' }}>
              {formatTime(slot.startAt)} <span style={{ color: 'var(--fr-text-tertiary)' }}>→</span> {formatTime(endIso)}{' '}
              <span style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>({slot.durationMinutes} min)</span>
            </span>

            {/* Rate */}
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              ₹{slot.rate.toFixed(2)}
            </span>

            {/* Status */}
            <StatusPill status={status} />
          </div>
        );
      })}
    </div>
  );
}

// ── NetworkCard ──────────────────────────────────────────────────────────────

const NET_LABELS: Record<string, string> = {
  BEP20: 'BEP20 — BNB Smart Chain',
  ERC20: 'ERC20 — Ethereum',
  TRC20: 'TRC20 — TRON',
};

function NetworkCard({
  network, cfg, onChange,
}: {
  network: 'BEP20' | 'ERC20' | 'TRC20';
  cfg: { enabled: boolean; includeBuy: boolean; includeSell: boolean };
  onChange: (field: 'enabled' | 'includeBuy' | 'includeSell', value: boolean) => void;
}) {
  return (
    <div style={{ background: 'var(--fr-dark-4)', borderRadius: 10, border: `1px solid ${cfg.enabled ? 'rgba(204,255,0,0.18)' : 'var(--fr-border-subtle)'}`, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: cfg.enabled ? 14 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{NET_LABELS[network]}</span>
        <button
          onClick={() => onChange('enabled', !cfg.enabled)}
          style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: cfg.enabled ? '#CCFF00' : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
        >
          <span style={{ position: 'absolute', top: 3, left: cfg.enabled ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: cfg.enabled ? '#000' : 'rgba(255,255,255,0.4)', transition: 'left 0.2s', display: 'block' }} />
        </button>
      </div>

      {cfg.enabled && (
        <div style={{ display: 'flex', gap: 10 }}>
          {(['includeSell', 'includeBuy'] as const).map(field => {
            const active = cfg[field];
            const label  = field === 'includeSell' ? 'Sell orders' : 'Buy orders';
            return (
              <button
                key={field}
                onClick={() => onChange(field, !active)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, border: `1px solid ${active ? 'rgba(204,255,0,0.3)' : 'var(--fr-border-subtle)'}`, background: active ? 'rgba(204,255,0,0.07)' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: active ? '#CCFF00' : 'var(--fr-text-tertiary)', transition: 'all 0.15s' }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${active ? '#CCFF00' : 'rgba(255,255,255,0.2)'}`, background: active ? '#CCFF00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── AutoScheduleSection ──────────────────────────────────────────────────────

function AutoScheduleSection({
  initial,
  currentSlots,
  now,
  onGenerated,
}: {
  initial: AutoScheduleConfig;
  currentSlots: ScheduledRateSlot[];
  now: number;
  onGenerated: (mergedSlots: ScheduledRateSlot[]) => void;
}) {
  const router     = useRouter();
  const [cfg, setCfg]        = useState<AutoScheduleConfig>(initial);
  const [saving, setSaving]  = useState(false);
  const [generating, setGen] = useState(false);

  function setField<K extends keyof AutoScheduleConfig>(key: K, value: AutoScheduleConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: value }));
  }

  function setNetField(network: 'BEP20' | 'ERC20' | 'TRC20', field: 'enabled' | 'includeBuy' | 'includeSell', value: boolean) {
    setCfg(prev => ({
      ...prev,
      networks: { ...prev.networks, [network]: { ...prev.networks[network], [field]: value } },
    }));
  }

  const crossMidnight = cfg.windowEndHour < cfg.windowStartHour;
  const anyNetEnabled = Object.values(cfg.networks).some(n => n.enabled);

  async function saveConfig() {
    if (cfg.maxSlotsPerDay < cfg.minSlotsPerDay) { toast.error('Max slots/day must be ≥ min slots/day'); return; }
    if (cfg.maxRate < cfg.minRate)               { toast.error('Max rate must be ≥ min rate'); return; }
    if (cfg.maxDurationMinutes < cfg.minDurationMinutes) { toast.error('Max duration must be ≥ min duration'); return; }

    setSaving(true);
    try {
      // Capture browser's UTC offset so the server generates slots in the admin's local time
      const tzOffsetMinutes = -(new Date().getTimezoneOffset());
      const res  = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autoScheduleConfig: { ...cfg, tzOffsetMinutes } }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return; }
      toast.success('Auto schedule configuration saved');
    } catch {
      toast.error('Failed to save auto schedule configuration');
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    if (cfg.maxSlotsPerDay < cfg.minSlotsPerDay) { toast.error('Max slots/day must be ≥ min slots/day'); return; }
    if (cfg.maxRate < cfg.minRate)               { toast.error('Max rate must be ≥ min rate'); return; }
    if (cfg.maxDurationMinutes < cfg.minDurationMinutes) { toast.error('Max duration must be ≥ min duration'); return; }

    setGen(true);
    try {
      // Always save current UI config first so the generate endpoint uses the latest settings
      const tzOffsetMinutes = -(new Date().getTimezoneOffset());
      const saveRes = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoScheduleConfig: { ...cfg, tzOffsetMinutes } }),
      });
      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        toast.error(saveData.error ?? 'Failed to save config before generating');
        return;
      }

      const res  = await fetch('/api/admin/auto-schedule/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Generation failed'); return; }
      const { generated, totalSlots, slots } = data.data;
      toast.success(`Generated ${generated} slot${generated !== 1 ? 's' : ''} using ${cfg.windowStartHour}:00–${cfg.windowEndHour}:00 window`);
      // Update last-generated date in local state immediately
      const tzOffsetMs = tzOffsetMinutes * 60_000;
      const shifted    = new Date(Date.now() + tzOffsetMs);
      const today = `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
      setCfg(prev => ({ ...prev, lastGeneratedDate: today, tzOffsetMinutes }));
      // Propagate merged slots up so the slot list and upcoming list refresh immediately
      onGenerated(slots);
      router.refresh();
    } catch {
      toast.error('Failed to generate schedule');
    } finally {
      setGen(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Master toggle */}
      <Toggle
        enabled={cfg.enabled}
        onToggle={() => setField('enabled', !cfg.enabled)}
        label="Auto-generate overrides daily"
        subtitle="When enabled, the system automatically generates a fresh set of random override slots every day at the first rate request, using the rules below. No manual intervention needed."
      />

      {cfg.enabled && (
        <>
          {/* ── Generation Rules ── */}
          <div style={{ ...T.card, gap: 0 }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 16px', letterSpacing: '-0.01em' }}>Generation Rules</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* Slots per day range */}
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Min slots per day</div>
                <input
                  type="number" min={1} max={50} step={1}
                  value={cfg.minSlotsPerDay}
                  onChange={e => setField('minSlotsPerDay', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={T.input}
                />
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Max slots per day</div>
                <input
                  type="number" min={1} max={50} step={1}
                  value={cfg.maxSlotsPerDay}
                  onChange={e => setField('maxSlotsPerDay', Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={T.input}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: -6 }}>
                <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: 0 }}>
                  Each day a random number between {cfg.minSlotsPerDay} and {cfg.maxSlotsPerDay} slots is generated and distributed across enabled networks.
                </p>
              </div>

              {/* Time window */}
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Window start</div>
                <select value={cfg.windowStartHour} onChange={e => setField('windowStartHour', parseInt(e.target.value, 10))} style={T.select}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Window end {crossMidnight && <span style={{ color: '#FBBF24', fontWeight: 700, fontSize: 10 }}>(next day)</span>}</div>
                <select value={cfg.windowEndHour} onChange={e => setField('windowEndHour', parseInt(e.target.value, 10))} style={T.select}>
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>{formatHour(h)}{cfg.windowStartHour > h ? ' (+1 day)' : ''}</option>
                  ))}
                </select>
              </div>
              {crossMidnight && (
                <div style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.22)', fontSize: 12, color: '#FBBF24' }}>
                  Cross-midnight window — overrides will be placed between {formatHour(cfg.windowStartHour)} today and {formatHour(cfg.windowEndHour)} the following morning.
                </div>
              )}

              {/* Rate range */}
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Min rate (₹/USDT)</div>
                <input type="number" min={0} step={0.01} value={cfg.minRate} onChange={e => setField('minRate', parseFloat(e.target.value) || 0)} style={T.input} placeholder="e.g. 110.00" />
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Max rate (₹/USDT)</div>
                <input type="number" min={0} step={0.01} value={cfg.maxRate} onChange={e => setField('maxRate', parseFloat(e.target.value) || 0)} style={T.input} placeholder="e.g. 115.00" />
              </div>

              {/* Duration range */}
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Min duration (minutes)</div>
                <input type="number" min={1} step={1} value={cfg.minDurationMinutes} onChange={e => setField('minDurationMinutes', parseInt(e.target.value, 10) || 1)} style={T.input} placeholder="e.g. 5" />
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Max duration (minutes)</div>
                <input type="number" min={1} step={1} value={cfg.maxDurationMinutes} onChange={e => setField('maxDurationMinutes', parseInt(e.target.value, 10) || 1)} style={T.input} placeholder="e.g. 15" />
              </div>
            </div>
          </div>

          {/* ── Networks ── */}
          <div style={T.card}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>Networks &amp; Order Types</h4>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Enable each network independently. Slots are distributed across all enabled (network, type) combinations via round-robin.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['BEP20', 'ERC20', 'TRC20'] as const).map(net => (
                <NetworkCard key={net} network={net} cfg={cfg.networks[net]} onChange={(field, value) => setNetField(net, field, value)} />
              ))}
            </div>
            {!anyNetEnabled && (
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', fontSize: 12, color: '#F87171' }}>
                Enable at least one network to generate slots.
              </div>
            )}
          </div>

          {/* ── Upcoming auto-generated overrides ── */}
          <div style={T.card}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Upcoming Auto-Generated Overrides</h4>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '0 0 14px' }}>
              Live view of all non-expired auto slots. The schedule regenerates automatically at the first rate request of each new day.
            </p>
            <UpcomingAutoList slots={currentSlots} now={now} />
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--fr-text-tertiary)' }}>
              {cfg.lastGeneratedDate
                ? <>Last generated: <strong style={{ color: 'var(--fr-text-secondary)' }}>{cfg.lastGeneratedDate}</strong></>
                : 'Not generated yet for today'}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={saveConfig}
                disabled={saving}
                style={{ padding: '9px 20px', borderRadius: 9, border: '1px solid var(--fr-border-subtle)', background: 'var(--fr-dark-4)', color: 'var(--fr-text-primary)', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : 'Save auto schedule config'}
              </button>
              <button
                onClick={generate}
                disabled={generating || !anyNetEnabled}
                style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: (generating || !anyNetEnabled) ? 'rgba(204,255,0,0.35)' : '#CCFF00', color: '#000', fontSize: 13, fontWeight: 800, cursor: (generating || !anyNetEnabled) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                {generating ? 'Generating…' : '⚡ Generate today\'s schedule'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ScheduledRatesManager({
  initialSettings,
  initialAutoConfig,
}: {
  initialSettings: ScheduledRateSettings;
  initialAutoConfig: AutoScheduleConfig;
}) {
  const router = useRouter();
  const [saving, setSaving]     = useState(false);
  const [settings, setSettings] = useState<ScheduledRateSettings>(initialSettings);
  const [now, setNow]           = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(iv);
  }, []);

  function addSlot() {
    const newSlot: ScheduledRateSlot = {
      id: genId(),
      network: 'BEP20',
      type: 'sell',
      rate: 0,
      startAt: new Date(Date.now() + 3_600_000).toISOString(),
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

  // Called by AutoScheduleSection after generation — syncs slot list immediately
  function handleGenerated(mergedSlots: ScheduledRateSlot[]) {
    setSettings(prev => ({ ...prev, slots: mergedSlots }));
  }

  async function save() {
    for (const slot of settings.slots) {
      if (!slot.rate || slot.rate <= 0)                              { toast.error('All slots must have a rate > 0'); return; }
      if (!slot.startAt || isNaN(new Date(slot.startAt).getTime())) { toast.error('All slots must have a valid start time'); return; }
      if (slot.durationMinutes <= 0)                                 { toast.error('Duration must be at least 1 minute'); return; }
    }

    setSaving(true);
    try {
      const res  = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduledRateOverrides: settings }) });
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
  const autoCount   = settings.slots.filter(s => s.auto).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Section A: Manual override toggle + slot list ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={T.card}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px' }}>Scheduled Rate Overrides</h3>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
              When enabled, rates for the selected network/type revert to the exact scheduled rate during the configured window. Dynamic tier bonuses are suspended while a slot is active.
            </p>
          </div>
          <Toggle
            enabled={settings.enabled}
            onToggle={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            label="Scheduled rate overrides"
          />
          {settings.enabled && activeCount > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#CCFF00' }}>● {activeCount} override{activeCount !== 1 ? 's' : ''} currently live</span>
            </div>
          )}
        </div>

        <div style={T.card}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 3px' }}>Scheduled Slots</h3>
              <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>
                {autoCount > 0
                  ? `${settings.slots.length} total — ${autoCount} auto (gold badge), ${settings.slots.length - autoCount} manual`
                  : 'Each slot sets an exact rate for a specific network/type at a specific time.'}
              </p>
            </div>
            <button onClick={addSlot} style={{ padding: '8px 16px', borderRadius: 8, border: '1px dashed rgba(204,255,0,0.3)', background: 'rgba(204,255,0,0.05)', color: '#CCFF00', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Add override slot
            </button>
          </div>

          {settings.slots.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>
                No slots configured. Add one manually or use the Auto Schedule System below.
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

        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <p style={{ fontSize: 11, color: 'rgba(96,165,250,0.8)', margin: 0, lineHeight: 1.6 }}>
            <strong>How it works:</strong> When a slot is active, users trading that network/type are charged the exact rate you set — ignoring the base rate and any volume bonuses. The rate reverts automatically when the window ends.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={save} disabled={saving} style={{ padding: '11px 28px', borderRadius: 10, border: 'none', background: saving ? 'rgba(204,255,0,0.4)' : '#CCFF00', color: '#000', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save scheduled overrides'}
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {/* ── Section B: Auto Schedule System ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 4px' }}>Auto Schedule System</h3>
          <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
            Configure generation rules once and the system produces a fresh set of randomised override slots every day — automatically, without any manual action. Slots appear above with a gold AUTO badge.
          </p>
        </div>

        <AutoScheduleSection
          initial={initialAutoConfig}
          currentSlots={settings.slots}
          now={now}
          onGenerated={handleGenerated}
        />
      </div>
    </div>
  );
}
