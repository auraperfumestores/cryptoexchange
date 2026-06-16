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
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M3 9L1 7L3 5M12 6L14 8L12 10M1 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/transactions', label: 'History',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5.5H10M5 7.5H10M5 9.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/settings', label: 'Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 13C2 10.2 4.5 8 7.5 8C10.5 8 13 10.2 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/* Panel bg is intentionally lighter than the widget (#0C1130) */
const BG     = '#111B42';
const HEADER = 'rgba(13,20,50,0.96)';
const CARD   = 'rgba(255,255,255,0.045)';
const BORDER = 'rgba(255,255,255,0.08)';

export function UserShell({ user, children }: UserShellProps) {
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);

  function isActive(href: string) {
    return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: BG, position: 'relative' }}>
      {/* Subtle ambient bg glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,63,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,33,255,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* ── Top navigation bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: HEADER,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(26,63,255,0.5)', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, letterSpacing: '-0.02em' }}>S</span>
            </div>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swap<span style={{ background: 'linear-gradient(135deg,#4D9FFF,#00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>INR</span>
            </span>
          </Link>

          {/* Centre tab nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, border: `1px solid ${BORDER}` }}>
            {NAV.map(({ href, label, icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.15s',
                  background: active ? 'linear-gradient(135deg,#1A3FFF,#6B21FF)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? '0 4px 16px rgba(26,63,255,0.4)' : 'none',
                }}>
                  <span style={{ color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: user button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: '7px 14px 7px 7px',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: '#fff', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(26,63,255,0.5)',
              }}>
                {initial}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, lineHeight: 1 }}>Member</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                <path d="M2 4L6 8L10 4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {dropOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 50,
                  width: 220, borderRadius: 16, overflow: 'hidden',
                  background: '#0D1535',
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 24px 56px rgba(0,0,0,0.65)',
                }}>
                  {/* User info */}
                  <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                  </div>
                  {/* Nav links */}
                  {NAV.map(({ href, label, icon }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', fontSize: 13, color: 'rgba(255,255,255,0.65)',
                      textDecoration: 'none', borderBottom: `1px solid ${BORDER}`,
                      transition: 'background 0.1s',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)' }}>{icon}</span>
                      {label}
                    </Link>
                  ))}
                  {/* Sign out */}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '11px 16px', fontSize: 13,
                      color: '#F87171', background: 'none', border: 'none',
                      textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M5.5 2H3C2.4 2 2 2.4 2 3V12C2 12.6 2.4 13 3 13H5.5M10 10.5L13 7.5L10 4.5M5.5 7.5H13" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '36px 24px 60px' }}>
        {children}
      </main>
    </div>
  );
}
