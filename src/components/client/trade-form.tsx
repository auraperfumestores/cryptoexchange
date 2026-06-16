'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowsDownUp, Copy, Check, Info, Warning } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { WalletConnect } from '@/components/client/wallet-connect';
import { PaymentMethodTabs } from '@/components/client/payment-method-tabs';
import { formatINR, formatINRNumber, formatCrypto, getNetworkConfig, calculateFeeBreakdown } from '@/lib/utils';
import type { RateDocument, PaymentMethodDocument, WalletDocument, Network, CryptoSymbol } from '@/types';

interface TradeFormProps {
  type: 'buy' | 'sell';
  rates: RateDocument[];
  paymentMethods: PaymentMethodDocument[];
  wallets: WalletDocument[];
  defaultSymbol?: CryptoSymbol;
  defaultNetwork?: Network;
}

const SYMBOL_NETWORKS: Record<CryptoSymbol, Network[]> = {
  USDT: ['ERC20', 'BEP20', 'TRC20'],
  BNB: ['BEP20'],
};

export function TradeForm({ type, rates, paymentMethods, wallets, defaultSymbol = 'USDT', defaultNetwork = 'BEP20' }: TradeFormProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>(type);
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [inrAmount, setInrAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastEdited, setLastEdited] = useState<'crypto' | 'inr'>('crypto');

  // local form state
  const [symbol, setSymbol] = useState<CryptoSymbol>(defaultSymbol);
  const [network, setNetwork] = useState<Network>(defaultNetwork);
  const [walletAddress, setWalletAddress] = useState('');
  const [connectedChainId, setConnectedChainId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [clientNotes, setClientNotes] = useState('');

  // Find the active rate
  const rate = useMemo(() => {
    return rates.find((r) => r.symbol === symbol && r.network === network && r.isActive);
  }, [rates, symbol, network]);

  // Reset to valid network when symbol changes
  useEffect(() => {
    if (!SYMBOL_NETWORKS[symbol].includes(network)) {
      setNetwork(SYMBOL_NETWORKS[symbol][0]);
    }
  }, [symbol, network]);

  // Compute conversion
  useEffect(() => {
    if (!rate) return;
    const r = selectedTab === 'buy' ? rate.buyRate : rate.sellRate;
    if (lastEdited === 'crypto') {
      const c = parseFloat(cryptoAmount || '0');
      if (!Number.isNaN(c)) {
        setInrAmount((c * r).toFixed(2));
      }
    } else {
      const i = parseFloat(inrAmount || '0');
      if (!Number.isNaN(i)) {
        setCryptoAmount((i / r).toFixed(6));
      }
    }
  }, [cryptoAmount, inrAmount, lastEdited, rate, selectedTab]);

  const feeBreakdown = useMemo(() => {
    if (!rate) return null;
    const r = selectedTab === 'buy' ? rate.buyRate : rate.sellRate;
    const amt = parseFloat(cryptoAmount || '0');
    return calculateFeeBreakdown(amt, r, 0.5);
  }, [cryptoAmount, rate, selectedTab]);

  const symbolOptions = Object.keys(SYMBOL_NETWORKS).map((s) => ({ value: s, label: s }));
  const networkOptions = SYMBOL_NETWORKS[symbol].map((n) => ({
    value: n,
    label: getNetworkConfig(n).label,
  }));

  const expectedChainId = network === 'TRC20' ? null : getNetworkConfig(network).chainId;

  async function onSubmit() {
    if (!rate) {
      toast.error('No active rate for this crypto/network');
      return;
    }
    const c = parseFloat(cryptoAmount || '0');
    if (c <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!walletAddress) {
      toast.error('Connect or enter a wallet address');
      return;
    }
    if (selectedTab === 'buy' && !selectedPaymentMethodId) {
      toast.error('Select a payment method');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedTab,
          cryptoSymbol: symbol,
          network,
          cryptoAmount: c,
          walletAddress,
          paymentMethodId: selectedTab === 'buy' ? selectedPaymentMethodId : undefined,
          clientNotes: clientNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not create order');
        return;
      }
      toast.success(`Order ${data.data.orderId} created. Follow the next steps to settle.`);
      router.push(`/transactions/${data.data._id}`);
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'buy' | 'sell')}>
          <TabsList>
            <TabsTrigger value="sell">Sell crypto</TabsTrigger>
            <TabsTrigger value="buy">Buy crypto</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <Card padding="lg" className="rangoli-card">
              {/* Asset selectors */}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Crypto"
                  options={symbolOptions}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value as CryptoSymbol)}
                />
                <Select
                  label="Network"
                  options={networkOptions}
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as Network)}
                />
              </div>

              {/* Rate display */}
              {rate ? (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-50/60 border border-primary-100 px-4 py-2.5">
                  <div>
                    <p className="text-xs text-muted">
                      {selectedTab === 'buy' ? 'Buy rate' : 'Sell rate'}
                    </p>
                    <p className="font-mono-crypto text-lg font-bold text-primary">
                      {formatINR(selectedTab === 'buy' ? rate.buyRate : rate.sellRate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Opposite side</p>
                    <p className="font-mono-crypto text-sm text-secondary">
                      {formatINR(selectedTab === 'buy' ? rate.sellRate : rate.buyRate)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/30 px-4 py-2.5">
                  <Warning className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">No active rate set for this combination.</p>
                </div>
              )}

              {/* Amount inputs */}
              <div className="mt-4 space-y-3">
                <Input
                  label="You send"
                  placeholder="0.00"
                  value={cryptoAmount}
                  onChange={(e) => {
                    setCryptoAmount(e.target.value);
                    setLastEdited('crypto');
                  }}
                  mono
                  hint={`Max 6 decimals · ${symbol}`}
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => setLastEdited(lastEdited === 'crypto' ? 'inr' : 'crypto')}
                    className="rounded-full bg-mist p-1.5 text-muted hover:bg-primary-50 hover:text-primary transition-colors"
                    title="Toggle edit field"
                  >
                    <ArrowsDownUp className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  label={selectedTab === 'buy' ? 'You pay (INR)' : 'You receive (INR, before fees)'}
                  placeholder="0.00"
                  value={inrAmount}
                  onChange={(e) => {
                    setInrAmount(e.target.value);
                    setLastEdited('inr');
                  }}
                />
              </div>

              {/* Fee breakdown */}
              {feeBreakdown && parseFloat(cryptoAmount || '0') > 0 && (
                <div className="mt-4 rounded-lg bg-mist/40 border border-mist p-3 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted">Gross amount</span>
                    <span className="font-mono-crypto text-secondary">₹{formatINRNumber(feeBreakdown.grossINR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Platform fee (0.5%)</span>
                    <span className="font-mono-crypto text-error">− ₹{formatINRNumber(feeBreakdown.platformFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-mist pt-1.5 font-semibold">
                    <span className="text-secondary">You {selectedTab === 'buy' ? 'pay' : 'receive'}</span>
                    <span className="font-mono-crypto text-primary">
                      ₹{formatINRNumber(feeBreakdown.netINR)}
                    </span>
                  </div>
                </div>
              )}

              {/* Wallet section */}
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-semibold text-secondary">Your wallet</h4>
                {network === 'TRC20' ? (
                  <Input
                    label="Your TRC20 address"
                    placeholder="T..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    mono
                    hint="TRC20 is non-EVM — paste your address manually."
                  />
                ) : (
                  <WalletConnect
                    network={network}
                    expectedChainId={expectedChainId as number}
                    onConnected={(addr) => setWalletAddress(addr)}
                    showSaved
                    savedWallets={wallets.filter((w) => w.chainId === expectedChainId)}
                  />
                )}
              </div>

              {/* Buy: payment method */}
              {selectedTab === 'buy' && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold text-secondary">Payment method</h4>
                  <PaymentMethodTabs
                    methods={paymentMethods}
                    selectedId={selectedPaymentMethodId}
                    onSelect={setSelectedPaymentMethodId}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="mt-4">
                <Input
                  label="Notes (optional)"
                  placeholder="Any additional info for the admin"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={onSubmit}
                loading={submitting}
                disabled={!rate || !walletAddress}
                className="mt-6 w-full"
                size="lg"
              >
                {selectedTab === 'buy' ? 'Place buy order' : 'Place sell order'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right side: How it works / info */}
      <div className="space-y-4">
        <Card padding="md">
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-secondary">
              {selectedTab === 'buy' ? 'How buying works' : 'How selling works'}
            </h3>
          </div>
          {selectedTab === 'buy' ? (
            <ol className="space-y-2 text-sm text-muted">
              <li><span className="font-semibold text-secondary">1.</span> Place your order with the crypto amount you want.</li>
              <li><span className="font-semibold text-secondary">2.</span> Pay the INR amount via your selected method (UPI, bank, or cash).</li>
              <li><span className="font-semibold text-secondary">3.</span> Upload a payment screenshot for verification.</li>
              <li><span className="font-semibold text-secondary">4.</span> Admin confirms and sends the crypto to your wallet.</li>
            </ol>
          ) : (
            <ol className="space-y-2 text-sm text-muted">
              <li><span className="font-semibold text-secondary">1.</span> Place your sell order with the amount of crypto you want to sell.</li>
              <li><span className="font-semibold text-secondary">2.</span> Send the crypto to the exchange deposit address shown on the order page.</li>
              <li><span className="font-semibold text-secondary">3.</span> Paste the transaction hash so we can confirm receipt.</li>
              <li><span className="font-semibold text-secondary">4.</span> Admin releases the INR to your chosen method.</li>
            </ol>
          )}
        </Card>

        <Card padding="md">
          <h3 className="mb-2 text-sm font-semibold text-secondary">Today's limits</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Min order</span>
              <span className="font-mono-crypto text-secondary">10 USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Max single order</span>
              <span className="font-mono-crypto text-secondary">₹5,00,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Platform fee</span>
              <span className="font-mono-crypto text-secondary">0.5%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}