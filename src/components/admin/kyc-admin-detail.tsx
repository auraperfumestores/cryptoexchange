'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import type { UserDocument, WalletDocument } from '@/types';

const T = {
  bg: 'rgba(255,255,255,0.03)', bg2: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.28)', green: '#00E5A0', red: '#F87171', yellow: '#F3BA2F', lime: '#CCFF00',
};

const DOC_LABEL: Record<string, string> = { aadhaar: 'Aadhaar Card', pan: 'PAN Card', driving_license: 'Driving Licence' };
const STATUS_CFG: Record<string, { label: string; color: string }> = {
  collecting: { label: 'In Progress', color: T.dim },
  pending_review: { label: 'Pending Review', color: T.yellow },
  verified: { label: 'Verified', color: T.green },
  rejected: { label: 'Rejected', color: T.red },
};

interface Submission {
  _id: string;
  docType?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  faceImageUrl?: string;
  faceImageUrlRight?: string;
  faceImageUrlLeft?: string;
  status: string;
  rejectionReason?: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string;
  resetCount: number;
  createdAt: string;
  updatedAt: string;
}

function NET(wallet: WalletDocument): 'BEP20' | 'ERC20' | 'TRC20' {
  return wallet.chainId === 195 ? 'TRC20' : wallet.chainId === 56 ? 'BEP20' : 'ERC20';
}

function WalletRow({ wallet }: { wallet: WalletDocument }) {
  const [balance, setBalance] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const network = NET(wallet);

  useEffect(() => {
    fetch(`/api/admin/wallet-info?${new URLSearchParams({ address: wallet.address, network })}`)
      .then(r => r.json())
      .then(j => j.success ? setBalance(j.data.balance) : setErr('—'))
      .catch(() => setErr('—'));
  }, [wallet.address, network]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10 }}>
      <div>
        <code style={{ fontSize: 12.5, color: T.text, fontFamily: 'monospace' }}>{wallet.address.slice(0, 10)}…{wallet.address.slice(-6)}</code>
        <span style={{ fontSize: 11, color: T.dim, marginLeft: 8 }}>{network}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>
        {balance != null ? `${parseFloat(balance).toFixed(2)} USDT` : err || '…'}
      </span>
    </div>
  );
}

function ImageCard({ label, url }: { label: string; url?: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{label}</p>
      <div style={{ aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', background: '#000', border: `1px solid ${T.border}` }}>
        {url
          ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></a>
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dim, fontSize: 12 }}>Not provided</div>}
      </div>
    </div>
  );
}

export function KycAdminDetail({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [user, setUser] = useState<UserDocument | null>(null);
  const [wallets, setWallets] = useState<WalletDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => { load(); }, [submissionId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc/${submissionId}`);
      const json = await res.json();
      if (json.success) {
        setSubmission(json.data.submission);
        setUser(json.data.user);
        setWallets(json.data.wallets);
      }
    } finally {
      setLoading(false);
    }
  }

  async function decide(action: 'verify' | 'reject') {
    if (action === 'reject' && !reason.trim()) { setShowRejectForm(true); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/kyc/${submissionId}/decision`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: action === 'reject' ? reason.trim() : undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setSubmission(json.data);
      setShowRejectForm(false);
      toast.success(action === 'verify' ? 'Identity verified' : 'Submission rejected');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetSubmission() {
    if (!confirm("Reset this user's KYC? They'll need to resubmit all documents from scratch. Their verification link will stay the same.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/kyc/${submissionId}/reset`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setSubmission(json.data);
      toast.success('KYC reset — user can resubmit');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: '60px 0', textAlign: 'center', color: T.dim }}>Loading…</div>;
  if (!submission || !user) return <div style={{ padding: '60px 0', textAlign: 'center', color: T.red }}>Submission not found.</div>;

  const cfg = STATUS_CFG[submission.status] ?? STATUS_CFG.collecting;

  return (
    <div>
      <button onClick={() => router.push('/admin/kyc')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.dim, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Back to KYC queue
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

        <div style={{ display: 'flex', gap: 8 }}>
          {submission.status === 'pending_review' && (
            <>
              <button disabled={busy} onClick={() => decide('verify')} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, background: T.green, color: '#000', border: 'none', cursor: 'pointer' }}>Approve ✓</button>
              <button disabled={busy} onClick={() => setShowRejectForm(true)} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, background: 'rgba(248,113,113,0.1)', color: T.red, border: `1px solid ${T.red}40`, cursor: 'pointer' }}>Reject ✕</button>
            </>
          )}
          {(submission.status === 'verified' || submission.status === 'rejected') && (
            <button disabled={busy} onClick={resetSubmission} style={{ padding: '9px 18px', borderRadius: 10, fontSize: 12.5, fontWeight: 800, background: T.bg2, color: T.sub, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Reset for Resubmission</button>
          )}
        </div>
      </div>

      {showRejectForm && (
        <div style={{ background: 'rgba(248,113,113,0.05)', border: `1px solid ${T.red}30`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: T.red, margin: '0 0 8px' }}>Rejection reason (shown to the user)</p>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="e.g. The ID photo is blurry and the back side wasn't readable."
            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: T.bg2, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button disabled={busy || !reason.trim()} onClick={() => decide('reject')} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 800, background: T.red, color: '#fff', border: 'none', cursor: 'pointer' }}>Confirm Rejection</button>
            <button onClick={() => setShowRejectForm(false)} style={{ padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: 'transparent', color: T.dim, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {submission.status === 'rejected' && submission.rejectionReason && (
        <div style={{ background: 'rgba(248,113,113,0.05)', border: `1px solid ${T.red}25`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Rejection reason on file</p>
          <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>{submission.rejectionReason}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>{submission.docType ? DOC_LABEL[submission.docType] : 'No document selected'}</p>
          <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 16px' }}>
            Submitted {submission.submittedAt ? formatDate(submission.submittedAt) : '—'}
            {submission.resetCount > 0 && ` · reset ${submission.resetCount}×`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
            <ImageCard label="Front" url={submission.frontImageUrl} />
            <ImageCard label="Back" url={submission.backImageUrl} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <ImageCard label="Live Face — Center" url={submission.faceImageUrl} />
            <ImageCard label="Live Face — Right" url={submission.faceImageUrlRight} />
            <ImageCard label="Live Face — Left" url={submission.faceImageUrlLeft} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Customer</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} mono />
              <Row label="Phone" value={user.phone ? `+91 ${user.phone}` : '—'} />
              <Row label="Account KYC status" value={user.kycStatus ?? 'unverified'} />
              <Row label="Member since" value={formatDate(user.createdAt)} />
            </div>
          </div>

          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Wallets ({wallets.length})</p>
            {wallets.length === 0 ? (
              <p style={{ fontSize: 12.5, color: T.dim, margin: 0 }}>No wallets on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {wallets.map(w => <WalletRow key={w._id} wallet={w} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ color: T.dim }}>{label}</span>
      <span style={{ color: T.text, fontWeight: 600, fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
