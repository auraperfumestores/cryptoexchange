'use client';

import { useState, useEffect } from 'react';
import { useDetectedWallets, connectInjected, switchOrAddChain } from '@/lib/web3/use-detected-wallets';
import { useAccount, useDisconnect, useChainId, useBalance, useSwitchChain } from 'wagmi';
import { getNetworkConfig, addressExplorerUrl, shortenAddress, formatCrypto } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import type { Network, WalletDocument } from '@/types';

interface WalletConnectProps {
  expectedChainId?: number;
  network?: Network;
  onConnected?: (address: string, chainId: number) => void;
  showSaved?: boolean;
  savedWallets?: WalletDocument[];
  onSavedSelect?: (wallet: WalletDocument) => void;
  onSavedRemove?: (id: string) => void;
}

function IcoWallet({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 7C3 5.9 3.9 5 5 5H17C18.1 5 19 5.9 19 7V15C19 16.1 18.1 17 17 17H5C3.9 17 3 16.1 3 15V7Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M15 11C15 11.83 15.67 12.5 16.5 12.5H19V9.5H16.5C15.67 9.5 15 10.17 15 11Z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="16.5" cy="11" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function IcoCopy({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 15 15" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 10V3C3 2.4 3.4 2 4 2H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IcoCheck({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 15 15" fill="none"><path d="M3 7.5L6 10.5L12 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoExternal({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 15 15" fill="none"><path d="M9 2H13V6M13 2L7 8M6 3H3C2.4 3 2 3.4 2 4V12C2 12.6 2.4 13 3 13H11C11.6 13 12 12.6 12 12V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoDisconnect({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 15 15" fill="none"><path d="M5.5 2H3C2.4 2 2 2.4 2 3V12C2 12.6 2.4 13 3 13H5.5M10 10.5L13 7.5L10 4.5M5.5 7.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoAlert({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r="0.6" fill="currentColor"/></svg>;
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 34, height: 34, borderRadius: 9, cursor: 'pointer',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-default)',
  color: 'var(--fr-text-tertiary)', transition: 'all 0.14s',
  WebkitTapHighlightColor: 'transparent',
};

export function WalletConnect({
  expectedChainId,
  network,
  onConnected,
  showSaved = true,
  savedWallets = [],
  onSavedSelect,
  onSavedRemove,
}: WalletConnectProps) {
  const detected    = useDetectedWallets();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId     = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const [copied,      setCopied]      = useState(false);
  const [connecting,  setConnecting]  = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    setWrongNetwork(isConnected && !!expectedChainId && chainId !== expectedChainId);
  }, [isConnected, chainId, expectedChainId]);

  useEffect(() => {
    if (isConnected && address && onConnected) onConnected(address, chainId);
  }, [isConnected, address, chainId, onConnected]);

  async function handleConnect() {
    try {
      setConnecting(true);
      const { address, chainId } = await connectInjected();
      if (expectedChainId && chainId !== expectedChainId) {
        try { await switchOrAddChain(expectedChainId); }
        catch { toast.warning(`Connected — please switch to ${getNetworkConfig(network || 'BEP20').label}.`); }
      }
      toast.success('Wallet connected');
      onConnected?.(address, chainId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }

  async function handleSwitchNetwork() {
    if (!expectedChainId) return;
    try {
      if (switchChain) switchChain({ chainId: expectedChainId as 1 | 56 });
      else await switchOrAddChain(expectedChainId);
    } catch { toast.error('Failed to switch network'); }
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const card: React.CSSProperties = {
    background: 'var(--fr-dark-2)',
    border: '1px solid var(--fr-border-default)',
    borderRadius: 'var(--fr-radius-xl)',
  };

  /* ── Connected state ── */
  if (isConnected && address) {
    return (
      <div style={{ ...card, border: '1px solid rgba(204,255,0,0.18)', background: 'rgba(204,255,0,0.03)' }}>
        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Icon */}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(204,255,0,0.10)', border: '1px solid rgba(204,255,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCFF00', flexShrink: 0 }}>
            <IcoWallet size={20} />
          </div>
          {/* Address + balance */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.10)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 999, padding: '2px 9px', letterSpacing: '0.04em' }}>
                CONNECTED
              </span>
              {network && (
                <span style={{ fontSize: 11, fontWeight: 700, color: wrongNetwork ? '#FBBF24' : 'var(--fr-text-secondary)', background: wrongNetwork ? 'rgba(251,191,36,0.10)' : 'rgba(255,255,255,0.05)', border: `1px solid ${wrongNetwork ? 'rgba(251,191,36,0.3)' : 'var(--fr-border-default)'}`, borderRadius: 999, padding: '2px 9px' }}>
                  {getNetworkConfig(network).label}
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '5px 0 2px', fontFamily: 'var(--fr-font-mono)', letterSpacing: '0.02em' }}>
              {shortenAddress(address, 8)}
            </p>
            {balance && (
              <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', margin: 0, fontFamily: 'var(--fr-font-mono)' }}>
                {formatCrypto(parseFloat(balance.formatted), balance.symbol)} {balance.symbol}
              </p>
            )}
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={handleCopy} style={{ ...iconBtn, color: copied ? '#CCFF00' : 'var(--fr-text-tertiary)' }} title="Copy address">
              {copied ? <IcoCheck /> : <IcoCopy />}
            </button>
            <a href={addressExplorerUrl(network || 'BEP20', address)} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn, textDecoration: 'none' }} title="View on explorer">
              <IcoExternal />
            </a>
            <button onClick={() => disconnect()} style={{ ...iconBtn, color: '#F87171', borderColor: 'rgba(248,113,113,0.2)' }} title="Disconnect">
              <IcoDisconnect />
            </button>
          </div>
        </div>

        {/* Wrong network warning */}
        {wrongNetwork && expectedChainId && (
          <div style={{ margin: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FBBF24' }}>
              <IcoAlert />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FBBF24' }}>
                Wrong network — switch to {getNetworkConfig(network || 'BEP20').label}
              </span>
            </div>
            <button onClick={handleSwitchNetwork} style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Switch network
            </button>
          </div>
        )}

        {/* Saved wallets list (when used in exchange flow) */}
        {showSaved && savedWallets.length > 0 && (
          <div style={{ borderTop: '1px solid var(--fr-border-subtle)', padding: '12px 20px 16px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Saved wallets</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {savedWallets.map((w) => (
                <div key={w._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--fr-border-subtle)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-text-primary)', margin: 0 }}>{w.label || 'Wallet'}</p>
                    <p style={{ fontSize: 11, color: 'var(--fr-text-disabled)', margin: '2px 0 0', fontFamily: 'var(--fr-font-mono)' }}>{shortenAddress(w.address, 6)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {onSavedSelect && (
                      <button onClick={() => onSavedSelect(w)} style={{ ...iconBtn, width: 30, height: 30 }} title="Use this wallet">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5H11M8 3.5L11 6.5L8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    )}
                    {onSavedRemove && (
                      <button onClick={() => onSavedRemove(w._id)} style={{ ...iconBtn, width: 30, height: 30, color: '#F87171', borderColor: 'rgba(248,113,113,0.15)' }} title="Remove">
                        <IcoDisconnect size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Disconnected state ── */
  return (
    <div style={{ ...card, padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#CCFF00' }}>
        <IcoWallet size={24} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 7px', letterSpacing: '-0.02em' }}>
        Connect your wallet
      </h3>
      <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: '0 0 24px', lineHeight: 1.6, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
        {detected.length > 0
          ? `Detected: ${detected.map((w) => w.name).join(', ')}`
          : 'No wallet detected. Install MetaMask, Trust Wallet, or another EIP-1193 wallet.'}
      </p>
      <button
        onClick={handleConnect}
        disabled={connecting || detected.length === 0}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '13px 32px', borderRadius: 12,
          background: detected.length === 0 ? 'rgba(255,255,255,0.06)' : '#CCFF00',
          color: detected.length === 0 ? 'var(--fr-text-disabled)' : '#000',
          fontSize: 14, fontWeight: 800, border: 'none', cursor: detected.length === 0 ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em', transition: 'opacity 0.14s', opacity: connecting ? 0.7 : 1,
          fontFamily: 'var(--fr-font-sans)',
        }}
      >
        <IcoWallet size={16} />
        {connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
    </div>
  );
}
