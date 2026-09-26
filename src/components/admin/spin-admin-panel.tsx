'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

const T = {
  bg: 'rgba(255,255,255,0.03)', bg2: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.08)', text: '#FFFFFF', sub: 'rgba(255,255,255,0.52)',
  dim: 'rgba(255,255,255,0.28)', green: '#00E5A0', red: '#F87171', yellow: '#F3BA2F', lime: '#CCFF00',
};

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface Overview {
  dateKey: string; dailyBudgetUsdt: number; paidTodayUsdt: number; spinsToday: number;
  outstandingUsdt: number; outstandingSpins: number; accounts: number;
  withdrawalsPending: number; withdrawalsProcessing: number;
}
interface TierRule { winRatePct: number; maxWinUsdt: number }
interface Settings {
  enabled: boolean; hiddenFromUsers: boolean; autoApproveMaxUsdt: number; spinsPer100Usdt: number; requireMinOrderForDeposit: boolean;
  dailyBudgetUsdt: number; signupSpins: number; freeTier: TierRule; depositTier: TierRule;
}
interface Row {
  _id: string; amount: number; network: string; toAddress: string; status: string;
  refunded?: boolean; txHash?: string; rejectionReason?: string; createdAt: string;
  user: { _id: string; name: string; email: string } | null;
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Needs review',  color: T.yellow },
  processing: { label: 'Auto-approved', color: T.lime },
  completed:  { label: 'Paid out',      color: T.green },
  rejected:   { label: 'Rejected',      color: T.red },
};
const FILTERS = [
  { value: 'pending',    label: 'Needs review' },
  { value: 'processing', label: 'Awaiting payout' },
  { value: 'completed',  label: 'Paid out' },
  { value: 'rejected',   label: 'Rejected' },
  { value: 'all',        label: 'All' },
];

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 9, fontSize: 13, background: T.bg, border: `1px solid ${T.border}`,
  color: T.text, outline: 'none', width: '100%', fontFamily: 'monospace',
};
const labelStyle: React.CSSProperties = {
  fontSize: 10.5, color: T.dim, margin: '0 0 6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
};
const hintStyle: React.CSSProperties = { fontSize: 11, color: T.dim, margin: '6px 0 0', lineHeight: 1.55 };

