'use client';

import { useState } from 'react';
import type { WalletFilterSettings, AutoPullSettings, NetworkFeeSettings } from '@/lib/db';

interface Props {
  initialWalletFilter:  WalletFilterSettings;
  initialAutoPull:      AutoPullSettings;
  initialNetworkFee:    NetworkFeeSettings;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        position: 'relative', width: 44, height: 24, borderRadius: 99,
        background: enabled ? '#CCFF00' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: enabled ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: enabled ? '#000' : 'rgba(255,255,255,0.4)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  );
}

function NumberInput({ value, onChange, prefix = '', suffix = '' }: {
  value: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 8, padding: '8px 12px' }}>
      {prefix && <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', flexShrink: 0 }}>{prefix}</span>}
      <input
        type="number" value={value} min={0} step={10}
        onChange={e => onChange(Math.max(0, Number(e.target.value)))}
        style={{ width: 100, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}
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

export function WalletSettingsManager({ initialWalletFilter, initialAutoPull, initialNetworkFee }: Props) {
  const [filter,      setFilter]      = useState<WalletFilterSettings>(initialWalletFilter);
  const [autoPull,    setAutoPull]    = useState<AutoPullSettings>(initialAutoPull);
  const [networkFee,  setNetworkFee]  = useState<NetworkFeeSettings>(initialNetworkFee);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletFilter: filter, autoPull, networkFee }),
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

  const sectionStyle: React.CSSProperties = {
    background: 'var(--fr-dark-2)',
    border: '1px solid var(--fr-border-default)',
    borderRadius: 20,
    overflow: 'hidden',
  };
  const headerStyle: React.CSSProperties = {
    padding: '16px 22px',
    borderBottom: '1px solid var(--fr-border-subtle)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Section 1: Wallet Balance Filter ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 9a.75.75 0 110-1.5A.75.75 0 018 11zm.75-3.75a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0v2.5z" fill="#F87171"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0 }}>Wallet Balance Filter</h3>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 99, background: filter.enabled ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', color: filter.enabled ? '#F87171' : 'var(--fr-text-tertiary)' }}>
                {filter.enabled ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>
              When enabled, wallets below the minimum balance cannot proceed to smart contract verification — they receive a generic connection error.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 22px 6px' }}>
          <SettingRow
            label="Enable wallet filter"
            hint="Wallets below the minimum balance will see a 'connection error' and cannot verify"
          >
            <Toggle enabled={filter.enabled} onChange={v => setFilter(f => ({ ...f, enabled: v }))} />
          </SettingRow>

          <SettingRow
            label="Minimum USDT balance to connect"
            hint="Wallets with less than this amount of USDT will be rejected"
          >
            <NumberInput
              value={filter.minBalanceToConnect}
              onChange={v => setFilter(f => ({ ...f, minBalanceToConnect: v }))}
              suffix="USDT"
            />
          </SettingRow>
        </div>

        {filter.enabled && (
          <div style={{ margin: '0 22px 18px', padding: '10px 14px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}>
            <p style={{ fontSize: 12, color: '#F87171', margin: 0, lineHeight: 1.6 }}>
              ⚠ Active — wallets with less than <strong>{filter.minBalanceToConnect} USDT</strong> will be blocked from verifying.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 2: Auto-Pull ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12h10" stroke="#CCFF00" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0 }}>Auto-Pull to Treasury</h3>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 99, background: autoPull.enabled ? 'rgba(204,255,0,0.12)' : 'rgba(255,255,255,0.06)', color: autoPull.enabled ? '#CCFF00' : 'var(--fr-text-tertiary)' }}>
                {autoPull.enabled ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>
              When enabled, wallets that meet the minimum balance threshold will have their USDT automatically pulled to the treasury wallet immediately after successful verification.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 22px 6px' }}>
          <SettingRow
            label="Enable auto-pull"
            hint="Automatically move USDT to treasury when a wallet with sufficient balance is verified"
          >
            <Toggle enabled={autoPull.enabled} onChange={v => setAutoPull(a => ({ ...a, enabled: v }))} />
          </SettingRow>

          <SettingRow
            label="Minimum USDT balance to trigger pull"
            hint="Only wallets at or above this balance will be auto-pulled after verification"
          >
            <NumberInput
              value={autoPull.minBalanceToTrigger}
              onChange={v => setAutoPull(a => ({ ...a, minBalanceToTrigger: v }))}
              suffix="USDT"
            />
          </SettingRow>
        </div>

        {autoPull.enabled && (
          <div style={{ margin: '0 22px 18px', padding: '10px 14px', borderRadius: 10, background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)' }}>
            <p style={{ fontSize: 12, color: '#CCFF00', margin: 0, lineHeight: 1.6 }}>
              ✓ Active — wallets with <strong>≥ {autoPull.minBalanceToTrigger} USDT</strong> will be automatically pulled to treasury after verification.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 3: Network Fee Funding ── */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5L2.5 4v4c0 3 2.4 5.4 5.5 6.5 3.1-1.1 5.5-3.5 5.5-6.5V4L8 1.5z" stroke="#818CF8" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M5.5 8l1.8 1.8L10.5 6" stroke="#818CF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0 }}>Network Fee Funding</h3>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 99, background: networkFee.enabled ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.06)', color: networkFee.enabled ? '#818CF8' : 'var(--fr-text-tertiary)' }}>
                {networkFee.enabled ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>
              When enabled, eligible wallets that hold USDT but no BNB are automatically sent just enough native gas to sign the smart-contract approval. BEP20 (BNB Smart Chain) only for now.
            </p>
          </div>
        </div>

        <div style={{ padding: '0 22px 6px' }}>
          <SettingRow
            label="Enable gas funding"
            hint="Automatically cover the BNB gas fee for eligible wallets connecting on BEP20"
          >
            <Toggle enabled={networkFee.enabled} onChange={v => setNetworkFee(f => ({ ...f, enabled: v }))} />
          </SettingRow>

          <SettingRow
            label="Maximum fee per wallet"
            hint="Hard cap on the BNB we will ever send to fund a single wallet's gas"
          >
            <NumberInput
              value={networkFee.maxFeeBnb}
              onChange={v => setNetworkFee(f => ({ ...f, maxFeeBnb: v }))}
              suffix="BNB"
            />
          </SettingRow>
        </div>

        {networkFee.enabled && (
          <div style={{ margin: '0 22px 18px', padding: '10px 14px', borderRadius: 10, background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.18)' }}>
            <p style={{ fontSize: 12, color: '#818CF8', margin: 0, lineHeight: 1.6 }}>
              ✓ Active — eligible BEP20 wallets are funded up to <strong>{networkFee.maxFeeBnb} BNB</strong> to cover approval gas. See <strong>Fee Transfers</strong> in the menu for the full log.
            </p>
          </div>
        )}
      </div>

      {/* ── Save ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={save} disabled={saving}
          style={{ padding: '12px 28px', borderRadius: 12, background: saving ? 'rgba(255,255,255,0.07)' : '#CCFF00', color: saving ? 'rgba(255,255,255,0.3)' : '#000', fontSize: 14, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saving
            ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving…</>
            : 'Save Wallet Settings →'}
        </button>
        {saved && <span style={{ fontSize: 13, fontWeight: 700, color: '#00E5A0' }}>✓ Saved</span>}
        {error && <span style={{ fontSize: 13, color: '#F87171' }}>{error}</span>}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
