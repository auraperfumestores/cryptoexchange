import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase, Rate, Transaction, User, KycSubmission, rateToDocument } from '@/lib/db';
import { ClientShell } from '@/components/layout/client-shell';
import Link from 'next/link';
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

  const [totalUsers, totalTx, pendingTx, pendingKyc, rates, recentTx, pendingKycDocs] = await Promise.all([
    User.countDocuments({ role: 'client' }),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: { $in: ['awaiting_crypto', 'awaiting_payment', 'confirming'] } }),
    KycSubmission.countDocuments({ status: 'pending_review' }),
    Rate.find({}).sort({ symbol: 1, network: 1 }).lean(),
    Transaction.find({}).sort({ createdAt: -1 }).limit(8).lean(),
    KycSubmission.find({ status: 'pending_review' }).sort({ submittedAt: 1 }).limit(6).lean(),
  ]);

  // Enrich pending KYC docs with user name + email
  const kycUserIds = pendingKycDocs.map((d: any) => d.userId);
  const kycUsers   = await User.find({ _id: { $in: kycUserIds } }, 'name email').lean();
  const kycUserMap = Object.fromEntries(kycUsers.map((u: any) => [String(u._id), u]));
  const pendingKycList = pendingKycDocs.map((d: any) => ({
    id:          String(d._id),
    submittedAt: d.submittedAt ? new Date(d.submittedAt).toISOString() : null,
    userName:    kycUserMap[String(d.userId)]?.name ?? 'Unknown',
    userEmail:   kycUserMap[String(d.userId)]?.email ?? '',
  }));

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
          <StatCard label="Pending KYC" value={pendingKyc} sub="Awaiting your review" accent="#F59E0B"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.4 7.4L18 8.3L14 12.2L14.9 18L10 15.4L5.1 18L6 12.2L2 8.3L7.6 7.4L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
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

        {/* Pending KYC requests */}
        {pendingKycList.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Pending KYC Reviews</h2>
                <p style={{ fontSize: 12, color: T.dim, margin: '3px 0 0' }}>{pendingKyc} submission{pendingKyc !== 1 ? 's' : ''} waiting for your approval</p>
              </div>
              <Link href="/admin/kyc" style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', textDecoration: 'none', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '6px 14px' }}>
                Review All →
              </Link>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
              {pendingKycList.map((kyc, i) => {
                const submittedMs  = kyc.submittedAt ? Date.now() - new Date(kyc.submittedAt).getTime() : 0;
                const waitingHours = Math.floor(submittedMs / (1000 * 60 * 60));
                const waitingMins  = Math.floor((submittedMs % (1000 * 60 * 60)) / (1000 * 60));
                const waitLabel    = waitingHours > 0 ? `${waitingHours}h ${waitingMins}m ago` : `${waitingMins}m ago`;
                return (
                  <div key={kyc.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#F59E0B" strokeWidth="1.3"/><path d="M2.5 14C2.5 11.5 5 9.5 8 9.5C11 9.5 13.5 11.5 13.5 14" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kyc.userName}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: T.dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kyc.userEmail}</p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
                      <p style={{ margin: 0, fontSize: 11, color: T.dim }}>{waitLabel}</p>
                      <span style={{ display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                        Pending
                      </span>
                    </div>
                    <Link href="/admin/kyc" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: T.sub, textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px' }}>
                      Review
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
