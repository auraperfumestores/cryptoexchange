import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';
import { connectToDatabase, getReferralSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Referral Program — Earn USDT for Every Friend You Invite | SwappINR',
  description: 'Invite friends to SwappINR and earn USDT when they complete identity verification. Your friend gets a welcome bonus too. No limit on how many friends you can refer.',
  alternates: { canonical: '/referral-program' },
  keywords: ['SwappINR referral program', 'earn USDT referral', 'crypto exchange referral India', 'refer and earn USDT', 'SwappINR invite friends'],
  openGraph: {
    title: 'SwappINR Referral Program — Earn USDT for Every Friend',
    description: 'Share your link. Your friend verifies their account. You both get paid in USDT.',
    url: 'https://www.swappinr.in/referral-program',
  },
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.in';

export default async function ReferralProgramPage() {
  await connectToDatabase();
  const settings = await getReferralSettings();
  const referrerAmount = settings.referrerRewardUsdt;
  const refereeAmount = settings.refereeRewardUsdt;

  const STEPS = [
    { n: '01', title: 'Get your link', body: 'Create a free SwappINR account (or sign in if you already have one) and grab your personal referral link from your profile page.' },
    { n: '02', title: 'Share it', body: 'Send it to friends over WhatsApp, Telegram, or anywhere else — there is no limit on how many people you can invite.' },
    { n: '03', title: 'They verify', body: 'Your friend signs up through your link and completes SwappINR’s standard identity verification (KYC) — a one-time, ~2-minute process.' },
    { n: '04', title: 'You both get paid', body: `The moment their KYC is approved, $${referrerAmount.toFixed(2)} USDT lands in your wallet${refereeAmount > 0 ? ` and $${refereeAmount.toFixed(2)} USDT lands in theirs` : ''} — automatically, no claim required.` },
  ];

  const FAQ_ITEMS = [
    {
      q: 'How much do I earn per referral?',
      a: `You earn $${referrerAmount.toFixed(2)} USDT for every friend who signs up through your link and completes identity verification.${refereeAmount > 0 ? ` They receive a $${refereeAmount.toFixed(2)} USDT welcome bonus at the same time.` : ''} There is no cap on how many friends you can refer.`,
    },
    {
      q: 'When does the reward get credited?',
      a: 'The reward is credited automatically the moment your referred friend’s KYC (identity verification) is approved by our team — usually within a few hours of submission. No manual claim is needed.',
    },
    {
      q: 'Where do I find my referral link?',
      a: 'Sign in to your SwappINR account, open your Profile page, and tap “Get My Link” in the Refer & Earn section. Your unique link, share buttons, and live stats (referred, pending, rewarded, total earned) are all in one place.',
    },
    {
      q: 'Does my friend need to trade for me to get paid?',
      a: 'No. The reward is tied to identity verification (KYC) being approved, not to placing a trade. Your friend just needs to sign up through your link and complete the standard verification process.',
    },
    {
      q: 'Where does my reward go?',
      a: 'Straight to your SwappINR platform wallet balance, labelled clearly as a referral bonus in your transaction history. From there you can use it toward a trade or withdraw it like any other balance.',
    },
    {
      q: 'Can I refer someone who already has a SwappINR account?',
      a: 'No — referral rewards only apply to brand-new accounts created through your link. Each person can only ever be linked to one referrer, set permanently the moment they register.',
    },
  ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Referral Program', item: `${SITE_URL}/referral-program` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SeoNav />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          🎁 Refer & Earn — No limit on referrals
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Earn <span style={{ color: '#CCFF00' }}>${referrerAmount.toFixed(2)} USDT</span><br />
          for every friend you invite
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 36px' }}>
          Share your link. Your friend verifies their account.{refereeAmount > 0 ? ` They get $${refereeAmount.toFixed(2)} USDT and you get $${referrerAmount.toFixed(2)} USDT` : ` You get $${referrerAmount.toFixed(2)} USDT`} — credited automatically to your SwappINR wallet.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
            Create Free Account →
          </Link>
          <Link href="/login" className="fr-btn fr-btn--ghost fr-btn--lg">
            Already have an account? Get my link
          </Link>
        </div>
      </section>

      {/* ── Reward cards ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1 1 260px', background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', marginBottom: 6 }}>${referrerAmount.toFixed(2)}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>You earn (the referrer)</div>
          </div>
          {refereeAmount > 0 && (
            <div style={{ flex: '1 1 260px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#00E5A0', fontFamily: 'var(--fr-font-mono)', marginBottom: 6 }}>${refereeAmount.toFixed(2)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Your friend earns (the referee)</div>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>Both credited automatically the moment your friend&apos;s KYC is approved.</p>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How it works</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Four steps, fully automatic — no forms to fill in, no reward to claim.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.title}</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Your friends are already trading USDT somewhere</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            Might as well be on SwappINR — where you both get paid for it. Create your account and your referral link is ready in seconds.
          </p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--md">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Referral Program FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything you need to know about earning with SwappINR.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="fr-faq-item">
              <summary>{q}<div className="fr-faq-icon"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></summary>
              <p className="fr-faq-body">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Related</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['Fees', '/fees'],
            ['Sell USDT for INR', '/sell-usdt-for-inr'],
            ['Buy USDT with INR', '/buy-usdt-with-inr'],
            ['USDT to INR calculator', '/usdt-to-inr-calculator'],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99, fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 600 }}>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <SeoFooter />
    </div>
  );
}
