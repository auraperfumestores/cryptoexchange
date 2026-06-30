import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Sell USDT Without KYC Delays — 5-Min One-Time Verification India',
  description: 'Sell USDT to INR with the fastest KYC in India — 5 minutes, done once, never again. No repeated verification. Instant UPI settlement after your first trade. Legal & secure.',
  alternates: { canonical: '/sell-usdt-without-kyc' },
  keywords: [
    'sell usdt without kyc', 'sell usdt to inr without kyc', 'sell usdt no kyc india',
    'sell usdt minimum kyc india', 'sell usdt fast kyc india', 'usdt to inr no verification',
    'sell tether without kyc india', 'usdt exchange instant india',
  ],
  openGraph: {
    title: 'Sell USDT Without KYC Hassle — 5-Min One-Time Verification | SwappINR',
    description: 'KYC in 5 minutes. Done once. Sell USDT for INR instantly on every trade after.',
    url: 'https://www.swappinr.com/sell-usdt-without-kyc',
  },
};

const WHY_KYC = [
  {
    title: 'Indian law requires it (FEMA & PMLA)',
    body: 'Under FEMA (Foreign Exchange Management Act) and PMLA (Prevention of Money Laundering Act), every platform facilitating crypto-to-INR conversion must verify the identity of its users. This applies to all exchanges — regulated or not.',
  },
  {
    title: 'Your bank account is already KYC-verified',
    body: 'When we send INR to your UPI or bank account, your bank performs its own verification. A crypto platform that skips KYC but sends to your verified bank account is creating a compliance gap that can flag your account.',
  },
  {
    title: 'RBI and SEBI enforcement is increasing',
    body: 'Since 2022, Indian authorities have actively pursued unregulated crypto platforms. No-KYC exchanges operating from outside India have faced payment gateway blocks and user fund freezes. Your money is safer on a compliant platform.',
  },
  {
    title: 'No-KYC platforms carry real scam risk',
    body: 'The majority of "no KYC required" USDT exchanges targeting India are either fronts for fraud or operate without licenses. Users have reported vanishing funds, frozen withdrawals, and unresponsive support — with no legal recourse.',
  },
];

const SWAPPINR_KYC = [
  { icon: '⏱️', title: '5 minutes total',        body: 'The entire KYC process — from opening the form to approval — takes under 5 minutes for most users. No branch visit, no paperwork, no waiting days.' },
  { icon: '📱', title: 'Done entirely on your phone', body: 'Take a photo of your Aadhaar/PAN and record a short selfie video. No scanner, no printer, no physical documents to send anywhere.' },
  { icon: '♾️',  title: 'Once forever — never again', body: 'Complete KYC exactly one time. Every trade after that — whether your 2nd or your 200th — is instant, with zero re-verification required.' },
  { icon: '🔒', title: 'AES-256 encrypted storage',  body: 'Your KYC documents are encrypted at rest and never shared with third parties. We use them solely for regulatory compliance — not marketing or data monetisation.' },
  { icon: '✅', title: 'Instant approval on weekends', body: 'KYC is processed 24/7 including Sundays and public holidays. Most approvals complete within 30 minutes; many are instant during business hours.' },
  { icon: '🇮🇳', title: 'FEMA-compliant & audit-ready', body: 'Every verified account includes transaction records you can download for ITR filing. Our compliance team handles the regulatory side so you don\'t have to think about it.' },
];

const COMPARE = [
  { platform: 'SwappINR',           kyc: '5 min video KYC, once forever', risk: 'None — FEMA compliant',       settlement: 'Under 15 min to UPI',    verdict: '✅ Recommended' },
  { platform: 'Indian CEX (WazirX, CoinDCX)', kyc: '24–72 hrs, re-verify sometimes', risk: 'Low — regulated',  settlement: '1–4 hrs post-sell',      verdict: '✅ Safe but slower' },
  { platform: 'No-KYC P2P (Paxful, Remitano)', kyc: 'Partial or none',              risk: 'High counterparty risk',   settlement: '30 min–2 hrs',    verdict: '⚠️ Risky' },
  { platform: 'Unregulated no-KYC exchanges',  kyc: 'None claimed',                 risk: 'Scam risk — no recourse', settlement: 'Unknown',           verdict: '🔴 Avoid' },
];

