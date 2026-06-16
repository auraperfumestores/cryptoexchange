'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import type { RateDocument } from '@/types';

const NET_COLOR: Record<string, string> = { BEP20: '#F3BA2F', ERC20: '#627EEA', TRC20: '#EF4444' };
const NET_LABEL: Record<string, string> = { BEP20: 'BEP-20 (BSC)', ERC20: 'ERC-20 (ETH)', TRC20: 'TRC-20 (TRON)' };
const NET_HINT: Record<string, string> = {
  BEP20: 'BNB Smart Chain address (0x…)',
  ERC20: 'Ethereum address (0x…)',
  TRC20: 'TRON address (T…)',
};

const T = {
  card:   'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  border2:'rgba(255,255,255,0.13)',
  text:   '#FFFFFF',
  sub:    'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.25)',
  green:  '#00E5A0',
  red:    '#F87171',
  yellow: '#F3BA2F',
};

function AddressRow({ rate }: { rate: RateDocument }) {
  const router   = useRouter();
  const color    = NET_COLOR[rate.network] ?? '#4D9FFF';
  const [editing, setEditing] = useState(false);
  const [addr, setAddr]       = useState(rate.depositAddress ?? '');
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/rates/${rate._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositAddress: addr }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Save failed'); return; }
      toast.success(`${rate.network} deposit address updated`);
      setEditing(false);
      router.refresh();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }

  function copy() {
    if (!rate.depositAddress) return;
    navigator.clipboard.writeText(rate.depositAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const configured = !!(rate.depositAddress?.trim());

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 14,
      border: `1px solid ${configured ? T.border : 'rgba(248,113,113,0.18)'}`,
      padding: '16px 20px', transition: 'border-color 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editing ? 14 : (configured ? 10 : 0) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `${color}18`, border: `1px solid ${color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 900, color,
          }}>
            {rate.network === 'ERC20' ? 'Ξ' : rate.network === 'BEP20' ? 'B' : 'T'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{NET_LABEL[rate.network] ?? rate.network}</div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>USDT · {rate.symbol}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!configured && !editing && (
            <span style={{ fontSize: 11, fontWeight: 700, color: T.red, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '3px 10px' }}>
              Not set
            </span>
          )}
          {configured && !editing && (
            <button onClick={copy} title="Copy address" style={{
              background: copied ? 'rgba(0,229,160,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copied ? 'rgba(0,229,160,0.25)' : T.border}`,
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              color: copied ? T.green : T.sub, transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {copied
                ? <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4 8L9.5 2.5" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round"/></svg>Copied</>
                : <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3 3V2C3 1.4 3.4 1 4 1H9C9.6 1 10 1.4 10 2V7C10 7.6 9.6 8 9 8H8" stroke="currentColor" strokeWidth="1.2"/></svg>Copy</>}
            </button>
          )}
          <button
            onClick={() => { setEditing(!editing); setAddr(rate.depositAddress ?? ''); }}
            style={{
              background: editing ? 'rgba(255,255,255,0.06)' : `${color}14`,
              border: `1px solid ${editing ? T.border : `${color}30`}`,
              borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, color: editing ? T.sub : color,
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5L9.5 3.5L3.5 9.5H1.5V7.5L7.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {editing ? 'Cancel' : (configured ? 'Edit' : 'Set address')}
          </button>
        </div>
      </div>

      {/* Current address display */}
      {configured && !editing && (
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px' }}>
          <code style={{ fontSize: 12, color: T.text, wordBreak: 'break-all', lineHeight: 1.6, fontFamily: 'monospace' }}>
            {rate.depositAddress}
          </code>
        </div>
      )}

      {/* Edit input */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, display: 'block', marginBottom: 6 }}>
              Deposit Address ({NET_LABEL[rate.network]})
            </label>
            <input
              type="text"
              value={addr}
              onChange={e => setAddr(e.target.value)}
              placeholder={NET_HINT[rate.network] ?? 'Wallet address'}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}40`,
                borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600,
                color: T.text, outline: 'none', fontFamily: 'monospace',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${color}80`}
              onBlur={e => e.currentTarget.style.borderColor = `${color}40`}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${T.border}`, background: 'transparent', color: T.sub, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !addr.trim()}
              style={{
                padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none',
                background: (saving || !addr.trim()) ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,#1A3FFF,#6B21FF)`,
                color: (saving || !addr.trim()) ? T.dim : '#fff', cursor: (saving || !addr.trim()) ? 'not-allowed' : 'pointer',
                boxShadow: (!saving && addr.trim()) ? '0 4px 14px rgba(26,63,255,0.4)' : 'none',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L4.5 8.5L10 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DepositAddresses({ rates }: { rates: RateDocument[] }) {
  const configured = rates.filter(r => r.depositAddress?.trim());
  const missing    = rates.filter(r => !r.depositAddress?.trim());

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,159,255,0.12)', border: '1px solid rgba(77,159,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="1.5" y="3" width="14" height="11" rx="2.5" stroke="#4D9FFF" strokeWidth="1.4"/><path d="M1.5 6.5H15.5" stroke="#4D9FFF" strokeWidth="1.4"/><circle cx="11.5" cy="10" r="1.5" fill="#4D9FFF"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Exchange Deposit Addresses</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
              Users send USDT here during buy verification & sell orders
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00E5A0' }}>
            {configured.length} configured
          </span>
          {missing.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 999, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
              {missing.length} missing
            </span>
          )}
        </div>
      </div>

      {/* Warning if any missing */}
      {missing.length > 0 && (
        <div style={{ padding: '12px 22px', background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid rgba(248,113,113,0.1)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><path d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5Z" stroke="#F87171" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7.5 6V8.5" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7.5" cy="10.5" r="0.75" fill="#F87171"/></svg>
          <p style={{ fontSize: 12, color: 'rgba(248,113,113,0.85)', margin: 0, lineHeight: 1.5 }}>
            <strong>Action required:</strong> {missing.map(r => r.network).join(', ')} {missing.length === 1 ? 'has' : 'have'} no deposit address set.
            Users on {missing.length === 1 ? 'this network' : 'these networks'} won't be able to complete wallet verification or sell orders until an address is configured.
          </p>
        </div>
      )}

      {/* Address rows */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rates.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '20px 0', margin: 0 }}>
            No rates configured. Add a rate above to set deposit addresses.
          </p>
        ) : (
          rates.map(r => <AddressRow key={r._id} rate={r} />)
        )}
      </div>
    </div>
  );
}
