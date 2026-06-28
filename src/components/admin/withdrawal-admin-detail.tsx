'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import type { UserDocument } from '@/types';

const T = {
  bg: 'rgba(255,255,255,0.03)', bg2: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.28)', green: '#00E5A0', red: '#F87171', yellow: '#F3BA2F', lime: '#CCFF00',
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: T.yellow },
  processing: { label: 'Processing', color: T.yellow },
  completed: { label: 'Completed', color: T.green },
  rejected: { label: 'Rejected', color: T.red },
};

interface Withdrawal {
  _id: string;
  amount: number;
  network: string;
  chainId: number;
  toAddress: string;
  networkFee: number;
  status: string;
  txHash?: string;
  explorerUrl?: string;
  adminNotes?: string;
  rejectionReason?: string;
  refunded?: boolean;
  processedByName?: string;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WalletInfo {
  balance: number;
  recentTransactions: { type: 'credit' | 'debit'; amount: number; note: string; addedBy: string; createdAt: string }[];
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ color: T.dim }}>{label}</span>
      <span style={{ color: T.text, fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export function WithdrawalAdminDetail({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [user, setUser] = useState<UserDocument | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [showApproveForm, setShowApproveForm] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [refundChoice, setRefundChoice] = useState<'refund' | 'forfeit' | ''>('');

  useEffect(() => { load(); }, [withdrawalId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`);
      const json = await res.json();
      if (json.success) {
        setWithdrawal(json.data.withdrawal);
        setUser(json.data.user);
        setWallet(json.data.wallet);
      }
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if (!txHash.trim() || !explorerUrl.trim()) { setShowApproveForm(true); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/decision`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', txHash: txHash.trim(), explorerUrl: explorerUrl.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      await load();
      setShowApproveForm(false);
      toast.success('Withdrawal marked as completed');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!reason.trim() || !refundChoice) { setShowRejectForm(true); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/decision`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: reason.trim(), refund: refundChoice === 'refund' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      await load();
      setShowRejectForm(false);
      toast.success(refundChoice === 'refund' ? 'Request rejected and amount refunded' : 'Request rejected');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: '60px 0', textAlign: 'center', color: T.dim }}>Loading…</div>;
  if (!withdrawal || !user) return <div style={{ padding: '60px 0', textAlign: 'center', color: T.red }}>Withdrawal request not found.</div>;

  const cfg = STATUS_CFG[withdrawal.status] ?? STATUS_CFG.pending;
  const actionable = withdrawal.status === 'pending' || withdrawal.status === 'processing';

  return (
    <div>
      <button onClick={() => router.push('/admin/withdrawals')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.dim, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Back to withdrawal requests
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="text-2xl font-bold text-secondary" style={{ margin: 0 }}>{user.name}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}33`, borderRadius: 999, padding: '4px 11px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />{cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: T.dim, margin: '4px 0 0' }}>{user.email}{user.phone ? ` · +91 ${user.phone}` : ''}</p>
        </div>

        {actionable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={busy} onClick={() => setShowApproveForm(true)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, background: T.green, color: '#000', border: 'none', cursor: 'pointer' }}>Approve ✓</button>
            <button disabled={busy} onClick={() => setShowRejectForm(true)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, background: 'rgba(248,113,113,0.1)', color: T.red, border: `1px solid ${T.red}40`, cursor: 'pointer' }}>Reject ✕</button>
          </div>
        )}
      </div>

      {showApproveForm && (
        <div style={{ background: 'rgba(0,229,160,0.05)', border: `1px solid ${T.green}30`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: T.green, margin: '0 0 10px' }}>Confirm payout details</p>
          <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 12px', lineHeight: 1.6 }}>
            Send the {withdrawal.amount.toLocaleString('en-IN')} USDT payout on {withdrawal.network} to the destination address
            from the treasury yourself, then paste the transaction hash and a link to it on a blockchain explorer below.
            No funds are moved automatically by this action.
          </p>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Transaction hash</label>
          <input
            value={txHash} onChange={e => setTxHash(e.target.value)}
            placeholder="e.g. 0x4a2c…f91b"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 12 }}
          />
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Blockchain explorer link</label>
          <input
            value={explorerUrl} onChange={e => setExplorerUrl(e.target.value)}
            placeholder="e.g. https://tronscan.org/#/transaction/…"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button disabled={busy || !txHash.trim() || !explorerUrl.trim()} onClick={approve} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 800, background: T.green, color: '#000', border: 'none', cursor: 'pointer' }}>Mark as Completed</button>
            <button onClick={() => setShowApproveForm(false)} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: 'transparent', color: T.dim, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {showRejectForm && (
        <div style={{ background: 'rgba(248,113,113,0.05)', border: `1px solid ${T.red}30`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: T.red, margin: '0 0 8px' }}>Rejection reason (shown to the user)</p>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="e.g. The destination address could not be verified as belonging to you."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }}
          />
          <p style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            Refund {withdrawal.amount.toLocaleString('en-IN')} USDT to the user's wallet?
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              onClick={() => setRefundChoice('refund')}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                background: refundChoice === 'refund' ? 'rgba(0,229,160,0.1)' : T.bg2,
                border: `1px solid ${refundChoice === 'refund' ? T.green : T.border}`, color: refundChoice === 'refund' ? T.green : T.sub }}
            >
              Yes, refund the amount<br /><span style={{ fontSize: 11, fontWeight: 500, color: T.dim }}>Credited back to platform wallet balance</span>
            </button>
            <button
              onClick={() => setRefundChoice('forfeit')}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                background: refundChoice === 'forfeit' ? 'rgba(248,113,113,0.1)' : T.bg2,
                border: `1px solid ${refundChoice === 'forfeit' ? T.red : T.border}`, color: refundChoice === 'forfeit' ? T.red : T.sub }}
            >
              No, reject only<br /><span style={{ fontSize: 11, fontWeight: 500, color: T.dim }}>Amount stays deducted</span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={busy || !reason.trim() || !refundChoice} onClick={reject} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 800, background: T.red, color: '#fff', border: 'none', cursor: 'pointer' }}>Confirm Rejection</button>
            <button onClick={() => setShowRejectForm(false)} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: 'transparent', color: T.dim, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
        <div style={{ background: 'rgba(248,113,113,0.05)', border: `1px solid ${T.red}25`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Rejection reason on file</p>
          <p style={{ fontSize: 13, color: T.sub, margin: '0 0 8px' }}>{withdrawal.rejectionReason}</p>
          <p style={{ fontSize: 12, color: T.dim, margin: 0 }}>{withdrawal.refunded ? 'Amount was refunded to the platform wallet.' : 'Amount was not refunded.'}</p>
        </div>
      )}

      {withdrawal.status === 'completed' && withdrawal.txHash && (
        <div style={{ background: 'rgba(0,229,160,0.05)', border: `1px solid ${T.green}25`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Payout sent</p>
          <p style={{ fontSize: 12.5, color: T.sub, margin: '0 0 6px', wordBreak: 'break-all', fontFamily: 'monospace' }}>{withdrawal.txHash}</p>
          {withdrawal.explorerUrl && (
            <a href={withdrawal.explorerUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: T.lime, textDecoration: 'none' }}>View on explorer →</a>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>Withdrawal Request</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
            <Row label="Amount" value={`${withdrawal.amount.toLocaleString('en-IN')} USDT`} mono />
            <Row label="Network fee" value={`${withdrawal.networkFee} USDT`} mono />
            <Row label="Network" value={withdrawal.network} />
            <Row label="Destination address" value={withdrawal.toAddress} mono />
            <Row label="Requested" value={formatDate(withdrawal.createdAt)} />
            {withdrawal.processedAt && <Row label="Processed" value={`${formatDate(withdrawal.processedAt)} by ${withdrawal.processedByName ?? '—'}`} />}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Customer</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} mono />
              <Row label="Phone" value={user.phone ? `+91 ${user.phone}` : '—'} />
              <Row label="KYC status" value={user.kycStatus ?? 'unverified'} />
              <Row label="Platform wallet balance" value={`${(wallet?.balance ?? 0).toLocaleString('en-IN')} USDT`} mono />
            </div>
          </div>

          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Recent Wallet Activity</p>
            {!wallet || wallet.recentTransactions.length === 0 ? (
              <p style={{ fontSize: 12.5, color: T.dim, margin: 0 }}>No transactions on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wallet.recentTransactions.map((tx, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10 }}>
                    <div>
                      <p style={{ fontSize: 12, color: T.text, margin: 0 }}>{tx.note || (tx.type === 'credit' ? 'Credit' : 'Debit')}</p>
                      <p style={{ fontSize: 10.5, color: T.dim, margin: '2px 0 0' }}>{formatDate(tx.createdAt)}</p>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: tx.type === 'credit' ? T.green : T.red, fontFamily: 'monospace' }}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
