'use client';

import { useEffect, useState } from 'react';
import { Users, Check, X, Copy, WhatsappLogo, TelegramLogo } from '@phosphor-icons/react';

interface ReferralsData {
  referralCode: string | null;
  enabled: boolean;
  referrerRewardUsdt: number;
  refereeRewardUsdt: number;
  stats: { totalReferred: number; pending: number; rewarded: number; totalEarnedUsdt: number };
  referrals: { _id: string; name: string; status: 'pending' | 'rewarded' | 'void'; createdAt: string }[];
}

/* ── Design tokens — mirrors pro-upgrade-modal, lime accent ── */
const T = {
  bg:      '#0c0c0c',
  card:    '#141414',
  card2:   '#181818',
  border:  'rgba(204,255,0,0.15)',
  text:    '#fff',
  sub:     'rgba(255,255,255,0.5)',
  dim:     'rgba(255,255,255,0.28)',
  lime:    '#CCFF00',
  limeBg:  'rgba(204,255,0,0.07)',
  limeBdr: 'rgba(204,255,0,0.18)',
  success: '#4ADE80',
  warn:    '#FBBF24',
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'KYC pending', color: T.warn },
  rewarded: { label: 'Rewarded',    color: T.lime },
  void:     { label: 'Void',        color: T.dim  },
};

function Bars({ color = T.lime }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 3, height: 14, borderRadius: 99, background: color, transformOrigin: 'center', animation: `rm-bar 0.75s ease-in-out ${i * 0.13}s infinite` }} />
      ))}
    </div>
  );
}

