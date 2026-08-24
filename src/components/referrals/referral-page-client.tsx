'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Copy, WhatsappLogo, TelegramLogo, Users, Clock, CheckCircle, CurrencyDollar } from '@phosphor-icons/react';

interface ReferralsData {
  referralCode: string | null;
  enabled: boolean;
  referrerRewardUsdt: number;
  refereeRewardUsdt: number;
  stats: { totalReferred: number; pending: number; rewarded: number; totalEarnedUsdt: number };
  referrals: { _id: string; name: string; status: 'pending' | 'rewarded' | 'void'; createdAt: string }[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: 'KYC pending', color: 'var(--fr-text-warning)' },
  rewarded: { label: 'Rewarded',    color: 'var(--fr-lime)' },
  void:     { label: 'Void',        color: 'var(--fr-text-tertiary)' },
};

export function ReferralPageClient() {
  const [data, setData] = useState<ReferralsData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referrals').then(r => r.json()).then(json => { if (json.success) setData(json.data); });
  }, []);

  if (!data) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--fr-text-tertiary)', fontSize: 13 }}>Loading…</div>;
  }

  if (!data.enabled) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <Users size={36} color="var(--fr-text-disabled)" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: 'var(--fr-text-secondary)', margin: 0 }}>
          The referral program isn&apos;t active right now — check back soon.
        </p>
      </div>
    );
  }

  const link = data.referralCode && typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${data.referralCode}`
    : '';
  const shareText = `Join me on SwappINR and get $${data.refereeRewardUsdt} USDT when you verify your account! Use my link:`;

  function copyLink() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Referral link copied');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      {/* Hero / link card */}
      <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(204,255,0,0.22)', borderRadius: 'var(--fr-radius-xl)', padding: '28px 24px', background: 'linear-gradient(180deg, rgba(204,255,0,0.06), transparent)' }}>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 6px' }}>
          Earn ${data.referrerRewardUsdt} USDT for every friend you refer
        </h2>
        <p style={{ fontSize: 13, color: 'var(--fr-text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
          {data.refereeRewardUsdt > 0
            ? `Share your link — you get $${data.referrerRewardUsdt} USDT and they get $${data.refereeRewardUsdt} USDT, credited automatically once they complete KYC verification.`
            : `Share your link — you get $${data.referrerRewardUsdt} USDT once your friend completes KYC verification.`}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-md)', padding: '10px 14px' }}>
            <span style={{ fontSize: 13, color: 'var(--fr-text-secondary)', fontFamily: 'var(--fr-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link || '—'}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="fr-btn fr-btn--primary fr-btn--md"
            style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
          >
            {copied ? <CheckCircle size={16} weight="fill" /> : <Copy size={16} weight="bold" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 'var(--fr-radius-md)', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}
          >
            <WhatsappLogo size={16} weight="fill" /> WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 'var(--fr-radius-md)', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', color: '#60A5FA', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}
          >
            <TelegramLogo size={16} weight="fill" /> Telegram
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total referred', value: data.stats.totalReferred, Icon: Users, color: '#60A5FA' },
          { label: 'Awaiting KYC', value: data.stats.pending, Icon: Clock, color: 'var(--fr-text-warning)' },
          { label: 'Rewarded', value: data.stats.rewarded, Icon: CheckCircle, color: 'var(--fr-lime)' },
          { label: 'Total earned', value: `$${data.stats.totalEarnedUsdt.toFixed(2)}`, Icon: CurrencyDollar, color: '#B78FFF' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-lg)', padding: '16px 18px' }}>
            <Icon size={16} color={color} style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', margin: '0 0 3px', fontFamily: 'var(--fr-font-mono)' }}>{value}</p>
            <p style={{ fontSize: 11, color, margin: 0, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fr-border-subtle)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', margin: 0 }}>Your referrals</p>
        </div>
        {data.referrals.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>No referrals yet — share your link to get started!</p>
          </div>
        ) : (
          data.referrals.map((r, i) => {
            const s = STATUS_LABEL[r.status];
            return (
              <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < data.referrals.length - 1 ? '1px solid var(--fr-border-subtle)' : 'none' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fr-text-primary)' }}>{r.name}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: s.color }}>{s.label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
