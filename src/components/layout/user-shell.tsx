'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { SessionUser } from '@/types';

interface UserShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

const NAV = [
  {
    href: '/dashboard', label: 'Exchange',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 9L1 7L3 5M12 6L14 8L12 10M1 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    href: '/transactions', label: 'History',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 5.5H10M5 7.5H10M5 9.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    href: '/settings', label: 'Profile',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13C2 10.2 4.5 8 7.5 8C10.5 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  },
];

export function UserShell({ user, children }: UserShellProps) {
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', position: 'relative' }}>
      {/* Subtle ambient bg glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,255,0,0.03) 0%, transparent 70%)' }} />
      </div>

      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--fr-border-subtle)',
        height: 'var(--fr-nav-height)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--fr-radius-md)', background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--fr-glow-lime)', flexShrink: 0 }}>
              <span style={{ color: '#000', fontSize: 14, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Centre nav tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--fr-dark-3)', borderRadius: 'var(--fr-radius-lg)', padding: 4, border: '1px solid var(--fr-border-default)' }}>
            {NAV.map(({ href, label, icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 'var(--fr-radius-md)',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  transition: 'all var(--fr-ease-fast)',
                  background: active ? 'rgba(204,255,0,0.1)' : 'transparent',
                  color: active ? 'var(--fr-lime)' : 'var(--fr-text-tertiary)',
                  border: active ? '1px solid rgba(204,255,0,0.2)' : '1px solid transparent',
                }}>
                  <span style={{ color: active ? 'var(--fr-lime)' : 'var(--fr-text-disabled)' }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)',
                borderRadius: 'var(--fr-radius-md)', padding: '7px 14px 7px 7px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(204,255,0,0.12)', border: '1.5px solid rgba(204,255,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0,
              }}>{initial}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)', marginTop: 2, lineHeight: 1 }}>Member</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2, color: 'var(--fr-text-tertiary)' }}>
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50,
                  width: 220, borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden',
                  background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)',
                  boxShadow: '0 24px 56px rgba(0,0,0,0.65)',
                }}>
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(204,255,0,0.12)', border: '1.5px solid rgba(204,255,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0 }}>{initial}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                  </div>
                  {NAV.map(({ href, label, icon }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', fontSize: 13, color: 'var(--fr-text-secondary)',
                      textDecoration: 'none', borderBottom: '1px solid var(--fr-border-subtle)',
                    }}>
                      <span style={{ color: 'var(--fr-text-tertiary)' }}>{icon}</span>
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', fontSize: 13, color: 'var(--fr-text-danger)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 2H3C2.4 2 2 2.4 2 3V12C2 12.6 2.4 13 3 13H5.5M10 10.5L13 7.5L10 4.5M5.5 7.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '36px 24px 60px' }}>
        {children}
      </main>
    </div>
  );
}
