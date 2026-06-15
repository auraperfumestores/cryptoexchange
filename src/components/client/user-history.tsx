'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatINR, formatCrypto, timeAgo } from '@/lib/utils';
import type { TransactionDocument } from '@/types';

/* ── Design tokens (same panel bg) ── */
const T = {
  card:    'rgba(255,255,255,0.045)',
  card2:   'rgba(255,255,255,0.07)',
  border:  'rgba(255,255,255,0.08)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,0.5)',
  dim:     'rgba(255,255,255,0.28)',
  blue:    '#4D9FFF',
  green:   '#00E5A0',
  yellow:  '#FBBF24',
  red:     '#F87171',
  cyan:    '#00D4FF',
  purple:  '#A78BFA',
};

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  awaiting_crypto:  { label: 'Awaiting crypto',  color: '#FBBF24', bg: 'rgba(245,158,11,0.12)',  dot: '#FBBF24' },
  awaiting_payment: { label: 'Awaiting payment', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  dot: '#60A5FA' },
  confirming:       { label: 'Confirming',        color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', dot: '#A78BFA' },
  completed:        { label: 'Completed',         color: '#00E5A0', bg: 'rgba(0,229,160,0.1)',    dot: '#00E5A0' },
  cancelled:        { label: 'Cancelled',         color: '#94A3B8', bg: 'rgba(100,116,139,0.12)', dot: '#94A3B8' },
  disputed:         { label: 'Disputed',          color: '#F87171', bg: 'rgba(248,113,113,0.1)',  dot: '#F87171' },
};

const STATUSES = ['all', 'awaiting_crypto', 'awaiting_payment', 'confirming', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  all: 'All', awaiting_crypto: 'Awaiting crypto', awaiting_payment: 'Awaiting payment',
  confirming: 'Confirming', completed: 'Completed', cancelled: 'Cancelled',
};

export function UserHistory({ transactions }: { transactions: TransactionDocument[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = transactions.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return tx.orderId.toLowerCase().includes(q) || tx.txHash?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Search + filter bar ── */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: '14px 18px',
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4"/>
            <path d="M10 10L13 13" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or tx hash…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 14,
              height: 40, borderRadius: 10, fontSize: 13,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
              color: T.text, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            height: 40, padding: '0 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`,
            color: T.sub, cursor: 'pointer', outline: 'none',
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
          style={{
            height: 40, padding: '0 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`,
            color: T.sub, cursor: 'pointer', outline: 'none',
          }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        {/* Result count */}
        <span style={{ fontSize: 12, color: T.dim, whiteSpace: 'nowrap' }}>
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* ── Empty state ── */}
      {transactions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '72px 24px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💱</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>No trades yet</h3>
          <p style={{ fontSize: 14, color: T.sub, margin: '0 0 24px', lineHeight: 1.6 }}>
            Your exchange history will appear here once you complete your first order.
          </p>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 50,
            background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)',
            color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 18px rgba(26,63,255,0.45)',
          }}>
            Start your first exchange →
          </Link>
        </div>
      )}

      {/* ── No filter results ── */}
      {transactions.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 20 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: T.text, margin: '0 0 6px' }}>No matches found</p>
          <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>Try adjusting your search or filter.</p>
        </div>
      )}

      {/* ── Transaction list ── */}
      {filtered.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 130px 130px 140px 80px',
            padding: '11px 20px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            {['Order', 'Amount', 'Value (INR)', 'Status', 'Time'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((tx, i) => {
            const s = STATUS[tx.status] ?? STATUS.cancelled;
            const buyMode = tx.type === 'buy';
            return (
              <Link
                key={tx._id}
                href={`/transactions/${tx._id}`}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 130px 130px 140px 80px',
                  padding: '14px 20px', textDecoration: 'none',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none',
                  transition: 'background 0.1s',
                  alignItems: 'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Order ID + type */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: buyMode ? 'rgba(0,229,160,0.1)' : 'rgba(77,159,255,0.1)',
                    border: buyMode ? '1px solid rgba(0,229,160,0.2)' : '1px solid rgba(77,159,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {buyMode ? '↓' : '↑'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.orderId}
                    </div>
                    <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                      <span style={{ color: buyMode ? T.green : T.blue, fontWeight: 600 }}>{buyMode ? 'Buy' : 'Sell'}</span>
                      {' · '}{tx.cryptoSymbol} · {tx.network}
                    </div>
                  </div>
                </div>

                {/* Crypto amount */}
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>
                  {formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)}
                  <div style={{ fontSize: 10, fontWeight: 500, color: T.dim, marginTop: 1 }}>{tx.cryptoSymbol}</div>
                </div>

                {/* INR value */}
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: 'monospace' }}>
                  {formatINR(tx.inrAmount)}
                </div>

                {/* Status badge */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                    color: s.color, background: s.bg,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
                    {s.label}
                  </span>
                </div>

                {/* Time */}
                <div style={{ fontSize: 11, color: T.dim, textAlign: 'right' }}>
                  {timeAgo(tx.createdAt)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
