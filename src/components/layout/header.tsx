'use client';

import { useUIStore } from '@/store/ui-store';
import { signOut } from 'next-auth/react';
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
  const toggle    = useUIStore(s => s.toggleSidebar);
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  const crumb = BREADCRUMBS[pathname] ?? 'Admin';
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0,
      background: 'rgba(7,12,26,0.9)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Left: hamburger + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggle}
          className="lg:hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}>Admin</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{crumb}</span>
        </div>
      </div>

      {/* Right: bell + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Notification bell */}
        <button style={{
          position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '8px 9px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2C7.5 2 4 3.5 4 7.5V10.5H11V7.5C11 3.5 7.5 2 7.5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 10.5C6 11.3 6.7 12 7.5 12C8.3 12 9 11.3 9 10.5" stroke="currentColor" strokeWidth="1.3"/></svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 5, height: 5, borderRadius: '50%', background: '#4D9FFF', border: '1.5px solid #070C1A' }} />
        </button>

        {/* User avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '6px 12px 6px 6px', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: '#fff',
              boxShadow: '0 2px 8px rgba(26,63,255,0.5)', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ textAlign: 'left', display: 'none' }} className="sm:block">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, lineHeight: 1, textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {open && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50,
                width: 220, borderRadius: 14, overflow: 'hidden',
                background: '#0D1535', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 56px rgba(0,0,0,0.7)',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: 'rgba(26,63,255,0.12)', border: '1px solid rgba(77,159,255,0.2)', fontSize: 10, fontWeight: 700, color: '#4D9FFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ⚙ Admin
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', fontSize: 13, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3C2.4 2 2 2.4 2 3V11C2 11.6 2.4 12 3 12H5M9 9.5L12 7L9 4.5M5 7H12" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
