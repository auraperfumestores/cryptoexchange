'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

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

interface Row {
  _id: string;
  amount: number;
  network: string;
  toAddress: string;
  networkFee: number;
  status: string;
  refunded?: boolean;
  createdAt: string;
  updatedAt: string;
  user: { _id: string; name: string; email: string; phone?: string } | null;
}

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export function WithdrawalAdminPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, [status, page]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: String(page) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/withdrawals?${params}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      }
    } finally {
      setLoading(false);
    }
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            style={{
              padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              background: status === t.value ? 'rgba(204,255,0,0.1)' : T.bg,
              border: `1px solid ${status === t.value ? 'rgba(204,255,0,0.3)' : T.border}`,
              color: status === t.value ? T.lime : T.sub,
            }}
          >
            {t.label}
          </button>
        ))}
        <form onSubmit={onSearchSubmit} style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ padding: '8px 12px', borderRadius: 9, fontSize: 12.5, background: T.bg, border: `1px solid ${T.border}`, color: T.text, outline: 'none', minWidth: 220 }}
          />
        </form>
      </div>

      <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', padding: '11px 18px', borderBottom: `1px solid ${T.border}`, fontSize: 10.5, fontWeight: 800, color: T.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Customer</span><span>Amount</span><span>Network</span><span>Status</span><span>Requested</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: T.dim, fontSize: 13 }}>No withdrawal requests found.</div>
        ) : (
          rows.map(row => {
            const cfg = STATUS_CFG[row.status] ?? STATUS_CFG.pending;
            return (
              <div
                key={row._id}
                onClick={() => router.push(`/admin/withdrawals/${row._id}`)}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr', padding: '14px 18px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', alignItems: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = T.bg2; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: T.text, margin: 0 }}>{row.user?.name ?? 'Unknown user'}</p>
                  <p style={{ fontSize: 11.5, color: T.dim, margin: '2px 0 0' }}>{row.user?.email}</p>
                </div>
                <span style={{ fontSize: 12.5, color: T.text, fontWeight: 700, fontFamily: 'monospace' }}>{row.amount.toLocaleString('en-IN')} USDT</span>
                <span style={{ fontSize: 12.5, color: T.sub }}>{row.network}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: cfg.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                  {cfg.label}
                  {row.status === 'rejected' && typeof row.refunded === 'boolean' && (
                    <span style={{ fontSize: 10, color: T.dim, fontWeight: 600 }}>· {row.refunded ? 'refunded' : 'no refund'}</span>
                  )}
                </span>
                <span style={{ fontSize: 12, color: T.dim }}>{formatDate(row.createdAt)}</span>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '7px 14px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, color: page <= 1 ? T.dim : T.text, cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 12.5 }}>← Prev</button>
          <span style={{ fontSize: 12.5, color: T.dim }}>Page {page} of {totalPages} · {total} total</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '7px 14px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, color: page >= totalPages ? T.dim : T.text, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 12.5 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
