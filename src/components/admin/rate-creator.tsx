'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Plus } from 'lucide-react';
import type { Network, CryptoSymbol, SpreadType } from '@/types';

export function RateCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState<CryptoSymbol>('USDT');
  const [network, setNetwork] = useState<Network>('BEP20');
  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');
  const [spread, setSpread] = useState('0.5');
  const [spreadType, setSpreadType] = useState<SpreadType>('percentage');
  const [depositAddress, setDepositAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const networks: Network[] = symbol === 'USDT' ? ['ERC20', 'BEP20', 'TRC20'] : ['BEP20'];

  async function submit() {
    if (!buyRate || !sellRate || !depositAddress) {
      toast.error('Fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          network,
          buyRate: parseFloat(buyRate),
          sellRate: parseFloat(sellRate),
          spread: parseFloat(spread),
          spreadType,
          depositAddress,
          useCoinGecko: false,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Create failed');
        return;
      }
      toast.success('Rate created');
      setOpen(false);
      setBuyRate('');
      setSellRate('');
      setDepositAddress('');
      router.refresh();
    } catch {
      toast.error('Create failed');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add rate
      </Button>
    );
  }

  return (
    <Card padding="md">
      <h3 className="text-base font-semibold text-secondary mb-3">New rate</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Crypto"
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value as CryptoSymbol);
            if (e.target.value === 'BNB') setNetwork('BEP20');
          }}
          options={[
            { value: 'USDT', label: 'USDT' },
            { value: 'BNB', label: 'BNB' },
          ]}
        />
        <Select
          label="Network"
          value={network}
          onChange={(e) => setNetwork(e.target.value as Network)}
          options={networks.map((n) => ({ value: n, label: n }))}
        />
        <Input label="Buy rate (₹)" value={buyRate} onChange={(e) => setBuyRate(e.target.value)} type="number" step="0.01" mono />
        <Input label="Sell rate (₹)" value={sellRate} onChange={(e) => setSellRate(e.target.value)} type="number" step="0.01" mono />
        <Input label="Spread" value={spread} onChange={(e) => setSpread(e.target.value)} type="number" step="0.1" mono />
        <Select
          label="Spread type"
          value={spreadType}
          onChange={(e) => setSpreadType(e.target.value as SpreadType)}
          options={[
            { value: 'percentage', label: 'Percentage (%)' },
            { value: 'fixed', label: 'Fixed (₹)' },
          ]}
        />
        <div className="sm:col-span-2">
          <Input label="Deposit address" value={depositAddress} onChange={(e) => setDepositAddress(e.target.value)} mono />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={submit} loading={saving}>Create rate</Button>
      </div>
    </Card>
  );
}