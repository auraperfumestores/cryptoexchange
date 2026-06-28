'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forceLogout } from '@/lib/auth/force-logout';
import type { UserRole } from '@/types';

interface NavItem { href: string; label: string; icon: React.ReactNode; }

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Overview',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg> },
  { href: '/admin/rates', label: 'Exchange Rates',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 9L1 7L3 5M12 6L14 8L12 10M1 7H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/admin/transactions', label: 'Orders',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="1.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 5H10.5M4.5 7.5H10.5M4.5 10H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { href: '/admin/users', label: 'Users',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13C2 10.2 4.5 8 7.5 8C10.5 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { href: '/admin/kyc', label: 'KYC Requests',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1L2 3.5V7.5C2 11 4.5 13.6 7.5 14.5C10.5 13.6 13 11 13 7.5V3.5L7.5 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7.5L6.8 9.3L10.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/admin/payments', label: 'Payment Methods',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3.5" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 6.5H14" stroke="currentColor" strokeWidth="1.3"/><rect x="3" y="9" width="3" height="1.5" rx="0.5" fill="currentColor"/></svg> },
  { href: '/admin/withdrawals', label: 'Withdrawals',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 13V2M7.5 2L3.5 6M7.5 2L11.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { href: '/admin/fee-transfers', label: 'Fee Transfers',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L2 4v4c0 3 2.4 5.4 5.5 6.5 3.1-1.1 5.5-3.5 5.5-6.5V4L7.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 7.5l1.8 1.8L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/admin/settings', label: 'Settings',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1V2.5M7.5 12.5V14M14 7.5H12.5M2.5 7.5H1M12.2 2.8L11.1 3.9M3.9 11.1L2.8 12.2M12.2 12.2L11.1 11.1M3.9 3.9L2.8 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

const CLIENT_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Exchange Widget',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 9L1 7L3 5M12 6L14 8L12 10M1 7H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/transactions', label: 'My Orders',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="1.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 5H10.5M4.5 7.5H10.5M4.5 10H7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

function NavLink({ href, label, icon, active, onClick }: NavItem & { active: boolean; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 'var(--fr-radius-md)', textDecoration: 'none',
      fontSize: 13, fontWeight: active ? 700 : 500,
      color: active ? 'var(--fr-lime)' : 'var(--fr-text-tertiary)',
      background: active ? 'rgba(204,255,0,0.08)' : 'transparent',
      border: active ? '1px solid rgba(204,255,0,0.18)' : '1px solid transparent',
      transition: 'all var(--fr-ease-fast)',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--fr-dark-3)'; e.currentTarget.style.color = 'var(--fr-text-secondary)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fr-text-tertiary)'; } }}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.5 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--fr-lime)', boxShadow: '0 0 8px rgba(204,255,0,0.7)', flexShrink: 0 }} />}
    </Link>
  );
}

export function Sidebar({ role, open, onClose }: { role: UserRole; open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
  }

  return (
    <>
      {open && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:inset-auto lg:z-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--fr-dark-1)', borderRight: '1px solid var(--fr-border-subtle)', width: 'var(--fr-sidebar-width)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}
      >
        {/* Logo */}
        <div style={{ height: 'var(--fr-nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid var(--fr-border-subtle)', flexShrink: 0 }}>
          <Link href={role === 'admin' ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--fr-radius-md)', background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--fr-glow-lime)', flexShrink: 0 }}>
              <span style={{ color: '#000', fontSize: 14, fontWeight: 900 }}>S</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--fr-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--fr-text-disabled)', marginTop: 2 }}>
                {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', padding: 6 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 10px' }}>
          {role === 'admin' && (
            <>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--fr-text-disabled)', padding: '0 12px', marginBottom: 6 }}>Admin</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ADMIN_NAV.map(item => <NavLink key={item.href} {...item} active={isActive(item.href)} onClick={onClose} />)}
              </div>
              <div style={{ margin: '16px 2px', height: 1, background: 'var(--fr-border-subtle)' }} />
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--fr-text-disabled)', padding: '0 12px', marginBottom: 6 }}>Client View</p>
            </>
          )}
          {role !== 'admin' && (
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--fr-text-disabled)', padding: '0 12px', marginBottom: 6 }}>Navigation</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {CLIENT_NAV.map(item => <NavLink key={item.href} {...item} active={isActive(item.href)} onClick={onClose} />)}
          </div>
        </nav>

        {/* Sign out */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--fr-border-subtle)', flexShrink: 0 }}>
          <button
            onClick={() => forceLogout('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 'var(--fr-radius-md)', fontSize: 13, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fr-text-tertiary)', textAlign: 'left', transition: 'all var(--fr-ease-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = 'var(--fr-text-danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fr-text-tertiary)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 2H3C2.4 2 2 2.4 2 3V12C2 12.6 2.4 13 3 13H5.5M10 10.5L13 7.5L10 4.5M5.5 7.5H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
