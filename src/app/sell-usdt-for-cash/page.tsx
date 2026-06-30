import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Sell USDT for Cash in India — CDM & Physical Cash Settlement | SwappINR',
  description: 'Sell USDT for physical cash (INR) via CDM or in-person settlement in India. SwappINR PRO supports cash deposit machines and arranged cash payouts. Secure, legal, fast.',
  alternates: { canonical: '/sell-usdt-for-cash' },
  keywords: [
    'sell usdt for cash', 'sell usdt for cash near me', 'sell usdt cash india',
    'sell usdt cdm india', 'sell tether for cash india', 'usdt to cash india',
    'sell usdt physically india', 'usdt cash payout india', 'sell usdt for rupees cash',
  ],
  openGraph: {
    title: 'Sell USDT for Cash in India — CDM & Physical Payout | SwappINR PRO',
    description: 'Get physical INR cash for your USDT via CDM or arranged in-person settlement. SwappINR PRO service.',
    url: 'https://www.swappinr.com/sell-usdt-for-cash',
  },
};

const CASH_OPTIONS = [
  {
    icon: '🏧',
    title: 'CDM (Cash Deposit Machine)',
    badge: 'MOST POPULAR',
    badgeColor: '#CCFF00',
    body: 'We deposit INR cash into your bank account via a Cash Deposit Machine. You receive a bank credit without ever meeting in person. Works with all major Indian banks (HDFC, ICICI, SBI, Axis, Kotak). Settlement within 2–4 hours of USDT receipt.',
    steps: ['Send USDT to our wallet', 'Confirm USDT receipt', 'We deposit cash via CDM at nearest branch', 'Bank credits your account within hours'],
  },
  {
    icon: '🤝',
    title: 'Arranged In-Person Settlement',
    badge: 'PRO TIER',
    badgeColor: '#00E5A0',
    body: 'For high-value trades (₹5 lakh+), we can arrange in-person cash handover in select Indian cities. Requires advance scheduling, identity verification, and PRO membership. Covered cities: Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune.',
    steps: ['Contact PRO support to schedule', 'Confirm identity & trade details', 'Send USDT to escrow wallet', 'Cash handover at agreed location'],
  },
];

const CDM_BANKS = [
  { bank: 'HDFC Bank',        cdmCoverage: 'Nationwide — 70,000+ ATMs/CDMs' },
  { bank: 'ICICI Bank',       cdmCoverage: 'Nationwide — 15,000+ CDMs'      },
  { bank: 'SBI',              cdmCoverage: 'Nationwide — widest rural coverage' },
  { bank: 'Axis Bank',        cdmCoverage: 'Nationwide — 12,000+ CDMs'      },
  { bank: 'Kotak Mahindra',   cdmCoverage: 'Metro & Tier-1 cities'          },
  { bank: 'Yes Bank',         cdmCoverage: 'Metro & Tier-2 cities'          },
];

const COMPARE_METHODS = [
  { method: 'UPI / IMPS (Standard)',  speed: 'Under 15 min',      privacy: 'Medium', limit: 'No limit',       fee: '0.5–0.8%',  best: 'Most users — fastest, easiest' },
  { method: 'CDM Cash Deposit (PRO)', speed: '2–4 hours',         privacy: 'High',   limit: 'Up to ₹50 lakh', fee: '1.2%',      best: 'Privacy-focused, high-value' },
  { method: 'In-person Cash (PRO)',   speed: 'Scheduled',         privacy: 'Highest', limit: '₹5 lakh+',      fee: '1.5%+',     best: 'Very large amounts, cities only' },
];

const WHY_CASH = [
  { title: 'Bank-to-bank traceability concerns', body: 'Some users prefer cash to avoid large USDT-origin credits appearing in their bank statement — particularly for ITR or loan applications. CDM deposit still appears as a deposit, but without the sending party tagged.' },
  { title: 'Unbanked recipients', body: 'If you need to pay a third party who lacks a bank account or UPI, CDM cash deposit or in-person handover is the only viable path. Our PRO service is specifically designed for this use case.' },
  { title: 'Large amount discretion', body: 'For trades above ₹10 lakh, some users prefer not to have a single large UPI credit. CDM deposits can be split across branches with no single transaction above ₹2 lakh, reducing attention on any individual credit.' },
  { title: 'Emergency liquidity', body: 'In situations where UPI or net banking is temporarily unavailable (technical outages, account freezes), CDM cash deposit provides an alternative settlement path that bypasses online banking infrastructure.' },
];

