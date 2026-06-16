'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { formatRate, timeAgo } from '@/lib/utils';
import type { RateDocument } from '@/types';

const T = {
  card:   'rgba(255,255,255,0.04)',
  card2:  'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  border2:'rgba(255,255,255,0.13)',
  text:   '#FFFFFF',
  sub:    'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.25)',
  blue:   '#4D9FFF',
  green:  '#00E5A0',
  red:    '#F87171',
  yellow: '#F3BA2F',
};

const NET_COLOR: Record<string, string> = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444', BNB: '#F3BA2F' };

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string | undefined; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim }}>{label}</label>
      <input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border2}`,
          borderRadius: 10, padding: '10px 13px', fontSize: 13, fontWeight: 600,
          color: T.text, outline: 'none', fontFamily: type === 'number' ? 'monospace' : 'inherit',
          width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(77,159,255,0.4)'}
        onBlur={e => e.currentTarget.style.borderColor = T.border2}
      />
    </div>
  );
}

export function RateEditor({ rates }: { rates: RateDocument[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rates.length === 0 ? (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '40px 24px', textAlign: 'center', color: T.sub, fontSize: 14 }}>
          No rates configured yet. Add one above.
        </div>
      ) : (
        rates.map(r => <RateRow key={r._id} rate={r} />)
      )}
    </div>
  );
}

function RateRow({ rate }: { rate: RateDocument }) {
  const router = useRouter();
  const [editing, setEditing]           = useState(false);
  const [histOpen, setHistOpen]         = useState(false);
  const [buyRate, setBuyRate]           = useState(rate.buyRate.toString());
  const [sellRate, setSellRate]         = useState(rate.sellRate.toString());
  const [spread, setSpread]             = useState(rate.spread.toString());
  const [depositAddress, setDepositAddress] = useState(rate.depositAddress ?? '');
  const [isActive, setIsActive]         = useState(rate.isActive);
  const [reason, setReason]             = useState('');
  const [saving, setSaving]             = useState(false);

  const netColor  = NET_COLOR[rate.network] ?? '#4D9FFF';
  const spreadPct = rate.buyRate && rate.sellRate
    ? (((rate.buyRate - rate.sellRate) / rate.sellRate) * 100).toFixed(2)
    : '0';

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/rates/${rate._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyRate: parseFloat(buyRate), sellRate: parseFloat(sellRate), spread: parseFloat(spread || '0'), depositAddress, isActive, reason: reason || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Save failed'); return; }
      toast.success('Rate updated');
      setEditing(false);
      setReason('');
      router.refresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.2s' }}>

      {/* ── View row ── */}
      <div style={{ padding: '18px 22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>

        {/* Symbol + network */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 160 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${netColor}18`, border: `1px solid ${netColor}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: netColor,
          }}>
            {rate.symbol === 'USDT' ? '$' : 'B'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
              {rate.symbol}
              <span style={{ fontSize: 11, fontWeight: 700, color: netColor, background: `${netColor}15`, border: `1px solid ${netColor}30`, borderRadius: 6, padding: '2px 7px', marginLeft: 8 }}>
                {rate.network}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 3 }}>
              Updated {timeAgo(rate.lastUpdatedAt)}
            </div>
          </div>
        </div>

        {/* Rate stats */}
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.dim, margin: '0 0 3px' }}>BUY</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.blue, margin: 0, fontFamily: 'monospace' }}>{formatRate(rate.buyRate)}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.dim, margin: '0 0 3px' }}>SELL</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0, fontFamily: 'monospace' }}>{formatRate(rate.sellRate)}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.dim, margin: '0 0 3px' }}>SPREAD</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.sub, margin: 0, fontFamily: 'monospace' }}>
              {rate.spreadType === 'fixed' ? `₹${rate.spread}` : `${rate.spread}%`}
            </p>
            <p style={{ fontSize: 10, color: T.dim, margin: '1px 0 0' }}>({spreadPct}% live)</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
            borderRadius: 999, fontSize: 11, fontWeight: 700,
            color: rate.isActive ? T.green : T.dim,
            background: rate.isActive ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)',
            border: rate.isActive ? '1px solid rgba(0,229,160,0.22)' : `1px solid ${T.border}`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: rate.isActive ? T.green : T.dim, boxShadow: rate.isActive ? '0 0 6px rgba(0,229,160,0.6)' : 'none' }} />
            {rate.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: editing ? 'rgba(255,255,255,0.08)' : 'rgba(77,159,255,0.12)',
              border: editing ? `1px solid ${T.border}` : '1px solid rgba(77,159,255,0.25)',
              color: editing ? T.sub : T.blue, transition: 'all 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L4 11H2V9L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            Edit
          </button>
        </div>
      </div>

      {/* ── Edit panel ── */}
      {editing && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: '20px 22px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
            <Field label="Buy Rate (₹)" value={buyRate} onChange={setBuyRate} type="number" />
            <Field label="Sell Rate (₹)" value={sellRate} onChange={setSellRate} type="number" />
            <Field label="Spread (%)" value={spread} onChange={setSpread} type="number" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Field label="Deposit Address" value={depositAddress} onChange={setDepositAddress} placeholder="0x… or T… wallet address" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Field label="Change Reason (optional)" value={reason} onChange={setReason} placeholder="e.g. Market correction" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <div
                onClick={() => setIsActive(!isActive)}
                style={{
                  width: 42, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                  background: isActive ? 'linear-gradient(135deg,#1A3FFF,#6B21FF)' : 'rgba(255,255,255,0.1)',
                  border: isActive ? 'none' : `1px solid ${T.border}`,
                }}
              >
                <span style={{ position: 'absolute', top: 3, left: isActive ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.sub }}>Active (visible to clients)</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditing(false); setBuyRate(rate.buyRate.toString()); setSellRate(rate.sellRate.toString()); }}
                style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${T.border}`, background: 'transparent', color: T.sub, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', color: '#fff', boxShadow: '0 4px 16px rgba(26,63,255,0.4)', opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7L5 10L11 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change history ── */}
      {rate.changeLog && rate.changeLog.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={() => setHistOpen(!histOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 22px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = T.sub}
            onMouseLeave={e => e.currentTarget.style.color = T.dim}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Change History ({rate.changeLog.length})
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 'auto', transform: histOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>

          {histOpen && (
            <div style={{ padding: '0 22px 14px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
              {[...rate.changeLog].reverse().slice(0, 10).map((c, i) => {
                const up = c.newBuy >= c.previousBuy;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 13px', background: T.card2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: up ? T.green : T.red }}>{up ? '↑' : '↓'}</span>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: T.sub }}>
                        {formatRate(c.previousBuy)} → <span style={{ color: up ? T.green : T.red, fontWeight: 700 }}>{formatRate(c.newBuy)}</span>
                      </span>
                      {c.reason && <span style={{ fontSize: 11, color: T.dim, fontStyle: 'italic' }}>"{c.reason}"</span>}
                    </div>
                    <span style={{ fontSize: 11, color: T.dim, whiteSpace: 'nowrap', marginLeft: 12 }}>{c.changedByName} · {timeAgo(c.changedAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
