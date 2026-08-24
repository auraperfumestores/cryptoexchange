'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

const T = {
  bg: 'rgba(255,255,255,0.03)', bg2: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.28)', green: '#00E5A0', red: '#F87171', yellow: '#F3BA2F', lime: '#CCFF00',
};

interface ReferralSettings {
  enabled: boolean;
  referrerRewardUsdt: number;
  refereeRewardUsdt: number;
  maxRewardsPerReferrerPerDay: number;
}

interface ReferralRow {
  _id: string;
  status: 'pending' | 'rewarded' | 'void';
  referralCode: string;
  referrer: { name: string; email: string };
  referee: { name: string; email: string };
  referrerRewardUsdt?: number;
  refereeRewardUsdt?: number;
  voidReason?: string;
  rewardedAt?: string;
  createdAt: string;
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Awaiting KYC', color: T.yellow },
  rewarded: { label: 'Rewarded',     color: T.green  },
  void:     { label: 'Void',         color: T.red    },
};

function inputStyle(): React.CSSProperties {
  return { padding: '9px 12px', borderRadius: 9, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%' };
}

export function ReferralManager() {
  const [tab, setTab] = useState<'settings' | 'users'>('settings');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {[{ value: 'settings', label: 'Settings' }, { value: 'users', label: 'Users' }].map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value as any)}
            style={{
              padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              background: tab === t.value ? 'rgba(204,255,0,0.1)' : T.bg,
              border: `1px solid ${tab === t.value ? 'rgba(204,255,0,0.3)' : T.border}`,
              color: tab === t.value ? T.lime : T.sub,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' ? <SettingsTab /> : <UsersTab />}
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(json => {
      if (json.success) setSettings(json.data.referralSettings);
    });
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralSettings: settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      toast.success('Referral settings saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <div style={{ padding: 40, textAlign: 'center', color: T.dim, fontSize: 13 }}>Loading…</div>;

  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22, maxWidth: 480 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
          style={{ width: 17, height: 17, accentColor: T.lime, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>Referral program enabled</span>
      </label>

      <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referrer reward (USDT)</p>
      <input
        type="number" min={0} step={0.5}
        value={settings.referrerRewardUsdt}
        onChange={e => setSettings({ ...settings, referrerRewardUsdt: Number(e.target.value) })}
        style={{ ...inputStyle(), marginBottom: 16 }}
      />

      <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referee welcome bonus (USDT)</p>
      <input
        type="number" min={0} step={0.5}
        value={settings.refereeRewardUsdt}
        onChange={e => setSettings({ ...settings, refereeRewardUsdt: Number(e.target.value) })}
        style={{ ...inputStyle(), marginBottom: 4 }}
      />
      <p style={{ fontSize: 11, color: T.dim, margin: '0 0 16px', lineHeight: 1.5 }}>Set to 0 to disable the referee-side bonus — only the referrer gets rewarded.</p>

      <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max rewards per referrer / day</p>
      <input
        type="number" min={1} step={1}
        value={settings.maxRewardsPerReferrerPerDay}
        onChange={e => setSettings({ ...settings, maxRewardsPerReferrerPerDay: Number(e.target.value) })}
        style={{ ...inputStyle(), marginBottom: 4 }}
      />
      <p style={{ fontSize: 11, color: T.dim, margin: '0 0 20px', lineHeight: 1.5 }}>
        Anti-abuse throttle. Rewards fire when a referred user's KYC is approved — a burst past
        this limit is skipped automatically and left pending for your review.
      </p>

      <button
        onClick={save}
        disabled={saving}
        style={{ padding: '10px 20px', borderRadius: 10, background: T.lime, color: '#000', fontSize: 13, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
}

function UsersTab() {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [totals, setTotals] = useState<{ total: number; pending: number; rewarded: number; void: number; totalPaidUsdt: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [voidingId, setVoidingId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/referrals');
      const json = await res.json();
      if (json.success) { setRows(json.data); setTotals(json.totals); }
    } finally {
      setLoading(false);
    }
  }

  async function confirmVoid(id: string) {
    if (!voidReason.trim()) { toast.error('A reason is required'); return; }
    try {
      const res = await fetch(`/api/admin/referrals/${id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Void failed');
      toast.success('Referral voided');
      setVoidingId(null);
      setVoidReason('');
      load();
    } catch (e: any) {
      toast.error(e.message ?? 'Void failed');
    }
  }

  return (
    <div>
      {totals && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total referrals', value: totals.total, color: T.text },
            { label: 'Awaiting KYC', value: totals.pending, color: T.yellow },
            { label: 'Rewarded', value: totals.rewarded, color: T.green },
            { label: 'Total paid out', value: `$${totals.totalPaidUsdt.toFixed(2)}`, color: T.lime },
          ].map(s => (
            <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: '0 0 2px' }}>{s.value}</p>
              <p style={{ fontSize: 11, color: T.dim, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 1fr', padding: '11px 18px', borderBottom: `1px solid ${T.border}`, fontSize: 10.5, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Referrer</span><span>Referee</span><span>Status</span><span>Paid</span><span>Date</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>No referrals yet.</div>
        ) : (
          rows.map(row => {
            const cfg = STATUS_CFG[row.status];
            const totalPaid = (row.referrerRewardUsdt ?? 0) + (row.refereeRewardUsdt ?? 0);
            return (
              <div key={row._id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 1fr', padding: '14px 18px', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{row.referrer.name}</p>
                    <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{row.referrer.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{row.referee.name}</p>
                    <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{row.referee.email}</p>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 12.5, color: totalPaid ? T.text : T.dim, fontWeight: totalPaid ? 700 : 400 }}>
                    {totalPaid ? `$${totalPaid.toFixed(2)}` : '—'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, color: T.dim }}>{formatDate(row.createdAt)}</span>
                    {row.status !== 'void' && (
                      <button
                        onClick={() => { setVoidingId(row._id); setVoidReason(''); }}
                        style={{ fontSize: 11, color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                      >
                        Void
                      </button>
                    )}
                  </div>
                </div>
                {row.voidReason && (
                  <p style={{ margin: '0 18px 12px', fontSize: 11, color: T.dim }}>Void reason: {row.voidReason}</p>
                )}
                {voidingId === row._id && (
                  <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8 }}>
                    <input
                      autoFocus
                      value={voidReason}
                      onChange={e => setVoidReason(e.target.value)}
                      placeholder="Reason for voiding this referral…"
                      style={{ ...inputStyle(), flex: 1 }}
                    />
                    <button onClick={() => confirmVoid(row._id)} style={{ padding: '9px 16px', borderRadius: 9, background: T.red, color: '#fff', fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Confirm void
                    </button>
                    <button onClick={() => setVoidingId(null)} style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: T.dim, fontSize: 12.5, fontWeight: 600, border: `1px solid ${T.border}`, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
