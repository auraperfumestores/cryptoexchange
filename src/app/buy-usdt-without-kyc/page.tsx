import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Buy USDT Without KYC Delays — 5-Min Verification, Pay via UPI India',
  description: 'Buy USDT with INR or UPI with the fastest KYC in India — 5 minutes, done once forever. No repeated verification. Instant USDT delivery after your first trade. Legal & secure.',
  alternates: { canonical: '/buy-usdt-without-kyc' },
  keywords: [
    'buy usdt without kyc', 'buy usdt with inr without kyc', 'buy usdt with upi without kyc',
    'buy usdt no kyc india', 'buy usdt minimum kyc india', 'buy usdt fast kyc india',
    'buy tether without kyc india', 'purchase usdt no verification india',
    'buy usdt india without kyc', 'buy usdt instant india',
  ],
  openGraph: {
    title: 'Buy USDT Without KYC Hassle — 5-Min One-Time Verification | SwappINR',
    description: 'KYC in 5 minutes. Done once. Buy USDT with UPI or bank transfer instantly on every trade after.',
    url: 'https://www.swappinr.com/buy-usdt-without-kyc',
  },
};

const WHY_KYC_REQUIRED = [
  {
    title: 'FEMA & PMLA apply to USDT purchases too',
    body: 'Buying USDT with INR is classified as a Virtual Digital Asset (VDA) transaction under Indian law. Both FEMA and PMLA require the purchasing platform to verify identity before processing any INR-to-crypto conversion — buying is no different from selling.',
  },
  {
    title: 'Your UPI account is already KYC-verified',
    body: 'When you pay via UPI, IMPS, or bank transfer, your bank has already done their own KYC on you. A platform that skips its own KYC while accepting your UPI payments creates a regulatory gap — platforms caught doing this face RBI action and user accounts can be flagged.',
  },
  {
    title: 'Unregulated platforms block withdrawals',
    body: 'The most common complaint pattern with "no KYC" crypto platforms: you can deposit INR and "buy" USDT, but withdrawal is blocked or delayed indefinitely. The platform uses KYC as a gate only when you want to take money out — or disappears entirely.',
  },
  {
    title: 'Legal enforcement is active in India',
    body: 'RBI has blocked payment gateways of multiple unregulated crypto platforms since 2022. Users on those platforms lost access to funds with no recourse. PMLA prosecutions of no-KYC crypto operators have also increased. The risk to you as a user is real and growing.',
  },
];

const SWAPPINR_KYC = [
  { icon: '⏱️', title: '5 minutes to complete KYC', body: 'Take photos of your Aadhaar or PAN card and record a 10-second selfie video. The entire process takes under 5 minutes on any smartphone.' },
  { icon: '✅', title: 'Approved once, buy forever',   body: 'After your first approval, every subsequent USDT purchase is instant. No verification, no waiting, no re-submission — ever. Buy USDT as many times as you want.' },
  { icon: '⚡', title: 'Fast approval 24/7',          body: 'KYC is processed around the clock. Most submissions are approved within 30 minutes, many instantly during business hours — including weekends and public holidays.' },
  { icon: '🔒', title: 'Documents encrypted & secure', body: 'Your KYC data is encrypted with AES-256 and held solely for FEMA/PMLA compliance. We never sell, share, or use your documents for any purpose beyond regulatory requirements.' },
  { icon: '📱', title: '100% mobile, no branch visit', body: 'The entire verification happens on your phone. No printing, no couriering documents, no visiting an office. Just your phone camera and 5 minutes of your time.' },
  { icon: '🇮🇳', title: 'FEMA-compliant purchase history', body: 'Every USDT purchase is recorded. You can download your full transaction history for ITR filing and income tax compliance. We handle the regulatory side so you can focus on trading.' },
];

const COMPARE = [
  { platform: 'SwappINR',                  kyc: '5 min, once forever',       risk: 'None — FEMA compliant',     delivery: 'Under 30 min after KYC',  verdict: '✅ Recommended' },
  { platform: 'WazirX / CoinDCX',          kyc: '24–72 hrs initial',          risk: 'Low — regulated',           delivery: '30 min–2 hrs after KYC', verdict: '✅ Safe, slower' },
  { platform: 'P2P without KYC',           kyc: 'Partial or none',            risk: 'High — no guarantees',      delivery: 'Depends on counterparty', verdict: '⚠️ Risky' },
  { platform: 'Unregulated no-KYC exchanges', kyc: 'None',                   risk: 'Scam risk — no recourse',   delivery: 'Unknown',                verdict: '🔴 Avoid' },
];