const STEPS = [
  { n: '01', title: 'Register with your email', body: 'Create your SwappINR account in 30 seconds. No credit card, no deposit required to start.' },
  { n: '02', title: 'Complete 5-minute video KYC', body: 'Open the KYC flow on your phone. Photograph your Aadhaar/PAN front and back, then record a 10-second selfie video looking at the camera. Done.' },
  { n: '03', title: 'Get approved (usually instant)', body: 'Our system reviews your submission. Most approvals complete within 30 minutes. You get an email and in-app notification the moment you\'re verified.' },
  { n: '04', title: 'Place your first sell order — instantly', body: 'Select TRC-20, BEP-20 or ERC-20, enter your USDT amount, add your UPI ID. See the exact INR you\'ll receive and confirm.' },
  { n: '05', title: 'Receive INR — every future trade is instant', body: 'Send USDT to our wallet. INR arrives in your UPI in under 15 minutes. Every trade from trade #2 onwards skips all of this — straight to sending USDT.' },
];

const FAQ_ITEMS = [
  {
    q: 'Can I sell USDT to INR without KYC in India?',
    a: 'No — Indian law (FEMA and PMLA) requires all platforms that convert crypto to INR to verify user identity. Any platform claiming to offer USDT-to-INR without KYC is either operating illegally or is a scam. SwappINR offers the fastest legal KYC in India: 5 minutes, done exactly once, then every trade after is instant.',
  },
  {
    q: 'Why do I need KYC to sell USDT in India?',
    a: 'The Indian government classifies USDT-to-INR transactions as Virtual Digital Asset (VDA) exchanges. Under PMLA and FEMA, these require identity verification (KYC) and transaction reporting. This is the same reason your bank requires KYC — it\'s the law, not a choice platforms make independently.',
  },
  {
    q: 'How long does SwappINR KYC take?',
    a: 'Under 5 minutes to submit, and usually under 30 minutes for approval. During business hours, many accounts are approved in seconds. Once complete, you never do KYC again — all future trades are instant.',
  },
  {
    q: 'What documents do I need for KYC on SwappINR?',
    a: 'You need either an Aadhaar card or PAN card (or both), and a working front-facing camera for the selfie video. The video is 10–15 seconds. No physical documents, no scanning, no branch visit.',
  },
  {
    q: 'Is it safe to give KYC documents to SwappINR?',
    a: 'Yes. Your KYC data is encrypted with AES-256 and stored securely. We never share your documents with third parties, use them for marketing, or sell your data. We hold KYC data solely for regulatory compliance with Indian law.',
  },
  {
    q: 'What happens if I use a no-KYC USDT exchange?',
    a: 'Serious risks: your funds can be frozen or seized, the platform may disappear with your money, and your bank account can be flagged for receiving funds from an unregulated source. There is no legal recourse if a no-KYC platform steals from you. The "convenience" is not worth it.',
  },
  {
    q: 'Can I sell USDT for INR after completing KYC once?',
    a: 'Yes — that\'s the entire point. KYC on SwappINR is permanent. After your first 5-minute verification, every subsequent trade goes straight to sending USDT and receiving INR. No repeated forms, no repeated selfies, no repeated waiting.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function SellUsdtWithoutKycPage() {
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
      { '@type': 'ListItem', position: 2, name: 'Sell USDT for INR', item: `${SITE_URL}/sell-usdt-for-inr` },
      { '@type': 'ListItem', position: 3, name: 'KYC Guide', item: `${SITE_URL}/sell-usdt-without-kyc` },
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
          ⚡ KYC once in 5 min → trade instantly forever
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Sell USDT to INR — 5-Minute KYC,<br />
          <span style={{ color: '#CCFF00' }}>Done Once. Trade Instantly Forever.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 16px' }}>
          KYC is legally required to sell USDT for INR in India — but SwappINR makes it the fastest it can possibly be. 5 minutes on your phone. Approved once. Every trade after that is instant, no verification ever again.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 36px' }}>
          Platforms claiming &ldquo;no KYC&rdquo; for USDT-to-INR in India are either operating illegally or scams. Your money is not safe with them.
        </p>

        {/* KYC speed stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { v: '5 min',  l: 'KYC submission' },
            { v: '< 30 min', l: 'Approval time'   },
            { v: '1×',     l: 'Do it once ever'  },
            { v: '∞',      l: 'Trades after KYC' },
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

      {/* ── Why KYC is required ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why KYC is legally required to sell USDT in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>This is not a SwappINR policy — it is Indian law.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {WHY_KYC.map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60A5FA', marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Warning box */}
          <div style={{ marginTop: 24, padding: '20px 22px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#F87171', marginBottom: 10 }}>⚠️ The truth about &ldquo;no KYC&rdquo; USDT exchanges in India</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
              Searches for &ldquo;sell USDT without KYC&rdquo; return results that are either unlicensed foreign exchanges, P2P platforms with counterparty risk, or outright scams. Indian enforcement actions against unregulated crypto platforms have increased significantly since 2022. Users have lost funds with no legal recourse. The 5 minutes of KYC on SwappINR is the safest possible trade-off.
            </p>
          </div>
        </div>
      </section>

      {/* ── SwappINR KYC benefits ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>SwappINR KYC — the fastest in India</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything that makes our verification painless.</p>
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
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>From zero to selling USDT for INR in 5 steps</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>The first trade includes KYC. Every trade after that skips straight to step 4.</p>
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
                    {i === 4 && <span style={{ background: 'rgba(0,229,160,0.1)', color: '#00E5A0', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>ALL FUTURE TRADES START HERE</span>}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform comparison ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Comparing your options to sell USDT in India</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>KYC requirements and risk levels across different platforms.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Platform type', 'KYC process', 'Risk level', 'Settlement', 'Our verdict'].map((h, i) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(({ platform, kyc, risk, settlement, verdict }, ri) => (
                <tr key={platform} style={{ background: ri === 0 ? 'rgba(204,255,0,0.04)' : ri % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                  <td style={{ padding: '13px 14px', fontWeight: 700, color: ri === 0 ? '#CCFF00' : 'rgba(255,255,255,0.7)' }}>{platform}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{kyc}</td>
                  <td style={{ padding: '13px 14px', color: ri === 0 ? '#00E5A0' : ri === 1 ? '#00E5A0' : ri === 2 ? '#FBBF24' : '#F87171', fontSize: 12, fontWeight: 700 }}>{risk}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{settlement}</td>
                  <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 700 }}>{verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Ready? 5 minutes of KYC. Then sell USDT forever.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
            Create your free account now. Complete KYC on your phone in 5 minutes. Get approved and place your first sell order the same day.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Start KYC Now — Free →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.24)', marginTop: 14 }}>No credit card. No deposit. KYC takes 5 minutes.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>KYC for selling USDT in India — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything about KYC and selling USDT for INR.</p>
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
            ['Sell USDT for INR',         '/sell-usdt-for-inr'        ],
            ['How to sell USDT India',    '/how-to-sell-usdt-in-india'],
            ['TRC-20 USDT to INR',        '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT to INR',        '/bep20-usdt-to-inr'        ],
            ['USDT to INR calculator',   '/usdt-to-inr-calculator'   ],
            ['SwappINR fees',            '/fees'                     ],
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
