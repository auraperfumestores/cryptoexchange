'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bank } from '@phosphor-icons/react';
import { formatINR, formatCrypto, timeAgo } from '@/lib/utils';
import type { TransactionDocument } from '@/types';

/* ── Status config ── */
const STATUS: Record<string, { label: string; color: string; bg: string; plain?: boolean }> = {
  awaiting_crypto:  { label: 'Awaiting crypto',  color: '#FBBF24', bg: 'rgba(251,191,36,0.10)' },
  awaiting_payment: { label: 'Awaiting payment', color: '#60A5FA', bg: 'rgba(96,165,250,0.10)'  },
  confirming:       { label: 'Confirming',        color: '#FBBF24', bg: 'transparent', plain: true },
  completed:        { label: 'Completed',         color: '#CCFF00', bg: 'rgba(204,255,0,0.08)'   },
  cancelled:        { label: 'Cancelled',         color: '#64748B', bg: 'rgba(100,116,139,0.10)' },
  disputed:         { label: 'Disputed',          color: '#F87171', bg: 'rgba(248,113,113,0.10)' },
  failed:           { label: 'Failed',            color: '#F87171', bg: 'rgba(248,113,113,0.10)' },
};

const STATUSES = ['all','awaiting_crypto','awaiting_payment','confirming','completed','cancelled','failed'];
const STATUS_LABELS: Record<string,string> = {
  all:'All statuses', awaiting_crypto:'Awaiting crypto', awaiting_payment:'Awaiting payment',
  confirming:'Confirming', completed:'Completed', cancelled:'Cancelled', failed:'Failed',
};

