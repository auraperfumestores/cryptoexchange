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
  awaiting_crypto:  { label: 'Awaiting crypto',  color: '#FBBF24', bg: 'rgba(245,158,11,0.12)' },
  awaiting_payment: { label: 'Awaiting payment', color: '#FBBF24', bg: 'rgba(245,158,11,0.12)' },
  confirming:       { label: 'Confirming',        color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  completed:        { label: 'Completed',         color: '#00E5A0', bg: 'rgba(0,229,160,0.1)'  },
  cancelled:        { label: 'Cancelled',         color: '#94A3B8', bg: 'rgba(100,116,139,0.12)' },
  disputed:         { label: 'Disputed',          color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(148,163,184,0.55)' }}>
              Exchange USDT ↔ INR at the best rates
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 999, padding: '6px 14px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00E5A0', display: 'inline-block', boxShadow: '0 0 8px #00E5A0' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00E5A0' }}>Live rates active</span>
          </div>
        </div>

        {/* Main content: widget + history */}
        <div className="user-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,480px) 1fr', gap: 24, alignItems: 'start' }}>

          {/* Exchange widget */}
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)' }}>
            <ExchangeWidget />
          </div>

          {/* Right panel: stats + recent history */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total orders', value: txDocs.length, color: '#4D9FFF' },
                { label: 'Completed',    value: txDocs.filter(t => t.status === 'completed').length, color: '#00E5A0' },
                { label: 'Pending',      value: txDocs.filter(t => !['completed','cancelled'].includes(t.status)).length, color: '#FBBF24' },
                { label: 'Volume (INR)', value: `₹${txDocs.reduce((s,t) => s + (t.inrAmount ?? 0), 0).toLocaleString('en-IN')}`, color: '#A78BFA' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 3px', fontFamily: 'monospace' }}>{value}</p>
                  <p style={{ fontSize: 11, color: color, margin: 0, fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Recent trades */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Recent trades</p>
                <Link href="/transactions" style={{ fontSize: 12, color: '#4D9FFF', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
              </div>

              {txDocs.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 24, margin: '0 0 8px' }}>💱</p>
                  <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.4)', margin: 0 }}>No trades yet. Start your first exchange!</p>
                </div>
              ) : (
                txDocs.map((tx, i) => {
                  const s = STATUS_STYLES[tx.status] ?? STATUS_STYLES.cancelled;
                  return (
                    <Link key={tx._id} href={`/transactions/${tx._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', textDecoration: 'none', borderBottom: i < txDocs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: tx.type === 'buy' ? 'rgba(0,229,160,0.12)' : 'rgba(77,159,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                        {tx.type === 'buy' ? '↓' : '↑'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatCrypto(tx.cryptoAmount, tx.cryptoSymbol)} {tx.cryptoSymbol}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', margin: '1px 0 0' }}>{tx.network} · {formatINR(tx.inrAmount)}</p>
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
