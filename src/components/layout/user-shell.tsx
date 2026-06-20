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

  const initial   = user.name.charAt(0).toUpperCase();
  const avatarUrl = (user as any).avatarUrl;
  const dicebear  = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=1a3fff,6b21ff,00e5a0&fontFamily=Arial&fontSize=40`;
  const avatarSrc = avatarUrl || dicebear;

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
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(204,255,0,0.3)', overflow: 'hidden', flexShrink: 0, background: 'rgba(204,255,0,0.12)' }}>
                <img src={avatarSrc} alt={user.name} width={30} height={30} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
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
                    <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid rgba(204,255,0,0.3)', overflow: 'hidden', flexShrink: 0, background: 'rgba(204,255,0,0.12)' }}>
                      <img src={avatarSrc} alt={user.name} width={38} height={38} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                    </div>
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

      {/* ── Floating support button ── */}
      <a
        href="https://wa.me/919999999999"
        target="_blank" rel="noopener noreferrer"
        title="Live Support"
        style={{
          position: 'fixed', bottom: 84, right: 20, zIndex: 200,
          width: 50, height: 50, borderRadius: '50%',
          background: 'linear-gradient(135deg,#25D366,#128C7E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          textDecoration: 'none',
          animation: 'supportPulse 3s ease-in-out infinite',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

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
