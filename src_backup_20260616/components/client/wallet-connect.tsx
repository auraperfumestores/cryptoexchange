'use client';

import { useState, useEffect } from 'react';
import { Wallet, Copy, Check, LogOut, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { useDetectedWallets, connectInjected, switchOrAddChain } from '@/lib/web3/use-detected-wallets';
import { useAccount, useDisconnect, useChainId, useBalance, useSwitchChain } from 'wagmi';
import { getNetworkConfig, addressExplorerUrl, shortenAddress, formatCrypto } from '@/lib/utils';
import type { Network, CryptoSymbol, WalletDocument } from '@/types';

interface WalletConnectProps {
  expectedChainId?: number;
  network?: Network;
  onConnected?: (address: string, chainId: number) => void;
  showSaved?: boolean;
  savedWallets?: WalletDocument[];
  onSavedSelect?: (wallet: WalletDocument) => void;
  onSavedRemove?: (id: string) => void;
}

export function WalletConnect({
  expectedChainId,
  network,
  onConnected,
  showSaved = true,
  savedWallets = [],
  onSavedSelect,
  onSavedRemove,
}: WalletConnectProps) {
  const detected = useDetectedWallets();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  // Detect wrong network
  useEffect(() => {
    if (isConnected && expectedChainId) {
      setWrongNetwork(chainId !== expectedChainId);
    } else {
      setWrongNetwork(false);
    }
  }, [isConnected, chainId, expectedChainId]);

  // Notify parent when connection state changes
  useEffect(() => {
    if (isConnected && address && onConnected) {
      onConnected(address, chainId);
    }
  }, [isConnected, address, chainId, onConnected]);

  async function handleConnect() {
    try {
      setConnecting(true);
      const { address, chainId } = await connectInjected();
      if (expectedChainId && chainId !== expectedChainId) {
        try {
          await switchOrAddChain(expectedChainId);
        } catch {
          toast.warning(`Connected, but you are on the wrong network. Please switch to ${
            getNetworkConfig(network || 'BEP20').label
          }.`);
        }
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
      if (switchChain) {
        switchChain({ chainId: expectedChainId as 1 | 56 });
      } else {
        await switchOrAddChain(expectedChainId);
      }
    } catch (err: any) {
      toast.error('Failed to switch network');
    }
  }

  function handleCopy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isConnected && address) {
    return (
      <Card padding="md" className="border-primary/30 bg-primary-50/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Connected</p>
              <p className="font-mono-crypto text-sm font-semibold text-secondary truncate">
                {shortenAddress(address, 6)}
              </p>
              {balance && (
                <p className="text-xs text-muted font-mono-crypto">
                  {formatCrypto(parseFloat(balance.formatted), balance.symbol)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {network && (
              <Badge variant={wrongNetwork ? 'warning' : 'success'} size="sm">
                {getNetworkConfig(network).label}
              </Badge>
            )}
            <button
              onClick={handleCopy}
              className="rounded-lg p-2 text-muted hover:bg-cloud hover:text-secondary transition-colors"
              title="Copy address"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
            <a
              href={addressExplorerUrl(network || 'BEP20', address)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-muted hover:bg-cloud hover:text-secondary transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={() => disconnect()}
              className="rounded-lg p-2 text-muted hover:bg-cloud hover:text-error transition-colors"
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {wrongNetwork && expectedChainId && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
            <p className="text-xs text-amber-800">
              You're on the wrong network. Switch to {getNetworkConfig(network || 'BEP20').label} for this trade.
            </p>
            <Button size="sm" variant="secondary" onClick={handleSwitchNetwork}>
              Switch network
            </Button>
          </div>
        )}

        {showSaved && savedWallets.length > 0 && (
          <div className="mt-4 border-t border-mist pt-3">
            <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wide">Saved wallets</p>
            <div className="space-y-1">
              {savedWallets.map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-cloud transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-secondary">{w.label}</p>
                    <p className="font-mono-crypto text-xs text-muted truncate">{shortenAddress(w.address, 6)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {onSavedSelect && (
                      <button
                        onClick={() => onSavedSelect(w)}
                        className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-primary transition-colors"
                        title="Use this wallet"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    {onSavedRemove && (
                      <button
                        onClick={() => onSavedRemove(w._id)}
                        className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-error transition-colors"
                        title="Remove"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card padding="lg" className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <Wallet className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-secondary">Connect your wallet</h3>
      <p className="mt-1 text-sm text-muted">
        {detected.length > 0
          ? `Detected: ${detected.map((w) => w.name).join(', ')}`
          : 'No wallet detected. Install MetaMask, Trust, or another EIP-1193 wallet.'}
      </p>
      <Button
        onClick={handleConnect}
        loading={connecting}
        disabled={detected.length === 0}
        className="mt-4 w-full"
        size="lg"
      >
        <Wallet className="h-4 w-4" />
        {connecting ? 'Connecting…' : 'Connect wallet'}
      </Button>
    </Card>
  );
}