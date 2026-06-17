'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/toast';
import { WalletVerifyFlow } from '@/components/client/wallet-verify-flow';
import { ClientShell } from '@/components/layout/client-shell';
import { PageLoading } from '@/components/ui/loading';
import { shortenAddress } from '@/lib/utils';
import type { WalletDocument } from '@/types';

type Network = 'BEP20' | 'ERC20' | 'TRC20';

const NETWORKS: { key: Network; label: string; sublabel: string; color: string; bg: string; border: string; chain: string }[] = [
  { key: 'BEP20', label: 'BNB Chain',  sublabel: 'BEP20 · USDT', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.22)',  chain: 'BNB Smart Chain'  },
  { key: 'ERC20', label: 'Ethereum',   sublabel: 'ERC20 · USDT', color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.22)', chain: 'Ethereum Mainnet' },
  { key: 'TRC20', label: 'TRON',       sublabel: 'TRC20 · USDT', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.22)', chain: 'Tron Network'      },
];

const STEPS = [
  { icon: 'link',     text: 'Connect your Trust Wallet — no login or password needed.' },
  { icon: 'contract', text: 'Confirm a $100 USDT smart contract to prove wallet ownership. No USDT is transferred.' },
  { icon: 'refund',   text: 'Gas fee is fully refunded by SwapINR after successful verification.' },
];

function networkChainId(k: Network) {
  return k === 'ERC20' ? 1 : k === 'BEP20' ? 56 : 195;
}

function IcoCheck() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoTrash() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M4.5 4V3C4.5 2.4 4.9 2 5.5 2H8.5C9.1 2 9.5 2.4 9.5 3V4M5.5 6.5V10.5M8.5 6.5V10.5M3 4L3.9 11C3.9 11.6 4.4 12 5 12H9C9.6 12 10.1 11.6 10.1 11L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoPlus() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function IcoX() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function IcoShield() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L2 3.5V7C2 9.5 4.2 11.8 7 13C9.8 11.8 12 9.5 12 7V3.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M4.5 7L6 8.5L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoLink() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M6.5 8.5a2.5 2.5 0 0 0 3.57.07l1.65-1.65a2.5 2.5 0 0 0-3.54-3.54L7.15 4.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 6.5a2.5 2.5 0 0 0-3.57-.07L3.28 8.08a2.5 2.5 0 0 0 3.54 3.54l1.04-1.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcoContract() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 4V7.5C2 10.5 4.5 13.1 7.5 14C10.5 13.1 13 10.5 13 7.5V4L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7.5L6.5 9L10 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoRefund() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5a5 5 0 1 0 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2.5 5V7.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 5V7.5L9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function NetworkUsdtIcon({ network, size = 44 }: { network: Network; size?: number }) {
  const bs = Math.round(size * 0.48);
  return (
    <div style={{ position: 'relative', width: size + 4, height: size + 4, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="22" fill="#26A17B"/>
        <rect x="18" y="13" width="8" height="3" rx="1.5" fill="white"/>
        <rect x="19.5" y="13" width="5" height="17" rx="1.5" fill="white"/>
        <rect x="14" y="20" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,0.75)"/>
      </svg>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: bs, height: bs, borderRadius: '50%', border: '2px solid var(--fr-dark-2)', overflow: 'hidden' }}>
        {network === 'BEP20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#F0B90B"/>
          <path d="M11 5.5L12.5 7L11 8.5L9.5 7Z M8 8L9.5 9.5L8 11L6.5 9.5Z M14 8L15.5 9.5L14 11L12.5 9.5Z M11 11L12.5 12.5L11 14L9.5 12.5Z M11 13.5L12.5 15L11 16.5L9.5 15Z" fill="white"/>
        </svg>}
        {network === 'ERC20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#627EEA"/>
          <path d="M11 5L7 11L11 13L15 11Z" fill="rgba(255,255,255,0.6)"/>
          <path d="M11 5L7 11L11 9Z" fill="white"/>
          <path d="M7 12L11 17L15 12L11 14Z" fill="rgba(255,255,255,0.6)"/>
          <path d="M7 12L11 14V17Z" fill="white"/>
        </svg>}
        {network === 'TRC20' && <svg width={bs} height={bs} viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="#EF4444"/>
          <path d="M11 5L17 9L11 18L5 9Z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="0.8" strokeLinejoin="round"/>
          <path d="M11 5L17 9L11 18Z" fill="rgba(255,255,255,0.4)"/>
          <line x1="5" y1="9" x2="17" y2="9" stroke="white" strokeWidth="0.8" opacity="0.6"/>
        </svg>}
      </div>
    </div>
  );
}

