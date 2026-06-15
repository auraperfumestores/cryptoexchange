'use client';

import Link from 'next/link';
import { formatINR } from '@/lib/utils';

const T = {
  card:   'rgba(255,255,255,0.04)',
  card2:  'rgba(255,255,255,0.065)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#FFFFFF',
  sub:    'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.25)',
};

export function StatCard({ label, value, sub, accent, icon }: { label: string; value: string | number; sub?: string; accent: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '18px 18px 0 0' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim, margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: T.sub, margin: '4px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  awaiting_crypto:  { color: '#FBBF24', bg: 'rgba(245,158,11,0.12)',  label: 'Awaiting crypto'  },
  awaiting_payment: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  label: 'Awaiting payment' },
  confirming:       { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', label: 'Confirming'        },
  completed:        { color: '#00E5A0', bg: 'rgba(0,229,160,0.1)',    label: 'Completed'         },
  cancelled:        { color: '#94A3B8', bg: 'rgba(100,116,139,0.12)', label: 'Cancelled'         },
  disputed:         { color: '#F87171', bg: 'rgba(248,113,113,0.1)',  label: 'Disputed'          },
};

interface TxRow {
  _id: string;
  orderId: string;
  type: string;
  network: string;
  userName: string;
  cryptoAmount: number;
  inrAmount: number;
  status: string;
}

export function RecentOrders({ transactions }: { transactions: TxRow[] }) {
  if (transactions.length === 0) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Recent Orders</h2>
        <Link href="/admin/transactions" style={{ fontSize: 12, fontWeight: 600, color: '#4D9FFF', textDecoration: 'none' }}>View all →</Link>
      </div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 130px 150px', padding: '10px 20px', borderBottom: `1px solid ${T.border}` }}>
          {['Order', 'Amount', 'Value', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim }}>{h}</span>
          ))}
        </div>
        {transactions.map((tx, i) => {
          const s = STATUS_STYLE[tx.status] ?? STATUS_STYLE.cancelled;
          const isBuy = tx.type === 'buy';
          return (
            <Link key={tx._id} href={`/admin/transactions/${tx._id}`} style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 130px 150px',
              padding: '13px 20px', textDecoration: 'none', alignItems: 'center',
              borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: isBuy ? 'rgba(0,229,160,0.1)' : 'rgba(77,159,255,0.1)',
                  border: isBuy ? '1px solid rgba(0,229,160,0.2)' : '1px solid rgba(77,159,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: isBuy ? '#00E5A0' : '#4D9FFF',
                }}>
                  {isBuy ? '↓' : '↑'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.orderId}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 1 }}>{tx.userName} · {tx.network}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{tx.cryptoAmount} <span style={{ fontSize: 10, color: T.dim }}>USDT</span></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>{formatINR(tx.inrAmount)}</div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  {s.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function QuickAction({ href, label, sub, accent, icon }: { href: string; label: string; sub: string; accent: string; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', transition: 'all 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = T.card2; d.style.borderColor = `${accent}30`; d.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = T.card; d.style.borderColor = T.border; d.style.transform = 'none'; }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${accent}15`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 12 }}>
          {icon}
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: 12, color: T.sub, margin: 0 }}>{sub}</p>
      </div>
    </Link>
  );
}