/* ── Icons ── */
function IcoSearch() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IcoBuy() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V14M8 14L4 10M8 14L12 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoSell() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V2M8 2L4 6M8 2L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoEmpty() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="10" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 20H32M16 26H28M16 32H24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="36" cy="12" r="5" fill="rgba(204,255,0,0.12)" stroke="#CCFF00" strokeWidth="1.4"/>
      <path d="M34 12H38M36 10V14" stroke="#CCFF00" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function IcoArrow() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function UserHistory({ transactions }: { transactions: TransactionDocument[] }) {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');

  /* Stats */
  const total     = transactions.length;
  const completed = transactions.filter(t => t.status === 'completed').length;
  const pending   = transactions.filter(t => !['completed','cancelled'].includes(t.status)).length;
  const volume    = transactions
    .filter(t => t.status === 'completed')
    .reduce((s, t) => s + (t.inrAmount ?? 0), 0);

  /* Filtered list */
  const filtered = transactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter   !== 'all' && tx.type   !== typeFilter)   return false;
    if (search) {
      const q = search.toLowerCase();
      return tx.orderId.toLowerCase().includes(q) || tx.txHash?.toLowerCase().includes(q);
    }
    return true;
  });

  /* Shared card style */
  const card: React.CSSProperties = {
    background: 'var(--fr-dark-2)',
    border: '1px solid var(--fr-border-default)',
    borderRadius: 'var(--fr-radius-xl)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Stats strip ── */}
      <div className="trades-stats">
        {[
          { label: 'Total orders', value: total,      color: '#60A5FA' },
          { label: 'Completed',    value: completed,  color: '#CCFF00' },
          { label: 'Pending',      value: pending,    color: '#FBBF24' },
          { label: 'Volume (INR)', value: volume === 0 ? '₹0' : `₹${volume.toLocaleString('en-IN')}`, color: '#B78FFF' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...card, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0, fontFamily: 'var(--fr-font-mono)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 10, fontWeight: 700, color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 12, color: 'var(--fr-text-disabled)', pointerEvents: 'none', display: 'flex' }}>
            <IcoSearch />
          </span>
          <input
            type="text"
            placeholder="Search by order ID or tx hash…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 14,
              height: 40, borderRadius: 10, fontSize: 13,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--fr-border-default)',
              color: 'var(--fr-text-primary)', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'var(--fr-font-sans)',
            }}
          />
        </div>
        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="fr-select"
          style={{
            height: 40, padding: '0 30px 0 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--fr-border-default)',
            color: 'var(--fr-text-primary)', cursor: 'pointer', outline: 'none',
            fontFamily: 'var(--fr-font-sans)', colorScheme: 'dark',
            appearance: 'none', WebkitAppearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\' fill=\'none\'%3E%3Cpath d=\'M3 4.5L6 7.5L9 4.5\' stroke=\'%2391918f\' stroke-width=\'1.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}
        >
          <option value="all">All types</option>
          <option value="buy">Buy USDT</option>
          <option value="sell">Sell USDT</option>
        </select>
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="fr-select"
          style={{
            height: 40, padding: '0 30px 0 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--fr-border-default)',
            color: 'var(--fr-text-primary)', cursor: 'pointer', outline: 'none',
            fontFamily: 'var(--fr-font-sans)', colorScheme: 'dark',
            appearance: 'none', WebkitAppearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\' fill=\'none\'%3E%3Cpath d=\'M3 4.5L6 7.5L9 4.5\' stroke=\'%2391918f\' stroke-width=\'1.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--fr-text-disabled)', whiteSpace: 'nowrap', fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* ── Empty state ── */}
      {transactions.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ color: 'var(--fr-text-disabled)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <IcoEmpty />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            No trades yet
          </h3>
          <p style={{ fontSize: 14, color: 'var(--fr-text-tertiary)', margin: '0 0 28px', lineHeight: 1.65, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            Your exchange history will appear here once you complete your first order.
          </p>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 12,
            background: '#CCFF00', color: '#000',
            textDecoration: 'none', fontSize: 14, fontWeight: 800,
            letterSpacing: '-0.01em',
          }}>
            Start your first exchange <IcoArrow />
          </Link>
        </div>
      )}

      {/* ── No filter results ── */}
      {transactions.length > 0 && filtered.length === 0 && (
        <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fr-text-primary)', margin: '0 0 6px' }}>No matches found</p>
          <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* ── Transaction list ── */}
      {filtered.length > 0 && (
        <div style={{ ...card, overflow: 'hidden' }}>

          {/* Desktop table header */}
          <div className="trades-th">
            {['Order', 'Amount', 'Value (INR)', 'Status', 'Time'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fr-text-disabled)' }}>{h}</span>
            ))}
          </div>

          {filtered.map((tx) => {
            const s    = STATUS[tx.status] ?? STATUS.cancelled;
            const isBuy = tx.type === 'buy';
            const iconBg   = isBuy ? 'rgba(204,255,0,0.08)'  : 'rgba(248,113,113,0.10)';
            const iconBd   = isBuy ? 'rgba(204,255,0,0.20)'  : 'rgba(248,113,113,0.22)';
            const iconClr  = isBuy ? '#CCFF00' : '#F87171';
            const typeClr  = isBuy ? '#CCFF00' : '#F87171';

            return (
              <div key={tx._id}>
                {/* ── Desktop row ── */}
                <Link
                  href={`/transactions/${tx._id}`}
                  className="trades-row-d"
                >
                  {/* Col 1: icon + order */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, border: `1px solid ${iconBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconClr }}>
                      {isBuy ? <IcoBuy /> : <Bank size={18} weight="bold" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.orderId}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fr-text-disabled)', marginTop: 2 }}>
                        <span style={{ color: typeClr, fontWeight: 700 }}>{isBuy ? 'Buy' : 'Sell'}</span>
                        {' · '}{tx.cryptoSymbol} · {tx.network}
                      </div>
                    </div>
                  </div>
                  {/* Col 2: amount */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}>{formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)}</div>
                    <div style={{ fontSize: 10, color: 'var(--fr-text-disabled)', marginTop: 1, fontWeight: 600 }}>{tx.cryptoSymbol}</div>
                  </div>
                  {/* Col 3: INR */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}>
                    {formatINR(tx.inrAmount)}
                  </div>
                  {/* Col 4: status */}
                  <div>
                    {s.plain ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                        {s.label}
                      </span>
                    )}
                  </div>
                  {/* Col 5: time */}
                  <div style={{ fontSize: 11, color: 'var(--fr-text-disabled)', textAlign: 'right' }}>
                    {timeAgo(tx.createdAt)}
                  </div>
                </Link>

                {/* ── Mobile card row ── */}
                <Link href={`/transactions/${tx._id}`} className="trades-row-m">
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: iconBg, border: `1px solid ${iconBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconClr }}>
                    {isBuy ? <IcoBuy /> : <Bank size={18} weight="bold" />}
                  </div>
                  {/* Left: order id + type */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.orderId}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fr-text-disabled)', marginTop: 2 }}>
                      <span style={{ color: typeClr, fontWeight: 700 }}>{isBuy ? 'Buy' : 'Sell'}</span>
                      {' · '}{tx.network}
                    </div>
                  </div>
                  {/* Right: INR value + status + time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)', letterSpacing: '-0.02em' }}>
                      {formatINR(tx.inrAmount)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 4 }}>
                      {s.plain ? (
                        <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: s.color, background: s.bg }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                          {s.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--fr-text-disabled)', marginTop: 3, fontWeight: 500 }}>
                      {timeAgo(tx.createdAt)}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