const PRO_FEATURES = [
  { icon: '🏧', title: 'CDM cash settlement',          body: 'Sell USDT and receive INR cash via CDM at any major bank.' },
  { icon: '🤝', title: 'In-person cash deals',         body: 'Arranged cash handover in 6 major Indian cities for ₹5 lakh+.' },
  { icon: '💎', title: 'Higher trade limits',          body: 'Standard limit ₹10 lakh/day. PRO limit ₹50 lakh/day.' },
  { icon: '⚡', title: 'Priority order processing',    body: 'PRO orders are queued ahead of standard orders during peak times.' },
  { icon: '📞', title: 'Dedicated support line',       body: 'Direct WhatsApp and phone support — no ticket queue.' },
  { icon: '📊', title: 'Advanced rate negotiation',    body: 'For trades above ₹5 lakh, negotiate a custom rate with our desk.' },
];

const STEPS_CDM = [
  { n: '01', title: 'Upgrade to SwappINR PRO', body: 'PRO membership unlocks CDM settlement. Contact support or upgrade from your account dashboard.' },
  { n: '02', title: 'Place a CDM sell order', body: 'Select "CDM Cash Settlement" as your payout method. Enter the USDT amount and your bank account details (account number + IFSC).' },
  { n: '03', title: 'Send USDT to our escrow wallet', body: 'Transfer your USDT to the wallet address provided. We confirm blockchain receipt — usually within 10 minutes for BEP-20 and TRC-20.' },
  { n: '04', title: 'We make the CDM deposit', body: 'Our team deposits the equivalent INR cash via CDM to your bank account. We send you the CDM deposit slip via WhatsApp or email as proof.' },
  { n: '05', title: 'Bank credits your account', body: 'Your bank processes the CDM deposit. Funds appear in your account within 2–4 hours (or by next business day for deposits after banking hours).' },
];

