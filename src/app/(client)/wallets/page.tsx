'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/components/ui/toast';
import { WalletConnect } from '@/components/client/wallet-connect';
import { PageLoading } from '@/components/ui/loading';
import { shortenAddress, getNetworkLabel } from '@/lib/utils';
import { Trash, Wallet as WalletIcon } from '@phosphor-icons/react';
import type { WalletDocument } from '@/types';

export default function WalletsPage() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wallets')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWallets(data.data);
      })
      .catch(() => toast.error('Failed to load wallets'))
      .finally(() => setLoading(false));
  }, []);

  async function removeWallet(id: string) {
    if (!confirm('Disconnect this wallet?')) return;
    try {
      const res = await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Failed to disconnect');
        return;
      }
      setWallets((w) => w.filter((wl) => wl._id !== id));
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
  }

  if (!session) return <PageLoading />;
  const user = session.user as any;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-secondary">My wallets</h1>

      <WalletConnect
        onConnected={async (address, chainId) => {
          // Auto-save wallet
          try {
            await fetch('/api/wallets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address,
                chainId,
                chainName: getNetworkLabel(chainId === 1 ? 'ERC20' : 'BEP20'),
              }),
            });
            // Refresh wallet list
            const res = await fetch('/api/wallets');
            const data = await res.json();
            if (data.success) setWallets(data.data);
            toast.success('Wallet saved');
          } catch {
            // Wallet may already exist
          }
        }}
        showSaved={false}
      />

      {loading ? (
        <div className="mt-6">
          <PageLoading />
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<WalletIcon className="h-16 w-16" />}
          title="No saved wallets"
          description="Connect a wallet above and it will be saved to your account."
        />
      ) : (
        <div className="mt-6 space-y-3">
          {wallets.map((w) => (
            <Card key={w._id} padding="md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary font-bold text-sm">
                    {w.chainId === 1 ? 'ETH' : 'BSC'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-secondary">{w.label || 'Wallet'}</p>
                    <p className="font-mono-crypto text-xs text-muted truncate">{shortenAddress(w.address, 8)}</p>
                    <p className="text-xs text-muted">{w.chainName}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeWallet(w._id)}>
                  <Trash className="h-4 w-4 text-error" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}