const STEPS = [
  { n: '01', title: 'Create your SwappINR account', body: 'Sign up free with your email address. No deposit, no payment card required to create an account.' },
  { n: '02', title: 'Complete 5-minute KYC on your phone', body: 'Open the KYC flow. Photograph your Aadhaar or PAN card front and back. Record a quick 10-second selfie video. Submit. Done.' },
  { n: '03', title: 'Get approved (usually < 30 min)', body: 'Our system reviews your KYC. Most approvals come through in under 30 minutes. You\'ll receive an email and in-app notification when you\'re verified.' },
  { n: '04', title: 'Place a buy order — choose your network', body: 'Select BEP-20 (lowest fee), TRC-20, or ERC-20. Enter your USDT amount. Provide your wallet address. Review the exact INR cost and confirm.' },
  { n: '05', title: 'Pay via UPI — receive USDT in minutes', body: 'Pay the INR amount via UPI, IMPS, or bank transfer. USDT arrives in your wallet within 30 minutes of payment confirmation. All future buys skip straight to this step.' },
];

const PAYMENT_METHODS = [
  { method: 'UPI',         apps: 'GPay, PhonePe, Paytm, BHIM, any UPI app', time: 'Instant confirmation',  limit: 'Up to ₹1 lakh/day per UPI ID' },
  { method: 'IMPS',        apps: 'Net banking / bank app',                  time: 'Under 2 hours',         limit: 'Up to ₹5 lakh per transfer' },
  { method: 'NEFT',        apps: 'Net banking (business hours)',             time: '2–4 hours',             limit: 'No upper limit' },
  { method: 'RTGS',        apps: 'Net banking (₹2 lakh+)',                  time: 'Same day',              limit: 'Minimum ₹2 lakh' },
];

