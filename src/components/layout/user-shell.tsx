'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Crown } from '@phosphor-icons/react';
import type { SessionUser } from '@/types';
import { ProUpgradeModal } from '@/components/ui/pro-upgrade-modal';

interface UserShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

/* ── Nav icons ────────────────────────────────────────────────────────────── */
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

/* ── Wallet balance chip ──────────────────────────────────────────────────── */
function IcoBalanceCoin({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M10 6.5V13.5M7.8 8.2C7.8 7.2 8.8 6.5 10 6.5C11.2 6.5 12.2 7.2 12.2 8.2C12.2 9.2 11.2 9.6 10 10C8.8 10.4 7.8 10.8 7.8 11.8C7.8 12.8 8.8 13.5 10 13.5C11.2 13.5 12.2 12.8 12.2 11.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function BalanceChip({ balance }: { balance: number | null }) {
  return (
    <div
      className="user-balance-chip"
      title="SwappINR Wallet Balance"
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        minWidth: 110, padding: '7px 14px', borderRadius: 8,
        background: 'rgba(204,255,0,0.05)',
        border: '1px solid rgba(204,255,0,0.35)',
        flexShrink: 0,
      }}
    >
      <span style={{ color: 'var(--fr-lime)', display: 'flex', flexShrink: 0 }}>
        <IcoBalanceCoin size={16} />
      </span>
      <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
        {balance === null ? '…' : balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>USDT</span>
    </div>
  );
}

/* ── PRO badge mini (inline) ─────────────────────────────────────────────── */
function ProBadgeMini() {
  return (
    <div style={{
      marginTop: 3,
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 6px', borderRadius: 99,
      background: 'linear-gradient(270deg,#FFD700 0%,#FFF176 45%,#FFB800 75%,#FFD700 100%)',
      backgroundSize: '300% 100%',
      fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', color: '#000',
      animation: 'pro-shimmer 6s linear infinite, pro-pulse 5s ease-in-out infinite',
      lineHeight: 1.4,
    }}>
      <Crown size={9} weight="fill" color="#000" />
      PRO
    </div>
  );
}


/* ── Main shell ───────────────────────────────────────────────────────────── */
export function UserShell({ user, children }: UserShellProps) {
  const pathname   = usePathname();
  const [dropOpen,    setDropOpen]    = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/pro/status').then(r => r.json()).then(d => {
      if (d?.data) setIsPro(!!d.data.isPro);
    }).catch(() => {});
    fetch('/api/user/platform-wallet').then(r => r.json()).then(d => {
      if (d?.success) setBalance(d.balance ?? 0);
    }).catch(() => {});
  }, []);

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
              Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Desktop centre nav */}
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

          {/* Right side: desktop user dropdown + mobile PRO button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* ── Wallet balance chip (always visible, PC + mobile) ── */}
            <BalanceChip balance={balance} />

            {/* ── Mobile-only PRO crown button ── */}
            {isPro === false && (
              <button
                onClick={() => setShowProModal(true)}
                className="user-pro-btn"
                title="SwappINR PRO"
                style={{
                  display: 'none', /* shown via CSS on mobile */
                  alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 99,
                  background: 'linear-gradient(270deg,#FFD700 0%,#FFF176 45%,#FFB800 75%,#FFD700 100%)',
                  backgroundSize: '300% 100%',
                  border: '1px solid rgba(255,210,0,0.5)',
                  fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: '#000',
                  cursor: 'pointer',
                  animation: 'pro-shimmer 6s linear infinite, pro-pulse 5s ease-in-out infinite',
                }}
              >
                <Crown size={13} weight="fill" color="#000" />
                PRO
              </button>
            )}

            {/* Desktop user dropdown */}
            <div className="user-header-avatar-btn" style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', padding: '7px 14px 7px 7px', cursor: 'pointer' }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid rgba(204,255,0,0.3)', overflow: 'hidden', flexShrink: 0, background: 'rgba(204,255,0,0.12)' }}>
                  <img src={avatarSrc} alt={user.name} width={30} height={30} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <div className="user-header-uname" style={{ flexDirection: 'column', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</div>
                  {isPro && <ProBadgeMini />}
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
                    {/* PRO upsell in dropdown */}
                    {isPro === false && (
                      <button
                        onClick={() => { setDropOpen(false); setShowProModal(true); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#FFD700', background: 'rgba(255,210,0,0.04)', border: 'none', borderBottom: '1px solid var(--fr-border-subtle)', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 12H13M1 12L3 5L7 8.5L11 2L13 5L13 12H1Z" fill="rgba(255,210,0,0.15)" stroke="#FFD700" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        Upgrade to PRO
                      </button>
                    )}
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

      {/* ── PRO modal ── */}
      {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}

      <style>{`
        @keyframes pro-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pro-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,204,0,0),0 0 7px rgba(255,200,0,.3); } 50% { box-shadow: 0 0 0 4px rgba(255,204,0,.1),0 0 18px rgba(255,200,0,.55); } }
        @media (max-width: 768px) { .user-pro-btn { display: inline-flex !important; } }
        @media (max-width: 480px) { .user-balance-chip { min-width: 90px; padding: 7px 10px; } .user-balance-chip span:last-child { display: none; } }
      `}</style>
    </div>
  );
}
