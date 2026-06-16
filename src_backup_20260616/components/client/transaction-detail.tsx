'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, ExternalLink, Upload, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { QRDisplay } from '@/components/shared/qr-code';
import { PaymentMethodTabs } from '@/components/client/payment-method-tabs';
import {
  formatINR,
  formatINRNumber,
  formatCrypto,
  formatDateTime,
  shortenAddress,
  shortenTxHash,
  getNetworkConfig,
  txExplorerUrl,
  addressExplorerUrl,
} from '@/lib/utils';
import type { TransactionDocument, PaymentMethodDocument, UserRole } from '@/types';

interface TransactionDetailProps {
  tx: TransactionDocument;
  paymentMethod?: PaymentMethodDocument;
  currentUserRole: UserRole;
  isOwner: boolean;
}

export function TransactionDetail({ tx, paymentMethod, currentUserRole, isOwner }: TransactionDetailProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [txHash, setTxHash] = useState(tx.txHash || '');
  const [proofUrl, setProofUrl] = useState(tx.paymentProofUrl || '');
  const [notes, setNotes] = useState(tx.clientNotes || '');
  const [adminNotes, setAdminNotes] = useState(tx.adminNotes || '');
  const [uploading, setUploading] = useState(false);
  const [acting, setActing] = useState(false);

  const isSell = tx.type === 'sell';
  const canSubmitHash = isOwner && isSell && (tx.status === 'awaiting_crypto' || tx.status === 'awaiting_payment');
  const canSubmitProof = isOwner && !isSell && (tx.status === 'awaiting_payment' || tx.status === 'confirming');

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied');
  }

  async function submitTxHash() {
    if (!txHash.match(/^(0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64})$/)) {
      toast.error('Enter a valid transaction hash');
      return;
    }
    setActing(true);
    try {
      const res = await fetch(`/api/transactions/${tx._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_tx_hash', txHash }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit');
        return;
      }
      toast.success('Transaction hash submitted');
      router.refresh();
    } catch {
      toast.error('Submission failed');
    } finally {
      setActing(false);
    }
  }

  async function submitProof() {
    if (!proofUrl) {
      toast.error('Upload a payment screenshot first');
      return;
    }
    setActing(true);
    try {
      const res = await fetch(`/api/transactions/${tx._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_payment_proof', paymentProofUrl: proofUrl, clientNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit');
        return;
      }
      toast.success('Proof submitted. Admin will review shortly.');
      router.refresh();
    } catch {
      toast.error('Submission failed');
    } finally {
      setActing(false);
    }
  }

  async function updateStatus(status: string) {
    setActing(true);
    try {
      const res = await fetch(`/api/transactions/${tx._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed');
        return;
      }
      toast.success(`Status updated to ${status}`);
      router.refresh();
    } catch {
      toast.error('Update failed');
    } finally {
      setActing(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File is too large (max 4MB)');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }
      setProofUrl(data.data.url);
      toast.success('Screenshot uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {/* Status banner */}
        <Card padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Order ID</p>
            <p className="font-mono-crypto text-lg font-bold text-secondary">{tx.orderId}</p>
          </div>
          <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'cancelled' || tx.status === 'disputed' ? 'error' : tx.status === 'confirming' ? 'primary' : 'warning'} size="md">
            {tx.status.replace(/_/g, ' ')}
          </Badge>
        </Card>

        {/* Action area depending on type and status */}
        {canSubmitHash && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-secondary mb-2">Send crypto to the deposit address</h3>
            <p className="text-sm text-muted mb-4">
              Send exactly <span className="font-mono-crypto font-semibold text-primary">{formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)}</span> to the address below, then paste the transaction hash.
            </p>
            <div className="flex flex-col items-center gap-4 rounded-xl bg-mist/30 p-6">
              <QRDisplay value={tx.depositAddress} size={200} label="Deposit address" />
              <div className="w-full space-y-3">
                <div>
                  <p className="text-xs text-muted mb-1">Deposit address</p>
                  <div className="flex items-center gap-2 rounded-lg bg-cloud border border-mist p-3">
                    <span className="font-mono-crypto text-sm text-secondary truncate flex-1">{tx.depositAddress}</span>
                    <button onClick={() => copy(tx.depositAddress, 'addr')} className="text-muted hover:text-primary">
                      {copied === 'addr' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a href={addressExplorerUrl(tx.network, tx.depositAddress)} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <Input
                  label="Transaction hash"
                  placeholder="0x... or alphanumeric"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  mono
                />
                <Button onClick={submitTxHash} loading={acting} disabled={!txHash} className="w-full">
                  Submit transaction hash
                </Button>
              </div>
            </div>
          </Card>
        )}

        {canSubmitProof && (
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-secondary mb-2">Upload payment proof</h3>
            <p className="text-sm text-muted mb-4">
              Pay <span className="font-mono-crypto font-semibold text-primary">{formatINR(tx.inrAmount)}</span> using the selected method, then upload a screenshot.
            </p>
            {paymentMethod && (
              <div className="mb-4">
                <PaymentMethodTabs methods={[paymentMethod]} selectedId={paymentMethod._id} onSelect={() => {}} />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-secondary">Payment screenshot</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="flex-1 cursor-pointer rounded-lg border border-dashed border-mist bg-mist/30 px-4 py-6 text-center text-sm text-muted hover:border-primary hover:bg-primary-50/30 transition-colors"
                  >
                    <Upload className="mx-auto mb-1 h-5 w-5" />
                    {uploading ? 'Uploading…' : proofUrl ? 'Replace screenshot' : 'Click to upload screenshot'}
                  </label>
                </div>
                {proofUrl && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    <Check className="h-3.5 w-3.5" />
                    <span className="truncate">{proofUrl}</span>
                  </div>
                )}
              </div>
              <Textarea
                label="Notes (optional)"
                placeholder="UTR, transaction reference, or any other info"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
              <Button onClick={submitProof} loading={acting} disabled={!proofUrl} className="w-full">
                Submit payment proof
              </Button>
            </div>
          </Card>
        )}

        {/* Awaiting confirmation */}
        {tx.status === 'awaiting_payment' && isSell && tx.txHash && (
          <Card padding="md" className="flex items-center gap-3 bg-amber-50/50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Awaiting admin confirmation</p>
              <p className="text-xs text-amber-700">Your transaction hash is in. Admin will release the INR once the deposit is confirmed.</p>
            </div>
          </Card>
        )}

        {/* Admin actions */}
        {currentUserRole === 'admin' && tx.status !== 'completed' && tx.status !== 'cancelled' && (
          <Card padding="md">
            <h3 className="text-sm font-semibold text-secondary mb-3">Admin actions</h3>
            <Textarea
              label="Admin notes (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {tx.status === 'awaiting_crypto' && (
                <Button size="sm" variant="secondary" onClick={() => updateStatus('confirming')} loading={acting}>
                  Mark as confirming
                </Button>
              )}
              {tx.status === 'awaiting_payment' && (
                <Button size="sm" variant="secondary" onClick={() => updateStatus('confirming')} loading={acting}>
                  Mark as confirming
                </Button>
              )}
              {tx.status === 'confirming' && (
                <Button size="sm" variant="primary" onClick={() => updateStatus('completed')} loading={acting}>
                  <Check className="h-4 w-4" /> Mark as completed
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => updateStatus('cancelled')} loading={acting}>
                Cancel
              </Button>
              <Button size="sm" variant="ghost" onClick={() => updateStatus('disputed')} loading={acting}>
                Mark as disputed
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Right column: order details */}
      <div className="space-y-4">
        <Card padding="md">
          <h3 className="text-sm font-semibold text-secondary mb-3">Order details</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Type" value={tx.type === 'buy' ? 'Buy crypto' : 'Sell crypto'} />
            <Row label="Crypto" value={`${tx.cryptoSymbol} · ${getNetworkConfig(tx.network).label}`} />
            <Row label="Amount" value={formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)} mono />
            <Row label="Rate" value={formatINR(tx.rate)} mono />
            <Row label="Gross INR" value={formatINR(tx.inrAmount)} mono />
            <Row label="Fee" value={formatINR(tx.fee)} mono />
            <div className="border-t border-mist pt-2">
              <Row
                label={tx.type === 'buy' ? 'You pay' : 'You receive'}
                value={formatINR(tx.type === 'buy' ? tx.inrAmount : tx.inrAmount - tx.fee)}
                mono
                highlight
              />
            </div>
          </dl>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-secondary mb-3">Parties</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted">Your wallet</p>
              <a
                href={addressExplorerUrl(tx.network, tx.walletAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-crypto text-sm text-secondary hover:text-primary inline-flex items-center gap-1"
              >
                {shortenAddress(tx.walletAddress, 6)} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {tx.txHash && (
              <div>
                <p className="text-xs text-muted">Transaction</p>
                <a
                  href={txExplorerUrl(tx.network, tx.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-crypto text-sm text-secondary hover:text-primary inline-flex items-center gap-1"
                >
                  {shortenTxHash(tx.txHash, 6)} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {tx.paymentProofUrl && (
              <div>
                <p className="text-xs text-muted">Payment proof</p>
                <a
                  href={tx.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View screenshot
                </a>
              </div>
            )}
          </div>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-secondary mb-3">Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Created</span>
              <span className="text-secondary">{formatDateTime(tx.createdAt)}</span>
            </div>
            {tx.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Completed</span>
                <span className="text-success">{formatDateTime(tx.completedAt)}</span>
              </div>
            )}
            {tx.clientNotes && (
              <div className="rounded-lg bg-mist/50 p-2 text-xs text-secondary">
                <p className="font-semibold text-muted mb-0.5">Client note</p>
                {tx.clientNotes}
              </div>
            )}
            {tx.adminNotes && currentUserRole === 'admin' && (
              <div className="rounded-lg bg-primary-50/40 p-2 text-xs text-secondary">
                <p className="font-semibold text-muted mb-0.5">Admin note</p>
                {tx.adminNotes}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`${mono ? 'font-mono-crypto' : ''} ${highlight ? 'font-bold text-primary text-base' : 'text-secondary'}`}>{value}</dd>
    </div>
  );
}