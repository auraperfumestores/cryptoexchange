'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Crown, Check, X, ArrowRight } from '@phosphor-icons/react';
import type { SessionUser } from '@/types';

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

/* ── PRO Benefits Modal ───────────────────────────────────────────────────── */
const PRO_FEATURES = [
  { label: 'Exchange rate',  standard: 'Market rate',              pro: '+0.3% better rate'              },
  { label: 'Daily limit',    standard: '₹1 lakh',                  pro: 'Unlimited'                      },
  { label: 'Settlement',     standard: '10–20 min',                pro: '< 8 min*'                       },
  { label: 'Payout methods', standard: 'UPI · NEFT · RTGS · IMPS',pro: '+ CDM · Cash'                   },
  { label: '24×7 Support',   standard: 'Chat · Email · Telegram',  pro: 'Dedicated manager'              },
  { label: 'CDM access',     standard: false,                      pro: true                             },
  { label: 'Cash deals',     standard: false,                      pro: true                             },
];

const SUPPORT_URL = 'https://wa.me/919999999999';

function ProModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9980,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        maxHeight: '90dvh', overflowY: 'auto',
        background: '#111',
        border: '1px solid rgba(255,210,0,0.2)',
        borderRadius: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,210,0,0.08)',
        animation: 'pro-modal-in 0.28s cubic-bezier(0.34,1.1,0.64,1)',
      }}>

        {/* ── Animated background orbs ── */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,0,0.09) 0%, transparent 65%)', animation: 'pro-orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,160,0,0.06) 0%, transparent 65%)', animation: 'pro-orb2 18s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: 0, left: '-120%', width: '50%', height: '100%', background: 'linear-gradient(105deg, transparent 40%, rgba(255,220,0,0.025) 50%, transparent 60%)', animation: 'pro-scan 10s linear infinite' }} />
        </div>

        {/* ── Gold top bar ── */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, #FFD700 30%, #FFB800 70%, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '22px 24px 28px' }}>

          {/* ── Header row ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,210,0,0.18), rgba(255,150,0,0.1))', border: '1.5px solid rgba(255,210,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Crown size={26} weight="fill" color="#FFD700" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.025em' }}>SwapINR</span>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', color: '#000', background: 'linear-gradient(135deg,#FFD700,#FFB800)', padding: '3px 9px', borderRadius: 99 }}>PRO</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.4 }}>Premium rates · Priority settlement · Exclusive perks</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
              <X size={14} weight="bold" />
            </button>
          </div>

          {/* ── Price strip ── */}
          <div style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(255,210,0,0.07), rgba(255,150,0,0.04))', border: '1px solid rgba(255,210,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 3px' }}>Monthly plan</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: '#FFD700', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'monospace' }}>₹499</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>/mo</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8, lineHeight: 1.4 }}>Everything in Free, plus</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,210,0,0.1)', border: '1px solid rgba(255,210,0,0.25)', fontSize: 10, fontWeight: 800, color: '#FFD700', letterSpacing: '0.04em' }}>
                <Crown size={10} weight="fill" /> Most Popular
              </div>
            </div>
          </div>

          {/* ── Features ── */}
          <div style={{ marginBottom: 18 }}>
            {PRO_FEATURES.map((f, i) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 10 }}>
                {/* Check */}
                <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(255,210,0,0.1)', border: '1px solid rgba(255,210,0,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} weight="bold" color="#FFD700" />
                </div>
                {/* Label */}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', flex: 1, minWidth: 0 }}>{f.label}</span>
                {/* PRO value */}
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFD700', textAlign: 'right', flexShrink: 0 }}>
                  {typeof f.pro === 'boolean' ? <Check size={14} weight="bold" color="#FFD700" /> : f.pro}
                </span>
              </div>
            ))}
          </div>

          {/* ── Exclusive note ── */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'rgba(255,210,0,0.04)', border: '1px solid rgba(255,210,0,0.12)', borderRadius: 12, marginBottom: 22 }}>
            <Crown size={15} weight="fill" color="rgba(255,210,0,0.6)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'rgba(255,210,0,0.7)', margin: 0, lineHeight: 1.65 }}>
              CDM &amp; Cash Deals unlocked for verified PRO members in select cities. Dedicated WhatsApp relationship manager assigned on activation.
            </p>
          </div>

          {/* ── CTA ── */}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 13, background: 'linear-gradient(135deg, #FFD700 0%, #FFB800 100%)', color: '#000', fontSize: 15, fontWeight: 900, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,200,0,0.28)', letterSpacing: '-0.01em' }}
          >
            <Crown size={16} weight="fill" /> Upgrade to PRO · ₹499/month
          </a>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center', margin: '10px 0 0' }}>Contact via WhatsApp to activate instantly</p>

        </div>
      </div>

      <style>{`
        @keyframes pro-modal-in { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pro-orb1    { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-18px,18px) scale(1.1); } }
        @keyframes pro-orb2    { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-14px) scale(1.08); } }
        @keyframes pro-scan    { 0% { left: -120%; } 100% { left: 200%; } }
        @keyframes pro-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pro-pulse   { 0%,100% { box-shadow: 0 0 0 0 rgba(255,204,0,0),0 0 7px rgba(255,200,0,.3); } 50% { box-shadow: 0 0 0 4px rgba(255,204,0,.1),0 0 18px rgba(255,200,0,.55); } }
      `}</style>
    </div>
  );
}

/* ── Main shell ───────────────────────────────────────────────────────────── */
export function UserShell({ user, children }: UserShellProps) {
  const pathname   = usePathname();
  const [dropOpen,    setDropOpen]    = useState(false);
  const [showProModal, setShowProModal] = useState(false);

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

            {/* ── Mobile-only PRO crown button ── */}
            <button
              onClick={() => setShowProModal(true)}
              className="user-pro-btn"
              title="SwapINR PRO"
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
                  <ProBadgeMini />
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
                    <button
                      onClick={() => { setDropOpen(false); setShowProModal(true); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#FFD700', background: 'rgba(255,210,0,0.04)', border: 'none', borderBottom: '1px solid var(--fr-border-subtle)', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 12H13M1 12L3 5L7 8.5L11 2L13 5L13 12H1Z" fill="rgba(255,210,0,0.15)" stroke="#FFD700" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      Upgrade to PRO
                    </button>
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

      {/* ── PRO modal ── */}
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}

      <style>{`
        @keyframes pro-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pro-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,204,0,0),0 0 7px rgba(255,200,0,.3); } 50% { box-shadow: 0 0 0 4px rgba(255,204,0,.1),0 0 18px rgba(255,200,0,.55); } }
        @media (max-width: 768px) { .user-pro-btn { display: inline-flex !important; } }
      `}</style>
    </div>
  );
}