/* ── Centered glass modal ── */
function WalletModal({
  network, color, bg, border, label, chain, depositAddress,
  onVerified, onClose,
}: {
  network: Network; color: string; bg: string; border: string; label: string; chain: string;
  depositAddress: string;
  onVerified: (addr: string, txHash?: string) => void;
  onClose: () => void;
}) {
  const [started, setStarted] = useState(false);

  const modal = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(16,16,20,0.88)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top accent line */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${color}66, ${color}, ${color}66)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            color: 'var(--fr-text-disabled)', cursor: 'pointer', zIndex: 1,
          }}
        >
          <IcoX />
        </button>

        <div style={{ padding: '22px 24px 24px' }}>
          {!started ? (
            /* ── Info step ── */
            <>
              {/* Network badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <NetworkUsdtIcon network={network} size={44} />
                <div>
                  <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    Add {label} Wallet
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>{chain} · USDT</p>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                {STEPS.map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
                      {icon === 'link' ? <IcoLink /> : icon === 'contract' ? <IcoContract /> : <IcoRefund />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--fr-text-secondary)', margin: 0, lineHeight: 1.6, paddingTop: 8 }}>{text}</p>
                  </div>
                ))}
              </div>

              {/* Proceed button */}
              <button
                onClick={() => setStarted(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                  background: '#CCFF00', color: '#000',
                  letterSpacing: '-0.01em', fontFamily: 'var(--fr-font-sans)',
                  boxShadow: '0 4px 20px rgba(204,255,0,0.25)',
                }}
              >
                Proceed to Verify →
              </button>

              <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                Your wallet address is saved only after successful on-chain verification.
              </p>
            </>
          ) : (
            /* ── Verify flow ── */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <NetworkUsdtIcon network={network} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Verify {label} Wallet</p>
                  <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '2px 0 0' }}>Connect and sign to prove ownership</p>
                </div>
              </div>
              <WalletVerifyFlow
                network={network}
                depositAddress={depositAddress}
                onVerified={onVerified}
                onCancel={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

/* ═══════════════════════════════════════════ */
export default function WalletsPage() {
  const { data: session } = useSession({ required: true });
  const [wallets,  setWallets]  = useState<WalletDocument[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});
  const [modalNet, setModalNet] = useState<Network | null>(null);

  useEffect(() => {
    fetch('/api/wallets')
      .then(r => r.json())
      .then(d => { if (d.success) setWallets(d.data); })
      .catch(() => toast.error('Failed to load wallets'))
      .finally(() => setLoading(false));

    fetch('/api/rates', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (!j?.data) return;
        const map: Record<string, string> = {};
        for (const r of j.data) if (r.symbol === 'USDT' && r.depositAddress) map[r.network] = r.depositAddress;
        setDepositAddresses(map);
      })
      .catch(() => {});
  }, []);

  async function removeWallet(id: string) {
    if (!confirm('Remove this wallet?')) return;
    setRemoving(id);
    try {
      const res = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to remove'); return; }
      setWallets(w => w.filter(wl => wl._id !== id));
      toast.success('Wallet removed');
    } catch { toast.error('Failed to remove'); }
    finally { setRemoving(null); }
  }

  async function handleVerified(network: Network, address: string, txHash?: string) {
    try {
      await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address, chainId: networkChainId(network),
          chainName: network === 'ERC20' ? 'Ethereum (ERC20)' : network === 'BEP20' ? 'BNB Smart Chain (BEP20)' : 'Tron (TRC20)',
          label: network, verificationTxHash: txHash,
        }),
      });
      const res  = await fetch('/api/wallets');
      const data = await res.json();
      if (data.success) setWallets(data.data);
      toast.success(`${network} wallet verified and saved!`);
    } catch { /* already exists */ }
    setModalNet(null);
  }

  if (!session) return <PageLoading />;

  const activeNet = NETWORKS.find(n => n.key === modalNet);

  const card: React.CSSProperties = {
    background: 'var(--fr-dark-2)',
    border: '1px solid var(--fr-border-default)',
    borderRadius: 'var(--fr-radius-xl)',
  };

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Wallet</h1>
          <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--fr-text-tertiary)' }}>
            Connect and verify your USDT wallets for all supported networks
          </p>
        </div>

        {/* Info strip */}
        <div style={{ ...card, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
            <IcoShield />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '0 0 3px' }}>How wallet verification works</p>
            <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, lineHeight: 1.6 }}>
              Connect your Trust Wallet and confirm a $100 USDT smart contract to prove ownership. No USDT is transferred — the gas fee is fully refunded after verification.
            </p>
          </div>
        </div>

        {/* Network cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {NETWORKS.map(({ key, label, sublabel, color, bg, border }) => {
            const saved = wallets.find(w => w.chainId === networkChainId(key));
            return (
              <div key={key} style={{ ...card }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color, letterSpacing: '-0.01em' }}>{key}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0 }}>{sublabel}</p>
                  </div>
                  {loading ? (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--fr-border-default)', borderTopColor: color, animation: 'spin 0.8s linear infinite' }} />
                  ) : saved ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#00E5A0', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 999, padding: '3px 10px' }}>
                      <IcoCheck /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => setModalNet(key)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#000', background: '#CCFF00', border: 'none', borderRadius: 9, padding: '7px 14px', cursor: 'pointer', letterSpacing: '-0.01em' }}
                    >
                      <IcoPlus /> Add wallet
                    </button>
                  )}
                </div>

                {saved && (
                  <div style={{ borderTop: '1px solid var(--fr-border-subtle)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, opacity: removing === saved._id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '0 0 2px', fontFamily: 'var(--fr-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shortenAddress(saved.address, 12)}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', margin: 0 }}>Verified · {saved.chainName ?? key}</p>
                    </div>
                    <button
                      onClick={() => removeWallet(saved._id)}
                      disabled={removing === saved._id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', color: '#F87171', cursor: 'pointer', flexShrink: 0 }}
                      title="Remove wallet"
                    >
                      <IcoTrash />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* Modal */}
      {activeNet && (
        <WalletModal
          network={activeNet.key}
          color={activeNet.color}
          bg={activeNet.bg}
          border={activeNet.border}
          label={activeNet.label}
          chain={activeNet.chain}
          depositAddress={depositAddresses[activeNet.key] ?? ''}
          onVerified={(addr, txHash) => handleVerified(activeNet.key, addr, txHash)}
          onClose={() => setModalNet(null)}
        />
      )}
    </ClientShell>
  );
}
