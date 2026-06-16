import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, Transaction, User, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import { StatCard, QuickAction, RecentOrders } from '@/components/admin/overview-cards';
import { formatINR } from '@/lib/utils';
import type { RateDocument } from '@/types';

const T = {
  card:   'var(--fr-dark-2)',
  border: 'var(--fr-border-default)',
  text:   'var(--fr-text-primary)',
  sub:    'var(--fr-text-secondary)',
  dim:    'var(--fr-text-tertiary)',
};


export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') redirect('/dashboard');

  await connectToDatabase();

  const [totalUsers, totalTx, pendingTx, rates, recentTx] = await Promise.all([
    User.countDocuments({ role: 'client' }),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: { $in: ['awaiting_crypto', 'awaiting_payment', 'confirming'] } }),
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
    Transaction.find({}).sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  const [volResult, completedTx] = await Promise.all([
    Transaction.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$inrAmount' } } }]),
    Transaction.countDocuments({ status: 'completed' }),
  ]);
  const volume = volResult[0]?.total || 0;

  return (
    <ClientShell user={session.user as any} rates={rates.map(rateToDocument) as RateDocument[]}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Page header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.03em' }}>Admin Overview</h1>
          <p style={{ fontSize: 14, color: T.sub, margin: '5px 0 0' }}>Welcome back — here's a snapshot of your exchange.</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <StatCard label="Total Users" value={totalUsers} sub="Registered clients" accent="var(--fr-neon-blue)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 18C3 14.7 6.1 12 10 12C13.9 12 17 14.7 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
          <StatCard label="Pending Orders" value={pendingTx} sub="Require attention" accent="var(--fr-text-warning)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6V10.5L13 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
          <StatCard label="Total Orders" value={totalTx} sub={`${completedTx} completed`} accent="var(--fr-lime)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10L9.5 12.5L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
          <StatCard label="Total Volume" value={formatINR(volume)} sub="Completed trades" accent="var(--fr-neon-purple)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 13L7 9L11 11L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 5H17V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        </div>

        {/* Quick actions */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 14px', letterSpacing: '-0.02em' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <QuickAction href="/admin/rates" label="Exchange Rates" sub="Set buy/sell rates" accent="#4D9FFF"
              icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 11L2 9L4 7M14 8L16 10L14 12M2 9H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            <QuickAction href="/admin/transactions" label="Manage Orders" sub="Review & update status" accent="#00E5A0"
              icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 6H12.5M5.5 9H12.5M5.5 12H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>} />
            <QuickAction href="/admin/users" label="Users" sub="View & manage accounts" accent="#A78BFA"
              icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 16C2.5 12.7 5.4 10 9 10C12.6 10 15.5 12.7 15.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>} />
            <QuickAction href="/admin/payments" label="Payment Methods" sub="UPI, bank, cash" accent="#F3BA2F"
              icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="4" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 7.5H16.5" stroke="currentColor" strokeWidth="1.4"/><rect x="3.5" y="10" width="4" height="2" rx="0.75" fill="currentColor"/></svg>} />
          </div>
        </div>

        {/* Recent orders */}
        <RecentOrders transactions={(recentTx as any[]).map(tx => ({
          _id: tx._id.toString(),
          orderId: tx.orderId,
          type: tx.type,
          network: tx.network,
          userName: tx.userName,
          cryptoAmount: tx.cryptoAmount,
          inrAmount: tx.inrAmount,
          status: tx.status,
        }))} />
      </div>
    </ClientShell>
  );
}
