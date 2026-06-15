'use client';

import { signOut } from 'next-auth/react';

interface User { name: string; email: string; role: string; createdAt?: string }

const T = {
  card:   'rgba(255,255,255,0.045)',
  card2:  'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#FFFFFF',
  sub:    'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.28)',
  green:  '#00E5A0',
  blue:   '#4D9FFF',
  cyan:   '#00D4FF',
};

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: T.text, margin: 0 }}>{title}</h2>
        {desc && <p style={{ fontSize: 13, color: T.sub, margin: '3px 0 0', lineHeight: 1.5 }}>{desc}</p>}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

export function ProfileContent({ user }: { user: User }) {
  const initial = user.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.03em' }}>Profile</h1>
        <p style={{ margin: '5px 0 0', fontSize: 14, color: T.dim }}>Your account details and preferences</p>
      </div>

      {/* ── Avatar hero card ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(26,63,255,0.18) 0%,rgba(107,33,255,0.12) 100%)',
        border: '1px solid rgba(26,63,255,0.25)',
        borderRadius: 20, padding: '28px 28px',
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#1A3FFF,#6B21FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: '#fff',
          boxShadow: '0 8px 24px rgba(26,63,255,0.55)',
          border: '3px solid rgba(255,255,255,0.12)',
        }}>
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: '0 0 4px', letterSpacing: '-0.03em' }}>{user.name}</h2>
          <p style={{ fontSize: 14, color: T.sub, margin: '0 0 12px' }}>{user.email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(0,229,160,0.12)', color: T.green, border: '1px solid rgba(0,229,160,0.22)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
              Email verified
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(77,159,255,0.1)', color: T.blue, border: '1px solid rgba(77,159,255,0.2)' }}>
              {user.role === 'admin' ? '⚙ Admin' : '👤 Member'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Account details ── */}
      <Section title="Account Details" desc="Your personal information on file.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { label: 'Full Name',      value: user.name },
            { label: 'Email Address',  value: user.email },
            { label: 'Account Type',   value: 'Individual' },
            { label: 'KYC Status',     value: 'Standard', accent: T.blue },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.dim }}>{label}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: accent ?? T.text }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Exchange limits ── */}
      <Section title="Exchange Limits" desc="Your current transaction limits based on KYC level.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Per transaction', value: '₹10,00,000', sub: 'Max per single order',  color: T.green },
            { label: 'Daily limit',     value: '₹2,00,000',  sub: 'Standard KYC limit',    color: T.blue  },
            { label: 'Monthly limit',   value: '₹50,00,000', sub: 'Standard KYC limit',    color: T.cyan  },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: T.card2, borderRadius: 12, border: `1px solid ${T.border}` }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{sub}</p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: T.dim, lineHeight: 1.6, margin: '4px 0 0' }}>
            Need higher limits? Contact support for full KYC to unlock up to ₹50L per transaction.
          </p>
        </div>
      </Section>

      {/* ── Security ── */}
      <Section title="Security" desc="Protect your SwapINR account.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4.5V8C2 11.3 4.7 14.3 8 15C11.3 14.3 14 11.3 14 8V4.5L8 1.5Z" fill="rgba(0,229,160,0.2)" stroke={T.green} strokeWidth="1.2" strokeLinejoin="round"/><path d="M5.5 8L7 9.5L10.5 6" stroke={T.green} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              bg: 'rgba(0,229,160,0.1)', border: 'rgba(0,229,160,0.2)',
              label: 'Email verification', sub: 'Your email is verified and active',
              right: <span style={{ fontSize: 11, fontWeight: 700, color: T.green, background: 'rgba(0,229,160,0.1)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(0,229,160,0.2)' }}>Active</span>,
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke={T.blue} strokeWidth="1.3"/><path d="M5.5 7V5C5.5 3.6 6.6 2.5 8 2.5C9.4 2.5 10.5 3.6 10.5 5V7" stroke={T.blue} strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="10.5" r="1" fill={T.blue}/></svg>,
              bg: 'rgba(77,159,255,0.1)', border: 'rgba(77,159,255,0.2)',
              label: 'Password', sub: 'Keep a strong, unique password',
              right: <button style={{ fontSize: 12, fontWeight: 700, color: T.blue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Change →</button>,
            },
          ].map(({ icon, bg, border, label, sub, right }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: T.card2, borderRadius: 12, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: T.dim, margin: '2px 0 0' }}>{sub}</p>
                </div>
              </div>
              {right}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Support ── */}
      <Section title="Support & About">
        <p style={{ fontSize: 14, color: T.sub, margin: '0 0 16px', lineHeight: 1.7 }}>
          <strong style={{ color: T.text }}>SwapINR</strong> is a peer-to-peer USDT ↔ INR exchange. All INR settlements happen via UPI, IMPS, NEFT, or cash. Your USDT is held in on-chain escrow until settlement is confirmed.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[['💬', 'WhatsApp'], ['✉️', 'Email'], ['❓', 'FAQ']].map(([emoji, label]) => (
            <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: T.card2, border: `1px solid ${T.border}`, color: T.sub, cursor: 'pointer' }}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Sign out ── */}
      <div style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.14)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F87171', margin: 0 }}>Sign out</p>
          <p style={{ fontSize: 12, color: T.dim, margin: '3px 0 0' }}>You'll need to log in again to access your account.</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#F87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer' }}
        >
          Sign out →
        </button>
      </div>

    </div>
  );
}