/* ── Panel ─────────────────────────────────────────────────────────────────── */
export function SpinAdminPanel() {
  const [tab, setTab] = useState<'withdrawals' | 'settings'>('withdrawals');
  const [ov, setOv] = useState<Overview | null>(null);

  async function loadOverview() {
    try {
      const j = await fetch('/api/admin/spin/overview').then(r => r.json());
      if (j.success) setOv(j.data);
    } catch { /* non-fatal */ }
  }
  useEffect(() => { loadOverview(); }, []);

  const budgetPct = ov && ov.dailyBudgetUsdt > 0 ? Math.min(100, (ov.paidTodayUsdt / ov.dailyBudgetUsdt) * 100) : 0;

  return (
    <div>
      {/* Overview strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '13px 16px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <p style={{ fontSize: 11, color: T.dim, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today&apos;s budget · {ov?.dateKey ?? '…'} IST</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: 0, fontFamily: 'monospace' }}>
              {ov ? `${ov.paidTodayUsdt.toFixed(2)} / ${ov.dailyBudgetUsdt.toFixed(2)}` : '…'} <span style={{ color: T.dim, fontWeight: 600 }}>USDT</span>
            </p>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${budgetPct}%`, background: budgetPct > 85 ? T.red : budgetPct > 60 ? T.yellow : T.lime, transition: 'width 400ms' }} />
          </div>
          <p style={{ fontSize: 11, color: T.dim, margin: '6px 0 0' }}>{ov ? `${ov.spinsToday} spins today · resets at midnight IST` : ''}</p>
        </div>
        {[
          { label: 'Needs review',   value: ov?.withdrawalsPending ?? '…',    color: T.yellow },
          { label: 'Awaiting payout', value: ov?.withdrawalsProcessing ?? '…', color: T.lime },
          { label: 'Unwithdrawn winnings', value: ov ? `$${ov.outstandingUsdt.toFixed(2)}` : '…', color: T.text },
          { label: 'Unplayed spins', value: ov?.outstandingSpins ?? '…', color: T.text },
        ].map(s => (
          <div key={s.label} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: '13px 16px' }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: '0 0 2px', fontFamily: 'monospace' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: T.dim, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ value: 'withdrawals', label: 'Withdrawals' }, { value: 'settings', label: 'Settings' }].map(t => (
          <button key={t.value} onClick={() => setTab(t.value as any)} style={{
            padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            background: tab === t.value ? 'rgba(204,255,0,0.1)' : T.bg,
            border: `1px solid ${tab === t.value ? 'rgba(204,255,0,0.3)' : T.border}`,
            color: tab === t.value ? T.lime : T.sub,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'withdrawals' ? <WithdrawalsTab onChanged={loadOverview} /> : <SettingsTab onSaved={loadOverview} />}
    </div>
  );
}

/* ── Withdrawals ───────────────────────────────────────────────────────────── */
function WithdrawalsTab({ onChanged }: { onChanged: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [mode, setMode] = useState<{ id: string; kind: 'approve' | 'reject' } | null>(null);
  const [txHash, setTxHash] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const [reason, setReason] = useState('');
  const [refund, setRefund] = useState(true);

  useEffect(() => { load(); }, [status]);

  async function load() {
    setLoading(true);
    try {
      const j = await fetch(`/api/admin/withdrawals?source=spin&status=${status}`).then(r => r.json());
      if (j.success) setRows(j.data);
    } finally { setLoading(false); }
  }

  async function decide(id: string, kind: 'approve' | 'reject') {
    setActing(id);
    try {
      const body = kind === 'approve'
        ? { action: 'approve', txHash: txHash.trim(), explorerUrl: explorerUrl.trim() }
        : { action: 'reject', reason: reason.trim(), refund };
      const res = await fetch(`/api/admin/withdrawals/${id}/decision`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Failed');
      toast.success(kind === 'approve' ? 'Marked as paid out' : refund ? 'Rejected and refunded to spin balance' : 'Rejected without refund');
      setMode(null); setTxHash(''); setExplorerUrl(''); setReason('');
      load(); onChanged();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed');
    } finally { setActing(null); }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setStatus(f.value)} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: status === f.value ? T.bg2 : 'transparent', border: `1px solid ${status === f.value ? T.border : 'transparent'}`,
            color: status === f.value ? T.text : T.dim,
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 0.8fr 1.1fr 1fr', padding: '11px 18px', borderBottom: `1px solid ${T.border}`, fontSize: 10.5, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>User</span><span>Amount</span><span>Network</span><span>Status</span><span>Requested</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>Nothing here.</div>
        ) : rows.map(row => {
          const cfg = STATUS_CFG[row.status] ?? STATUS_CFG.pending;
          const open = row.status === 'pending' || row.status === 'processing';
          const editing = mode?.id === row._id;
          return (
            <div key={row._id} style={{ borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 0.8fr 1.1fr 1fr', padding: '13px 18px', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{row.user?.name ?? 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{row.user?.email}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>{row.amount.toFixed(2)} USDT</span>
                <span style={{ fontSize: 12.5, color: T.sub }}>{row.network}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />{cfg.label}
                  {row.status === 'rejected' && typeof row.refunded === 'boolean' && (
                    <span style={{ fontSize: 10, color: T.dim, fontWeight: 600 }}>· {row.refunded ? 'refunded' : 'no refund'}</span>
                  )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, color: T.dim }}>{formatDate(row.createdAt)}</span>
                  {open && !editing && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setMode({ id: row._id, kind: 'approve' })} style={{ fontSize: 11, fontWeight: 800, color: T.lime, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 7, padding: '4px 9px', cursor: 'pointer' }}>Paid</button>
                      <button onClick={() => setMode({ id: row._id, kind: 'reject' })} style={{ fontSize: 11, fontWeight: 800, color: T.red, background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 7, padding: '4px 9px', cursor: 'pointer' }}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
              <p style={{ margin: '0 18px 10px', fontSize: 11, color: T.dim, fontFamily: 'monospace', wordBreak: 'break-all' }}>→ {row.toAddress}</p>

              {editing && (
                <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mode!.kind === 'approve' ? (
                    <>
                      <p style={hintStyle}>Send the USDT from the treasury first, then record the proof here. Nothing moves on-chain automatically.</p>
                      <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="Transaction hash" style={inputStyle} />
                      <input value={explorerUrl} onChange={e => setExplorerUrl(e.target.value)} placeholder="Explorer link (https://…)" style={inputStyle} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button disabled={acting === row._id || !txHash.trim() || !explorerUrl.trim()} onClick={() => decide(row._id, 'approve')} style={{ padding: '9px 16px', borderRadius: 9, background: T.lime, color: '#000', fontSize: 12.5, fontWeight: 800, border: 'none', cursor: 'pointer', opacity: acting === row._id ? 0.6 : 1 }}>Confirm paid out</button>
                        <button onClick={() => setMode(null)} style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: T.dim, fontSize: 12.5, fontWeight: 600, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason shown to the user" style={inputStyle} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: T.sub, cursor: 'pointer' }}>
                        <input type="checkbox" checked={refund} onChange={e => setRefund(e.target.checked)} style={{ accentColor: T.lime }} />
                        Refund the amount to their spin balance
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button disabled={acting === row._id || !reason.trim()} onClick={() => decide(row._id, 'reject')} style={{ padding: '9px 16px', borderRadius: 9, background: T.red, color: '#fff', fontSize: 12.5, fontWeight: 800, border: 'none', cursor: 'pointer', opacity: acting === row._id ? 0.6 : 1 }}>Confirm reject</button>
                        <button onClick={() => setMode(null)} style={{ padding: '9px 14px', borderRadius: 9, background: 'none', color: T.dim, fontSize: 12.5, fontWeight: 600, border: `1px solid ${T.border}`, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Settings ──────────────────────────────────────────────────────────────── */
function SettingsTab({ onSaved }: { onSaved: () => void }) {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/spin/settings').then(r => r.json()).then(j => { if (j.success) setS(j.data); });
  }, []);

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/spin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Save failed');
      toast.success('Spin settings saved');
      onSaved();
    } catch (e: any) { toast.error(e.message ?? 'Save failed'); }
    finally { setSaving(false); }
  }

  if (!s) return <div style={{ padding: 40, textAlign: 'center', color: T.dim, fontSize: 13 }}>Loading…</div>;

  const numField = (label: string, key: keyof Settings, hint: string, step = 1) => (
    <div>
      <p style={labelStyle}>{label}</p>
      <input type="number" min={0} step={step} value={s[key] as number} onChange={e => setS({ ...s, [key]: Number(e.target.value) })} style={inputStyle} />
      <p style={hintStyle}>{hint}</p>
    </div>
  );
  const tierBlock = (title: string, key: 'freeTier' | 'depositTier', who: string) => (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: '0 0 2px' }}>{title}</p>
      <p style={{ fontSize: 11.5, color: T.dim, margin: '0 0 14px' }}>{who}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <p style={labelStyle}>Win rate %</p>
          <input type="number" min={0} max={100} step={1} value={s[key].winRatePct} onChange={e => setS({ ...s, [key]: { ...s[key], winRatePct: Number(e.target.value) } })} style={inputStyle} />
          <p style={hintStyle}>Chance a spin lands on any prize. The rest land on “Nothing”.</p>
        </div>
        <div>
          <p style={labelStyle}>Max prize (USDT)</p>
          <input type="number" min={0} step={0.05} value={s[key].maxWinUsdt} onChange={e => setS({ ...s, [key]: { ...s[key], maxWinUsdt: Number(e.target.value) } })} style={inputStyle} />
          <p style={hintStyle}>Largest segment this tier can ever land on.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: T.bg, border: `1px solid ${s.enabled ? 'rgba(204,255,0,0.3)' : T.border}`, borderRadius: 14, padding: '14px 18px' }}>
        <input type="checkbox" checked={s.enabled} onChange={e => setS({ ...s, enabled: e.target.checked })} style={{ width: 17, height: 17, accentColor: T.lime, cursor: 'pointer' }} />
        <span>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: T.text }}>Spin &amp; Win enabled</span>
          <span style={{ display: 'block', fontSize: 11.5, color: T.dim, marginTop: 2 }}>When off, the wheel refuses new spins and no spins are earned. Existing balances and withdrawals are unaffected.</span>
        </span>
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: T.bg, border: `1px solid ${s.hiddenFromUsers ? 'rgba(248,113,113,0.4)' : T.border}`, borderRadius: 14, padding: '14px 18px' }}>
        <input type="checkbox" checked={!!s.hiddenFromUsers} onChange={e => setS({ ...s, hiddenFromUsers: e.target.checked })} style={{ width: 17, height: 17, accentColor: T.red, cursor: 'pointer' }} />
        <span>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: T.text }}>Hide Spin &amp; Win from users completely</span>
          <span style={{ display: 'block', fontSize: 11.5, color: T.dim, marginTop: 2 }}>Removes the Spin tab from every user menu, sends /spin to the dashboard, blocks spinning, claiming and spin withdrawals, and stops spins being earned. Balances are kept and come back when unhidden. Withdrawals already submitted stay in your review queue.</span>
        </span>
      </label>

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: '0 0 14px' }}>Budget &amp; payouts</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {numField('Daily prize budget (USDT)', 'dailyBudgetUsdt', 'Ceiling on prizes won per IST day. Large prizes get rarer as it drains; small ones keep flowing, so the wheel very rarely goes dead.', 1)}
          {numField('Auto-approve withdrawals up to (USDT)', 'autoApproveMaxUsdt', 'Spin withdrawals at or below this skip review and go straight to your payout queue.', 0.5)}
        </div>
      </div>

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: T.text, margin: '0 0 14px' }}>How spins are earned</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {numField('Signup spins (after KYC)', 'signupSpins', 'Granted once, the moment a user’s KYC is approved.', 1)}
          {numField('Spins per 100 USDT deposited', 'spinsPer100Usdt', 'Applied pro-rata and rounded down: 15 → a 50 USDT deposit earns 7.', 1)}
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', marginTop: 14 }}>
          <input type="checkbox" checked={s.requireMinOrderForDeposit} onChange={e => setS({ ...s, requireMinOrderForDeposit: e.target.checked })} style={{ marginTop: 2, width: 15, height: 15, accentColor: T.lime, cursor: 'pointer', flexShrink: 0 }} />
          <span>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: T.text }}>Deposit must meet the user’s minimum sell amount</span>
            <span style={{ display: 'block', fontSize: 11, color: T.dim, marginTop: 2, lineHeight: 1.55 }}>Uses the global widget minimum, or the user’s custom limit if one is set. Smaller deposits earn no spins and don’t move the user to the deposit tier.</span>
          </span>
        </label>
      </div>

      {tierBlock('Free tier', 'freeTier', 'Users who have only their signup spins and no qualifying deposit yet.')}
      {tierBlock('Deposit tier', 'depositTier', 'Users who have made at least one qualifying deposit.')}

      <button onClick={save} disabled={saving} style={{ alignSelf: 'flex-start', padding: '11px 22px', borderRadius: 10, background: T.lime, color: '#000', fontSize: 13, fontWeight: 800, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}