const FAQ_ITEMS = [
  {
    q: 'Can I buy USDT without KYC in India?',
    a: 'No — Indian law (FEMA and PMLA) requires all platforms that process INR-to-USDT transactions to verify user identity. Any platform claiming to sell USDT without any KYC is either operating outside Indian law or is a scam. SwappINR\'s KYC takes 5 minutes and is done exactly once — after that every USDT purchase is instant.',
  },
  {
    q: 'Can I buy USDT with UPI without KYC?',
    a: 'The USDT exchange KYC and your UPI KYC are separate things. Your UPI account is already KYC-verified by your bank. SwappINR still needs its own one-time KYC as required by FEMA and PMLA. But after our 5-minute verification, you can buy USDT with any UPI app (GPay, PhonePe, Paytm, BHIM) instantly on every trade.',
  },
  {
    q: 'How long does KYC take on SwappINR to buy USDT?',
    a: 'Submission takes under 5 minutes. Approval usually completes within 30 minutes — often much faster during business hours. After your first approval, every subsequent USDT purchase requires no verification at all.',
  },
  {
    q: 'What documents do I need to buy USDT on SwappINR?',
    a: 'You need either an Aadhaar card or a PAN card, and a smartphone with a working front-facing camera for the selfie video. No physical documents to scan or post, no office visit required.',
  },
  {
    q: 'Is it safe to buy USDT from a platform that requires KYC?',
    a: 'Yes — KYC is the sign of a legitimate, regulated platform. SwappINR stores your KYC data encrypted with AES-256 and uses it only for FEMA/PMLA compliance. We never share or sell it. An exchange that doesn\'t require KYC has no regulatory accountability — that\'s a warning sign, not a feature.',
  },
  {
    q: 'Can I buy USDT with INR after one-time KYC on SwappINR?',
    a: 'Yes — permanently and instantly. After your first 5-minute KYC is approved, you can buy USDT with INR, UPI, or bank transfer on every future trade without any additional verification. KYC on SwappINR is genuinely a one-time process.',
  },
  {
    q: 'What happens if I try to buy USDT from a no-KYC exchange?',
    a: 'Common risks: the platform may block your INR withdrawal or USDT delivery pending "enhanced verification" (effectively holding your money hostage), the platform may be a scam that disappears, or your bank account can be flagged for transferring money to an unregulated entity. There\'s no legal recourse if something goes wrong.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function BuyUsdtWithoutKycPage() {
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
      { '@type': 'ListItem', position: 2, name: 'Buy USDT with INR', item: `${SITE_URL}/buy-usdt-with-inr` },
      { '@type': 'ListItem', position: 3, name: 'KYC Guide', item: `${SITE_URL}/buy-usdt-without-kyc` },
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
          ⚡ 5-min KYC once → buy USDT with UPI forever
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Buy USDT with UPI — 5-Min KYC,<br />
          <span style={{ color: '#CCFF00' }}>Done Once. Instant Purchases Forever.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 16px' }}>
          KYC is legally required to buy USDT with INR in India — but SwappINR makes it the fastest it can possibly be. 5 minutes on your phone. Approved once. Every USDT purchase with UPI, IMPS, or bank transfer after that is instant, no verification ever again.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 36px' }}>
          Platforms claiming &ldquo;no KYC, buy USDT instantly&rdquo; are either scams or block your withdrawal once you want to take money out. This is the honest alternative.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { v: '5 min',  l: 'KYC submission'      },
            { v: '< 30 min', l: 'Approval time'      },
            { v: '1×',     l: 'Do it once ever'     },
            { v: 'Instant', l: 'All trades after KYC'},
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#CCFF00', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
          Start KYC — Takes 5 Minutes →
        </Link>
      </section>

      {/* ── Why KYC required ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why KYC is required to buy USDT in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Indian law — not a platform choice.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {WHY_KYC_REQUIRED.map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: '20px 22px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#F87171', marginBottom: 10 }}>⚠️ The &ldquo;no KYC buy USDT&rdquo; trap</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
              A common fraud pattern in India: platforms let you deposit INR and &ldquo;buy&rdquo; USDT with no upfront verification. When you try to withdraw your USDT, they ask for KYC — and either reject it, ignore you, or disappear. Your INR is gone. The correct reading is: legitimate platforms do KYC upfront. Anyone who skips it upfront is hiding something.
            </p>
          </div>
        </div>
      </section>

      {/* ── SwappINR KYC benefits ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>SwappINR KYC — the fastest legal USDT purchase in India</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything that makes the one-time verification painless.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {SWAPPINR_KYC.map(({ icon, title, body }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px', display: 'flex', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 7, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>From zero to buying USDT in 5 steps</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>First buy includes KYC. All future buys skip straight to step 4.</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: i === 0 ? '#CCFF00' : i === 4 ? 'rgba(0,229,160,0.15)' : 'rgba(204,255,0,0.07)', border: i === 0 ? 'none' : i === 4 ? '1px solid rgba(0,229,160,0.3)' : '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : i === 4 ? '#00E5A0' : '#CCFF00', fontFamily: 'var(--fr-font-mono)' }}>
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.06)', marginTop: 6 }} />}
                </div>
                <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>{s.title}</h3>
                    {i === 1 && <span style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>ONCE ONLY</span>}
                    {i === 4 && <span style={{ background: 'rgba(0,229,160,0.1)', color: '#00E5A0', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>ALL FUTURE BUYS START HERE</span>}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment methods ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Payment methods to buy USDT with INR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>All payment methods are free — no deposit or withdrawal fee on SwappINR.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Payment method', 'Supported apps / banks', 'Confirmation time', 'Daily limit'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENT_METHODS.map(({ method, apps, time, limit }, ri) => (
                <tr key={method} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                  <td style={{ padding: '13px 14px', fontWeight: 700, color: '#CCFF00' }}>{method}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{apps}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{time}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Platform comparison ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Comparing platforms to buy USDT in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>KYC requirements and risk across your options.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Platform', 'KYC process', 'Risk level', 'USDT delivery', 'Verdict'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(({ platform, kyc, risk, delivery, verdict }, ri) => (
                  <tr key={platform} style={{ background: ri === 0 ? 'rgba(204,255,0,0.04)' : ri % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: ri === 0 ? '#CCFF00' : 'rgba(255,255,255,0.7)' }}>{platform}</td>
                    <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{kyc}</td>
                    <td style={{ padding: '13px 14px', color: ri === 0 ? '#00E5A0' : ri === 1 ? '#00E5A0' : ri === 2 ? '#FBBF24' : '#F87171', fontSize: 12, fontWeight: 700 }}>{risk}</td>
                    <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{delivery}</td>
                    <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 700 }}>{verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>5 minutes of KYC. Then buy USDT with UPI forever.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
            Create your free account. Do KYC once on your phone. Buy USDT instantly with GPay, PhonePe, Paytm, or bank transfer — as many times as you want, forever.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Start KYC Now — Free →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.24)', marginTop: 14 }}>No credit card. No deposit. KYC takes 5 minutes.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>KYC for buying USDT in India — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything about KYC and buying USDT with INR or UPI.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <summary style={{ fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', listStyle: 'none' }}>{q}</summary>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, margin: '12px 0 0' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['Buy USDT with INR',        '/buy-usdt-with-inr'        ],
            ['Buy USDT with UPI',        '/buy-usdt-with-upi'        ],
            ['Sell USDT for INR',        '/sell-usdt-for-inr'        ],
            ['Sell USDT KYC guide',      '/sell-usdt-without-kyc'    ],
            ['USDT to INR calculator',  '/usdt-to-inr-calculator'   ],
            ['SwappINR fees',           '/fees'                     ],
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
