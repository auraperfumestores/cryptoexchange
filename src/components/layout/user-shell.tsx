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

function IcoExchange({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 13L1 11L3 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 7L19 9L17 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 11H13M7 9H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
function IcoTrades({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 7.5H13M7 10H13M7 12.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IcoWallet({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 6C3 4.9 3.9 4 5 4H15C16.1 4 17 4.9 17 6V14C17 15.1 16.1 16 15 16H5C3.9 16 3 15.1 3 14V6Z" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M13.5 10C13.5 10.83 14.17 11.5 15 11.5H17V8.5H15C14.17 8.5 13.5 9.17 13.5 10Z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="15" cy="10" r="0.8" fill="currentColor"/>
    </svg>
  );
}
function IcoProfile({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 17C3 13.7 6.1 11 10 11C13.9 11 17 13.7 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

const NAV = [
  { href: '/dashboard',    label: 'Exchange', Icon: IcoExchange },
  { href: '/transactions', label: 'Trades',   Icon: IcoTrades   },
  { href: '/wallets',      label: 'Wallet',   Icon: IcoWallet   },
  { href: '/settings',     label: 'Profile',  Icon: IcoProfile  },
];

export function UserShell({ user, children }: UserShellProps) {
  const pathname  = usePathname();
  const [dropOpen, setDropOpen] = useState(false);

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', position: 'relative' }}>

      {/* Ambient glow */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(204,255,0,0.03) 0%, transparent 70%)' }} />
      </div>

      {/* ── Top header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--fr-border-subtle)',
        height: 'var(--fr-nav-height)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--fr-radius-md)', background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--fr-glow-lime)', flexShrink: 0 }}>
              <span style={{ color: '#000', fontSize: 14, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Desktop centre nav — hidden on mobile */}
          <nav className="user-nav-tabs" style={{ alignItems: 'center', gap: 2, background: 'var(--fr-dark-3)', borderRadius: 'var(--fr-radius-lg)', padding: 4, border: '1px solid var(--fr-border-default)' }}>
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 'var(--fr-radius-md)',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  transition: 'all var(--fr-ease-fast)',
                  background: active ? 'rgba(204,255,0,0.1)' : 'transparent',
                  color: active ? 'var(--fr-lime)' : 'var(--fr-text-tertiary)',
                  border: active ? '1px solid rgba(204,255,0,0.2)' : '1px solid transparent',
                }}>
                  <span style={{ color: active ? 'var(--fr-lime)' : 'var(--fr-text-disabled)', display: 'flex' }}>
                    <Icon size={14} />
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop user dropdown — hidden on mobile */}
          <div className="user-header-avatar-btn" style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', padding: '7px 14px 7px 7px', cursor: 'pointer' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(204,255,0,0.12)', border: '1.5px solid rgba(204,255,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0 }}>
                {initial}
              </div>
              <div className="user-header-uname" style={{ flexDirection: 'column', textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)', marginTop: 2, lineHeight: 1 }}>Member</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--fr-text-tertiary)' }}>
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50, width: 220, borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden', background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', boxShadow: '0 24px 56px rgba(0,0,0,0.65)' }}>
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(204,255,0,0.12)', border: '1.5px solid rgba(204,255,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: 'var(--fr-lime)', flexShrink: 0 }}>{initial}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                  </div>
                  {NAV.map(({ href, label, Icon }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: 'var(--fr-text-secondary)', textDecoration: 'none', borderBottom: '1px solid var(--fr-border-subtle)' }}>
                      <span style={{ color: 'var(--fr-text-tertiary)', display: 'flex' }}><Icon size={15} /></span>
                      {label}
                    </Link>
                  ))}
                  <button onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', fontSize: 13, color: 'var(--fr-text-danger)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 2H3C2.4 2 2 2.4 2 3V12C2 12.6 2.4 13 3 13H5.5M10 10.5L13 7.5L10 4.5M5.5 7.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="user-main-content" style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '36px 24px 60px' }}>
        {children}
      </main>

      {/* ── Mobile floating pill nav ── */}
      <nav className="ubn" aria-label="Main navigation">
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`ubn__tab${active ? ' is-active' : ''}`}
            >
              <span className="ubn__icon"><Icon size={20} /></span>
              <span className="ubn__label">{label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
