'use client';

import { useEffect, useState } from 'react';
import { Users, Check, X, Copy, WhatsappLogo, TelegramLogo, ShareNetwork } from '@phosphor-icons/react';

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

  async function nativeShare() {
    if (!link) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'SwappINR Referral', text: shareText, url: link }); return; } catch { /* cancelled */ }
    }
    copyLink();
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
      <div style={{ padding: '26px 20px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,rgba(204,255,0,0.2),rgba(154,217,0,0.1))', border: `1.5px solid ${T.limeBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={22} weight="fill" color={T.lime} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 17, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: T.text }}>
                Refer &amp; <span style={{ color: T.lime }}>Earn</span>
              </p>
              <p style={{ fontSize: 11.5, color: T.sub, margin: '3px 0 0', fontWeight: 500 }}>Invite friends, earn USDT together</p>
            </div>
          </div>
          {closeBtn}
        </div>

        {/* Reward split */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '16px 14px', background: T.card2, border: `1px solid ${T.limeBdr}`, borderRadius: 16, textAlign: 'center' }}>
            <div aria-hidden style={{ position: 'absolute', top: -34, right: -34, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(204,255,0,0.12) 0%,transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.lime, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'monospace' }}>${rAmt.toFixed(2)}</div>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.dim, margin: '7px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>You get</p>
            </div>
          </div>
          {fAmt > 0 && (
            <div style={{ flex: 1, padding: '16px 14px', background: T.card2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.success, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'monospace' }}>${fAmt.toFixed(2)}</div>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.dim, margin: '7px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>They get</p>
            </div>
          )}
        </div>
        <p style={{ fontSize: 10.5, color: T.dim, textAlign: 'center', margin: '10px 0 0', lineHeight: 1.6 }}>
          Credited automatically once your friend completes KYC verification.
        </p>
      </div>

      {/* ── Your link ── */}
      <div style={{ padding: '0 20px 18px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.sub, margin: '0 0 9px' }}>Your referral link</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: T.card2, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {link || '—'}
          </span>
          <button
            onClick={copyLink}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.12)'}`, color: copied ? T.success : T.sub, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {copied ? <><Check size={11} weight="bold" />Copied</> : <><Copy size={11} weight="bold" />Copy</>}
          </button>
        </div>

        {/* Share row — big tap targets for mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 6px', borderRadius: 12, background: 'rgba(37,211,102,0.09)', border: '1px solid rgba(37,211,102,0.28)', color: '#25D366', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}
          >
            <WhatsappLogo size={16} weight="fill" />WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 6px', borderRadius: 12, background: 'rgba(0,136,204,0.09)', border: '1px solid rgba(0,136,204,0.28)', color: '#29B6F6', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}
          >
            <TelegramLogo size={16} weight="fill" />Telegram
          </a>
          <button
            onClick={nativeShare}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 6px', borderRadius: 12, background: T.limeBg, border: `1px solid ${T.limeBdr}`, color: T.lime, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          >
            <ShareNetwork size={16} weight="fill" />Share
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Referred',   value: String(stats.totalReferred), color: T.text },
            { label: 'Pending',    value: String(stats.pending),       color: T.warn },
            { label: 'Rewarded',   value: String(stats.rewarded),      color: T.success },
            { label: 'Earned',     value: `$${stats.totalEarnedUsdt.toFixed(2)}`, color: T.lime },
          ].map(s => (
            <div key={s.label} style={{ padding: '13px 14px', background: T.card2, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13 }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: s.color, fontFamily: 'monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.dim, margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── History ── */}
      {data.referrals.length > 0 && (
        <div style={{ padding: '0 20px 18px' }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.sub, margin: '0 0 9px' }}>Your referrals</p>
          <div style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', maxHeight: 168, overflowY: 'auto' }}>
            {data.referrals.map((r, i) => {
              const cfg = STATUS_CFG[r.status];
              return (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', background: i % 2 ? T.card2 : T.card, borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── How it works ── */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ padding: '13px 16px', background: T.limeBg, border: `1px solid ${T.limeBdr}`, borderRadius: 13 }}>
          <p style={{ fontSize: 11, color: T.lime, margin: '0 0 6px', fontWeight: 800 }}>How it works</p>
          <p style={{ fontSize: 10.5, color: 'rgba(204,255,0,0.6)', margin: 0, lineHeight: 1.7 }}>
            Share your link → your friend signs up through it → they complete KYC → you both get paid instantly. No limit on referrals.
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: '0 20px 24px' }}>
        <button
          onClick={copyLink}
          style={{ width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg,#CCFF00 0%,#9AD900 100%)', color: '#000', fontSize: 14.5, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 6px 20px rgba(204,255,0,0.22)', letterSpacing: '-0.01em' }}
        >
          {copied ? <><Check size={16} weight="bold" />Link Copied!</> : <><Copy size={16} weight="bold" />Copy My Referral Link</>}
        </button>
      </div>
    </div>
  );
}