export function ReferralModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referrals')
      .then(r => r.json())
      .then(json => { if (json.success) setData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const link = data?.referralCode && typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${data.referralCode}`
    : '';
  const shareText = data ? `Join me on SwappINR and get $${data.refereeRewardUsdt} USDT when you verify your account! Use my link:` : '';

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  /* ── Shell ── */
  const shell = (content: React.ReactNode) => (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      <div style={{ width: '100%', maxWidth: 440, maxHeight: '94dvh', overflowY: 'auto', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 28, position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(204,255,0,0.06)', animation: 'rm-in 0.28s cubic-bezier(0.34,1.1,0.64,1)' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(204,255,0,0.09) 0%,transparent 65%)', animation: 'rm-orb1 14s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -70, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(154,217,0,0.06) 0%,transparent 65%)', animation: 'rm-orb2 18s ease-in-out infinite' }} />
        </div>
        <div style={{ height: 3, borderRadius: '28px 28px 0 0', background: 'linear-gradient(90deg,transparent,#CCFF00 25%,#E5FF66 50%,#9AD900 75%,transparent)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{content}</div>
      </div>
      <style>{`
        @keyframes rm-in   { from{opacity:0;transform:scale(0.93) translateY(10px)} to{opacity:1;transform:none} }
        @keyframes rm-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,20px) scale(1.1)} }
        @keyframes rm-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(16px,-16px) scale(1.08)} }
        @keyframes rm-bar  { 0%,100%{transform:scaleY(.3);opacity:.3} 50%{transform:scaleY(1);opacity:1} }
      `}</style>
    </div>
  );

  const closeBtn = (
    <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: T.dim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <X size={14} weight="bold" />
    </button>
  );

  if (loading) return shell(
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
      <Bars />
    </div>
  );

  if (!data?.enabled) return shell(
    <div style={{ padding: '26px 24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} weight="fill" color={T.dim} />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: T.text }}>Refer &amp; Earn</p>
            <p style={{ fontSize: 11.5, color: T.sub, margin: '3px 0 0' }}>Currently unavailable</p>
          </div>
        </div>
        {closeBtn}
      </div>
      <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, margin: '0 0 20px' }}>
        The referral program isn&apos;t active right now. Check back soon — we&apos;ll let you know when it launches.
      </p>
      <button onClick={onClose} style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Close
      </button>
    </div>
  );

  const { referrerRewardUsdt: rAmt, refereeRewardUsdt: fAmt, stats } = data;

  return shell(
    <div>
      {/* ── Hero ── */}
      <div style={{ padding: '18px 18px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,rgba(204,255,0,0.2),rgba(154,217,0,0.1))', border: `1.5px solid ${T.limeBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={19} weight="fill" color={T.lime} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: T.text }}>
                Refer &amp; <span style={{ color: T.lime }}>Earn</span>
              </p>
              <p style={{ fontSize: 11, color: T.sub, margin: '2px 0 0', fontWeight: 500 }}>Invite friends, earn USDT together</p>
            </div>
          </div>
          {closeBtn}
        </div>

        {/* Reward split */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '11px 10px', background: T.card2, border: `1px solid ${T.limeBdr}`, borderRadius: 13, textAlign: 'center' }}>
            <div aria-hidden style={{ position: 'absolute', top: -34, right: -34, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(204,255,0,0.12) 0%,transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 21, fontWeight: 900, color: T.lime, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'monospace' }}>${rAmt.toFixed(2)}</div>
              <p style={{ fontSize: 9, fontWeight: 700, color: T.dim, margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>You get</p>
            </div>
          </div>
          {fAmt > 0 && (
            <div style={{ flex: 1, padding: '11px 10px', background: T.card2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13, textAlign: 'center' }}>
              <div style={{ fontSize: 21, fontWeight: 900, color: T.success, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'monospace' }}>${fAmt.toFixed(2)}</div>
              <p style={{ fontSize: 9, fontWeight: 700, color: T.dim, margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>They get</p>
            </div>
          )}
        </div>
        <p style={{ fontSize: 10, color: T.dim, textAlign: 'center', margin: '8px 0 0', lineHeight: 1.5 }}>
          Credited automatically once your friend completes KYC verification.
        </p>
      </div>

      {/* ── Your link ── */}
      <div style={{ padding: '0 18px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.sub, margin: '0 0 7px' }}>Your referral link</p>

        {/* Full link wraps rather than truncating — users need to read/verify it */}
        <div style={{ padding: '10px 12px', background: T.card2, border: `1px solid ${T.limeBdr}`, borderRadius: 11, marginBottom: 7 }}>
          <span style={{ display: 'block', fontSize: 11, fontFamily: 'monospace', color: link ? T.lime : T.dim, wordBreak: 'break-all', lineHeight: 1.5 }}>
            {link || 'Generating your link…'}
          </span>
        </div>

        {/* Share row — big tap targets for mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
          <button
            onClick={copyLink}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 4px', borderRadius: 11, background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`, color: copied ? T.success : T.sub, fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}
          >
            {copied ? <><Check size={14} weight="bold" />Copied</> : <><Copy size={14} weight="bold" />Copy</>}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 4px', borderRadius: 11, background: 'rgba(37,211,102,0.09)', border: '1px solid rgba(37,211,102,0.28)', color: '#25D366', fontSize: 11.5, fontWeight: 800, textDecoration: 'none' }}
          >
            <WhatsappLogo size={14} weight="fill" />WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 4px', borderRadius: 11, background: 'rgba(0,136,204,0.09)', border: '1px solid rgba(0,136,204,0.28)', color: '#29B6F6', fontSize: 11.5, fontWeight: 800, textDecoration: 'none' }}
          >
            <TelegramLogo size={14} weight="fill" />Telegram
          </a>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ padding: '0 18px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { label: 'Referred', value: String(stats.totalReferred), color: T.text },
            { label: 'Pending',  value: String(stats.pending),       color: T.warn },
            { label: 'Rewarded', value: String(stats.rewarded),      color: T.success },
            { label: 'Earned',   value: `$${stats.totalEarnedUsdt.toFixed(0)}`, color: T.lime },
          ].map(s => (
            <div key={s.label} style={{ padding: '9px 6px', background: T.card2, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 11, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <p style={{ fontSize: 8.5, fontWeight: 700, color: T.dim, margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── History ── */}
      {data.referrals.length > 0 && (
        <div style={{ padding: '0 18px 12px' }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.sub, margin: '0 0 7px' }}>Your referrals</p>
          <div style={{ borderRadius: 11, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', maxHeight: 116, overflowY: 'auto' }}>
            {data.referrals.map((r, i) => {
              const cfg = STATUS_CFG[r.status];
              return (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', background: i % 2 ? T.card2 : T.card, borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div style={{ padding: '0 18px 18px' }}>
        <p style={{ fontSize: 10, color: T.dim, margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
          Share your link → friend signs up → they complete KYC → you both get paid. No limit on referrals.
        </p>
      </div>
    </div>
  );
}
