import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Transaction, transactionToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import ExchangeWidget from '@/components/landing/exchange-widget';
import Link from 'next/link';
import { formatINR, formatCrypto } from '@/lib/utils';
import type { TransactionDocument } from '@/types';

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  awaiting_crypto:  { label: 'Awaiting crypto',  color: 'var(--fr-text-warning)', bg: 'rgba(251,191,36,0.10)' },
  awaiting_payment: { label: 'Awaiting payment', color: 'var(--fr-text-warning)', bg: 'rgba(251,191,36,0.10)' },
  confirming:       { label: 'Confirming',        color: '#60A5FA', bg: 'rgba(96,165,250,0.10)' },
  completed:        { label: 'Completed',         color: 'var(--fr-lime)', bg: 'rgba(204,255,0,0.08)'  },
  cancelled:        { label: 'Cancelled',         color: 'var(--fr-text-tertiary)', bg: 'rgba(100,116,139,0.10)' },
  disputed:         { label: 'Disputed',          color: 'var(--fr-text-danger)', bg: 'rgba(248,113,113,0.10)' },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  await connectToDatabase();
  const allTx = await Transaction.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(5).lean();
  const txDocs = allTx.map(transactionToDocument) as TransactionDocument[];

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <ClientShell user={session.user as any} rates={[]}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28, maxWidth: 900, margin: '0 auto' }}>

        {/* Welcome row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--fr-text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              Welcome back, {firstName}
            </h1>
            {/* Desktop subtitle */}
            <p className="dash-sub-desktop" style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--fr-text-secondary)' }}>
              Exchange USDT to INR at the best rates
            </p>
            {/* Mobile subtitle — wallet warning */}
            <div className="dash-sub-mobile" style={{ alignItems: 'center', gap: 6, margin: '6px 0 0' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                <path d="M7.5 1L13.5 12H1.5L7.5 1Z" stroke="#F59E0B" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M7.5 5.5V8.5" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="7.5" cy="10.5" r="0.6" fill="#F59E0B"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Wallet verification pending</span>
            </div>
          </div>
          {/* Live rates badge — desktop only */}
          <div className="dash-live-rate" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 999, padding: '6px 14px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fr-lime)', display: 'inline-block', boxShadow: '0 0 8px rgba(204,255,0,0.7)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-lime)' }}>Live rates active</span>
          </div>
        </div>

        {/* Main content: widget + history */}
        <div className="user-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,480px) 1fr', gap: 24, alignItems: 'start' }}>

          {/* Exchange widget */}
          <div style={{ borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.5), var(--fr-glow-lime)', border: '1px solid rgba(204,255,0,0.10)' }}>
            <ExchangeWidget />
          </div>

          {/* Right panel: stats + recent history — hidden on mobile (lives in Trades tab) */}
          <div className="dash-secondary" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total orders', value: txDocs.length, color: '#60A5FA' },
                { label: 'Completed',    value: txDocs.filter(t => t.status === 'completed').length, color: 'var(--fr-lime)' },
                { label: 'Pending',      value: txDocs.filter(t => !['completed','cancelled'].includes(t.status)).length, color: 'var(--fr-text-warning)' },
                { label: 'Volume (INR)', value: `₹${txDocs.reduce((s,t) => s + (t.inrAmount ?? 0), 0).toLocaleString('en-IN')}`, color: '#B78FFF' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-lg)', padding: '16px 18px' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 3px', fontFamily: 'var(--fr-font-mono)' }}>{value}</p>
                  <p style={{ fontSize: 11, color: color, margin: 0, fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Recent trades */}
            <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>Recent trades</p>
                <Link href="/transactions" style={{ fontSize: 12, color: 'var(--fr-lime)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
              </div>

              {txDocs.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--fr-text-disabled)' }}><path d="M5 16L11 10L16 15L21 8L27 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>No trades yet. Start your first exchange!</p>
                </div>
              ) : (
                txDocs.map((tx, i) => {
                  const s = STATUS_STYLES[tx.status] ?? STATUS_STYLES.cancelled;
                  return (
                    <Link key={tx._id} href={`/transactions/${tx._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', textDecoration: 'none', borderBottom: i < txDocs.length - 1 ? '1px solid var(--fr-border-subtle)' : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--fr-radius-md)', background: tx.type === 'buy' ? 'rgba(204,255,0,0.10)' : 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: tx.type === 'buy' ? 'var(--fr-lime)' : '#60A5FA' }}>
                        {tx.type === 'buy'
                          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M7 12L3 8M7 12L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M7 2L3 6M7 2L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)} {tx.cryptoSymbol}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '1px 0 0' }}>{tx.network} · {formatINR(tx.inrAmount)}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 999, padding: '3px 8px', flexShrink: 0 }}>
                        {s.label}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </ClientShell>
  );
}