const FAQ_ITEMS = [
  {
    q: 'Can I sell USDT for cash in India?',
    a: 'Yes — SwappINR PRO supports cash settlement via CDM (Cash Deposit Machine) and arranged in-person handover in select cities. For standard trades, UPI and bank transfer are faster and cheaper. Cash settlement is designed for users who specifically need INR in physical form or prefer CDM-based bank credits.',
  },
  {
    q: 'How does CDM cash settlement work for USDT?',
    a: 'You place a CDM sell order, send USDT to our escrow wallet, and we physically deposit the equivalent INR cash into your bank account at a CDM machine near a branch. You receive a bank credit — not an envelope of cash — making it fully traceable and legal. Supported banks: HDFC, ICICI, SBI, Axis, Kotak, Yes Bank.',
  },
  {
    q: 'Is selling USDT for cash legal in India?',
    a: 'Yes, with proper KYC and documentation. CDM cash deposits to a verified bank account are legal and fully compliant with FEMA and PMLA. All SwappINR cash settlement orders require completed KYC, and we maintain full transaction records as required by Indian law. The source of funds (USDT sale) is documented.',
  },
  {
    q: 'What is the minimum amount to sell USDT for cash via CDM?',
    a: 'Minimum ₹50,000 (approximately 580 USDT at current rates) for CDM settlement. This is due to the operational overhead of CDM deposits. For amounts below ₹50,000, UPI or IMPS settlement is available on the standard plan and is much faster.',
  },
  {
    q: 'Which cities support in-person cash handover for USDT?',
    a: 'In-person cash handover is available in Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, and Pune. Minimum trade size is ₹5 lakh. Appointments must be scheduled at least 24 hours in advance with our PRO desk. This service requires PRO membership and advanced identity verification.',
  },
  {
    q: 'What is the fee for selling USDT for cash via CDM?',
    a: 'CDM settlement has a 1.2% fee (vs. 0.5–0.8% for UPI/IMPS). This covers the operational cost of CDM deposits, transport, and PRO service overhead. In-person cash settlement is 1.5%+ depending on trade size and city. Both include full KYC verification and transaction documentation.',
  },
  {
    q: 'How do I verify the CDM deposit was made?',
    a: 'We send you a photo of the CDM deposit slip (showing amount, bank, account, and timestamp) via WhatsApp or email immediately after the deposit. Your bank will also send an SMS credit alert. The deposit typically shows in your bank statement within 2–4 hours.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function SellUsdtForCashPage() {
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
      { '@type': 'ListItem', position: 3, name: 'Cash Settlement', item: `${SITE_URL}/sell-usdt-for-cash` },
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
          🏧 CDM & in-person cash settlement — SwappINR PRO
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Sell USDT for Cash in India —<br />
          <span style={{ color: '#CCFF00' }}>CDM Deposit or In-Person Settlement</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 36px' }}>
          SwappINR PRO supports cash settlement for USDT sales. Receive INR as a CDM bank deposit or arranged in-person handover in 6 major Indian cities. Legal, KYC-verified, and fully documented.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { v: '2–4 hrs',  l: 'CDM settlement time'     },
            { v: '₹50L',     l: 'PRO daily limit'         },
            { v: '6 cities', l: 'In-person coverage'      },
            { v: '1.2%',     l: 'CDM settlement fee'      },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#CCFF00', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg" style={{ marginRight: 12 }}>
          Get Started Free →
        </Link>
        <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--lg">
          Enquire about PRO →
        </Link>
      </section>

      {/* ── Cash settlement options ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Two ways to receive cash for your USDT</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Both are fully legal, KYC-verified, and available via SwappINR PRO.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {CASH_OPTIONS.map(({ icon, title, badge, badgeColor, body, steps }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <span style={{ background: `rgba(${badgeColor === '#CCFF00' ? '204,255,0' : '0,229,160'},0.1)`, color: badgeColor, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.05em' }}>{badge}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 20 }}>{body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#CCFF00', marginTop: 1 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why sell for cash ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why some users prefer cash settlement for USDT</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Common scenarios where CDM or in-person payout makes sense.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {WHY_CASH.map(({ title, body }) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCFF00', marginBottom: 14 }} />
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CDM steps ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How CDM cash settlement works — step by step</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>From sending USDT to cash in your bank account.</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STEPS_CDM.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: i === 0 ? '#CCFF00' : 'rgba(204,255,0,0.07)', border: i === 0 ? 'none' : '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : '#CCFF00', fontFamily: 'var(--fr-font-mono)' }}>
                    {s.n}
                  </div>
                  {i < STEPS_CDM.length - 1 && <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.06)', marginTop: 6 }} />}
                </div>
                <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Settlement comparison ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Compare settlement methods</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Pick the right payout method for your situation.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Method', 'Speed', 'Privacy', 'Limit', 'Fee', 'Best for'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_METHODS.map(({ method, speed, privacy, limit, fee, best }, ri) => (
                <tr key={method} style={{ background: ri === 0 ? 'rgba(204,255,0,0.03)' : ri % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                  <td style={{ padding: '13px 14px', fontWeight: 700, color: ri === 0 ? '#CCFF00' : 'rgba(255,255,255,0.7)' }}>{method}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{speed}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{privacy}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{limit}</td>
                  <td style={{ padding: '13px 14px', color: '#CCFF00', fontWeight: 700, fontSize: 12 }}>{fee}</td>
                  <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CDM-supported banks ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>CDM-supported banks</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>We deposit to your account at any of these banks via CDM.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {CDM_BANKS.map(({ bank, cdmCoverage }) => (
              <div key={bank} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 5 }}>{bank}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{cdmCoverage}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            Don&apos;t see your bank? Contact PRO support — we may accommodate additional banks on a case-by-case basis.
          </p>
        </div>
      </section>

      {/* ── PRO features ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>SwappINR PRO — everything you unlock</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Cash settlement is one of many PRO benefits.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PRO_FEATURES.map(({ icon, title, body }) => (
            <div key={title} style={{ background: 'rgba(0,229,160,0.03)', border: '1px solid rgba(0,229,160,0.1)', borderRadius: 14, padding: '20px 18px', display: 'flex', gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to sell USDT for cash?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
            Start with a free account and standard UPI settlement. Upgrade to PRO for CDM cash deposits and in-person cash deals in major Indian cities.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
              Create Free Account →
            </Link>
            <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--lg">
              Enquire about PRO
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Sell USDT for cash — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything about CDM and cash settlement for USDT in India.</p>
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['Sell USDT for INR',       '/sell-usdt-for-inr'        ],
            ['How to sell USDT India',  '/how-to-sell-usdt-in-india'],
            ['TRC-20 USDT to INR',      '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT to INR',      '/bep20-usdt-to-inr'        ],
            ['SwappINR fees',           '/fees'                     ],
            ['USDT to INR calculator', '/usdt-to-inr-calculator'   ],
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
