'use client';

import { useUIStore } from '@/store/ui-store';
import { forceLogout } from '@/lib/auth/force-logout';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { SessionUser } from '@/types';

const BREADCRUMBS: Record<string, string> = {
  '/admin':              'Overview',
  '/admin/rates':        'Exchange Rates',
  '/admin/transactions': 'Orders',
  '/admin/users':        'Users',
  '/admin/payments':     'Payment Methods',
};

export function Header({ user }: { user: SessionUser }) {
  const toggle   = useUIStore(s => s.toggleSidebar);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const crumb   = BREADCRUMBS[pathname] ?? 'Admin';
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header style={{
      height: 'var(--fr-nav-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0,
      background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--fr-border-subtle)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggle}
          className="lg:hidden"
          style={{ background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', padding: '6px 8px', cursor: 'pointer', color: 'var(--fr-text-tertiary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--fr-text-disabled)', fontWeight: 600 }}>Admin</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="var(--fr-border-medium)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{crumb}</span>
        </div>
      </div>

      {/* Right: bell + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          position: 'relative', background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)',
          borderRadius: 'var(--fr-radius-md)', padding: '8px 9px', cursor: 'pointer', color: 'var(--fr-text-tertiary)',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C7.5 2 4 3.5 4 7.5V10.5H11V7.5C11 3.5 7.5 2 7.5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 10.5C6 11.3 6.7 12 7.5 12C8.3 12 9 11.3 9 10.5" stroke="currentColor" strokeWidth="1.3"/></svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: '50%', background: 'var(--fr-lime)', border: '1.5px solid var(--fr-dark-1)' }} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)',
              borderRadius: 'var(--fr-radius-md)', padding: '6px 12px 6px 6px', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(204,255,0,0.15)', border: '1.5px solid rgba(204,255,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="sm:block">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', lineHeight: 1, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)', marginTop: 2, lineHeight: 1, textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--fr-text-tertiary)' }}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50,
                width: 220, borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden',
                background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)',
                boxShadow: '0 24px 56px rgba(0,0,0,0.7)',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--fr-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(204,255,0,0.15)', border: '1.5px solid rgba(204,255,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.2)', fontSize: 10, fontWeight: 700, color: 'var(--fr-lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Admin
                  </div>
                </div>
                <button
                  onClick={() => forceLogout('/')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', fontSize: 13, color: 'var(--fr-text-danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background var(--fr-ease-fast)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3C2.4 2 2 2.4 2 3V11C2 11.6 2.4 12 3 12H5M9 9.5L12 7L9 4.5M5 7H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
