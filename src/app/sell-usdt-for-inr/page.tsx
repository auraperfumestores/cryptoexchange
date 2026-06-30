import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Sell USDT for INR — Instant UPI & Bank Settlement in India',
  description: 'Sell USDT for INR in under 15 minutes. Supports TRC-20, BEP-20, ERC-20. Receive rupees via UPI, IMPS, NEFT or RTGS. Zero hidden fees. KYC-verified exchange India.',
  alternates: { canonical: '/sell-usdt-for-inr' },
  keywords: ['sell USDT for INR', 'sell USDT India', 'sell tether for rupees', 'USDT to INR exchange', 'sell USDT UPI India', 'convert USDT to INR', 'sell usdt get inr', 'usdt sell india'],
  openGraph: {
    title: 'Sell USDT for INR — Instant UPI & Bank Settlement | SwappINR',
    description: 'Sell USDT for INR in under 15 minutes via UPI or bank transfer. Best rates, zero hidden fees.',
    url: 'https://www.swappinr.com/sell-usdt-for-inr',
  },
};

const STEPS = [
  { n: '01', title: 'Create your free account', body: 'Register with your email and complete KYC verification in under 5 minutes. Required once — all future trades are instant from here.' },
  { n: '02', title: 'Choose your amount & network', body: 'Select TRC-20, BEP-20 or ERC-20, enter the USDT amount you want to sell, and see the exact INR you\'ll receive at the live market rate — before you commit.' },
  { n: '03', title: 'Add your UPI ID or bank account', body: 'Enter where you want to receive INR: UPI ID for instant transfer, or bank account details for IMPS/NEFT/RTGS. PRO members can also opt for CDM or cash.' },
  { n: '04', title: 'Send USDT to the provided wallet', body: 'Transfer USDT to the wallet address shown on your order. Our blockchain monitor confirms your transaction automatically — no manual upload needed.' },
  { n: '05', title: 'Receive INR in your account', body: 'Within 10–20 minutes of blockchain confirmation, INR lands directly in your UPI or bank. PRO members get guaranteed settlement in under 8 minutes.' },
];

const NETWORKS = [
  { name: 'TRC-20 (TRON)',     fee: '~0.6%', gas: 'Near zero (~1 TRX)', time: '~10 min', best: 'Frequent trades & smaller amounts', color: '#00E5A0', href: '/trc20-usdt-to-inr' },
  { name: 'BEP-20 (BNB Chain)', fee: '~0.5%', gas: 'Very low (~$0.05)', time: '~8 min',  best: 'Best overall value for India',     color: '#CCFF00', href: '/bep20-usdt-to-inr' },
  { name: 'ERC-20 (Ethereum)', fee: '~0.8%', gas: 'Moderate ($2–$10)', time: '~15 min', best: 'Large single-transfer security',    color: '#60A5FA', href: null                 },
];

const PAYOUTS = [
  { method: 'UPI',   time: 'Instant',     note: 'Fastest — PhonePe, GPay, Paytm, BHIM',      recommended: true  },
  { method: 'IMPS',  time: '< 30 min',    note: 'Bank to bank, 24/7 including weekends',       recommended: false },
  { method: 'NEFT',  time: '< 2 hrs',     note: 'All Indian banks, business hours',            recommended: false },
  { method: 'RTGS',  time: '< 30 min',    note: 'For transactions above ₹2 lakhs',            recommended: false },
  { method: 'Cash',  time: 'By arrangement', note: 'PRO members only — CDM or physical cash', recommended: false },
];

const WHY_US = [
  { title: 'Live inter-bank rate',     body: 'Our USDT/INR sell rate tracks the real-time forex mid-market rate with no hidden spread. Your fee is shown separately, upfront, before you send a single satoshi.' },
  { title: 'Zero hidden fees',         body: 'The rate you see at order confirmation is exactly what lands in your account. No withdrawal charge, no processing deduction, no fine-print surprises — ever.' },
  { title: 'KYC once, trade forever',  body: 'Complete video KYC once and unlock unlimited trades. No repeated paperwork, no bank re-approvals, no re-verification for subsequent orders.' },
  { title: 'On-chain verified',        body: 'Every USDT transfer is verified on-chain before INR is released. You can track confirmation status in real time from your dashboard.' },
  { title: 'Full FEMA & tax compliance', body: 'We operate under Indian FEMA guidelines, run KYC/AML checks on every user, and provide transaction records ready for your ITR under Section 115BBH.' },
  { title: '24/7 support',             body: 'Every trade has a dedicated support thread. Reach our team via in-app chat, email, or Telegram — real humans who resolve issues in minutes.' },
];

const FAQ_ITEMS = [
  {
    q: 'How do I sell USDT for INR in India?',
    a: 'Create a SwappINR account, complete a one-time KYC, select your USDT network and amount, add your UPI ID or bank account, send USDT to our wallet, and receive INR in 10–20 minutes.',
  },
  {
    q: 'Which USDT network is best for selling in India?',
    a: 'TRC-20 (TRON) has near-zero gas fees — ideal for frequent or smaller trades. BEP-20 (BNB Chain) offers the lowest exchange fee at 0.5%. ERC-20 (Ethereum) is most suitable for large single transfers where maximum on-chain security matters.',
  },
  {
    q: 'What fees does SwappINR charge to sell USDT?',
    a: 'SwappINR charges a single transparent exchange fee: 0.5% for BEP-20, 0.6% for TRC-20, and 0.8% for ERC-20. There are no withdrawal fees, no hidden spreads, and no surprise deductions. The INR amount shown before you send is exactly what you receive.',
  },
  {
    q: 'Is it legal to sell USDT for INR in India?',
    a: 'Yes — converting USDT to INR is legal in India. Gains from cryptocurrency transactions are taxed at 30% under Section 115BBH of the Income Tax Act. You should maintain records of each trade for your annual ITR and comply with FEMA guidelines on foreign exchange.',
  },
  {
    q: 'How quickly do I receive INR after sending USDT?',
    a: 'Most trades settle within 10–20 minutes after blockchain confirmation of your USDT transfer. PRO members receive settlement in under 8 minutes. On very rare occasions, network congestion on Ethereum can add 10–15 extra minutes.',
  },
  {
    q: 'What is the minimum and maximum I can sell?',
    a: 'There is no minimum trade size. Standard accounts have a ₹1 lakh daily sell limit. PRO membership removes this limit entirely and is recommended for traders moving ₹25 lakhs or more per month.',
  },
  {
    q: 'Can I receive cash or use CDM when selling USDT?',
    a: 'Yes — PRO members can receive INR via CDM (Cash Deposit Machine) or direct physical cash for eligible trades. Contact support after placing your order to arrange cash settlement.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function SellUsdtForInrPage() {
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
    ],
  };
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Sell USDT for INR',
    serviceType: 'Cryptocurrency Exchange',
    provider: { '@type': 'Organization', name: 'SwappINR', url: SITE_URL },
    areaServed: { '@type': 'Country', name: 'India' },
    description: 'Sell USDT (Tether) for Indian Rupees via UPI, IMPS, NEFT or RTGS. Supports TRC-20, BEP-20, ERC-20. Settlement in under 15 minutes.',
    offers: { '@type': 'Offer', priceCurrency: 'INR', description: 'Exchange fee 0.5–0.8% depending on network. No hidden charges.' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <SeoNav active="/sell-usdt-for-inr" />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          ⚡ USDT → INR · Settlement in &lt; 15 min
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Sell USDT for INR in India —<br />
          <span style={{ color: '#CCFF00' }}>Instant UPI &amp; Bank Settlement</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px' }}>
          Convert USDT to Indian Rupees with one flat fee and zero hidden charges. Supports TRC-20, BEP-20, and ERC-20. Receive INR via UPI, IMPS, NEFT, or RTGS in under 15 minutes.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { v: '₹58L+',    l: 'Volume processed' },
            { v: '3.1K+',    l: 'Verified traders'  },
            { v: '< 15 min', l: 'Avg settlement'    },
            { v: '4.9 ★',    l: 'Trader rating'     },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Sell USDT Now →
          </Link>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to sell USDT for INR on SwappINR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>Five simple steps — from your crypto wallet to your bank account.</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: i === 0 ? '#CCFF00' : 'rgba(204,255,0,0.07)',
                  border: i === 0 ? 'none' : '1px solid rgba(204,255,0,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : '#CCFF00',
                  fontFamily: 'var(--fr-font-mono)',
                }}>{s.n}</div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.06)', marginTop: 6 }} />
                )}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '13px 28px', borderRadius: 11, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
            Start your first trade →
          </Link>
        </div>
      </section>

      {/* ── Network comparison ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Which USDT network should you use?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>All three networks supported. Choose based on your wallet and trade size.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {NETWORKS.map(net => (
              <div key={net.name} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 16, padding: '24px 20px', position: 'relative' }}>
                {net.fee === '~0.5%' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#CCFF00', color: '#000', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 99 }}>LOWEST FEE</div>
                )}
                <div style={{ fontSize: 15, fontWeight: 800, color: net.color, marginBottom: 18 }}>{net.name}</div>
                {[
                  ['Exchange fee', net.fee],
                  ['Network gas',  net.gas],
                  ['Settlement',   net.time],
                  ['Best for',     net.best],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.72)', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
                {net.href && (
                  <Link href={net.href} style={{ display: 'block', marginTop: 16, fontSize: 12, color: net.color, textDecoration: 'none', fontWeight: 700 }}>
                    {net.name.split(' ')[0]} guide →
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.14)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
            <strong style={{ color: '#CCFF00' }}>Tip:</strong> For most India traders, <Link href="/trc20-usdt-to-inr" style={{ color: '#CCFF00', textDecoration: 'none' }}>TRC-20</Link> or <Link href="/bep20-usdt-to-inr" style={{ color: '#CCFF00', textDecoration: 'none' }}>BEP-20</Link> gives the best net payout. Ethereum gas fees can significantly reduce returns on trades under ₹50,000.
          </p>
        </div>
      </section>

      {/* ── Payout methods ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How you receive your INR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Multiple payout options to match your preference and bank.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {PAYOUTS.map(p => (
            <div key={p.method} style={{ background: 'rgba(255,255,255,0.025)', border: p.recommended ? '1px solid rgba(204,255,0,0.25)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: p.recommended ? '#CCFF00' : '#fff' }}>{p.method}</span>
                {p.recommended && <span style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>FASTEST</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>{p.time}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', lineHeight: 1.55 }}>{p.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why us ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why India traders use SwappINR to sell USDT</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Built for the Indian crypto market — not adapted from a global product.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {WHY_US.map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCFF00', marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '64px auto', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to sell your USDT for INR?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 28, lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
            Create a free account, complete KYC in 5 minutes, and get your first trade settled in under 15 minutes. See <Link href="/fees" style={{ color: '#CCFF00', textDecoration: 'none' }}>full fee breakdown</Link> before you commit.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Create Free Account →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.24)', marginTop: 14 }}>No minimum trade. KYC required once. No subscription fees.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Frequently asked questions</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything you need to know about selling USDT for INR in India.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <summary style={{ fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', listStyle: 'none' }}>{q}</summary>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, margin: '12px 0 0', paddingTop: 2 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Related ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Related guides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['USDT to INR rate today',          '/usdt-to-inr'              ],
            ['USDT to INR calculator',          '/usdt-to-inr-calculator'   ],
            ['TRC-20 USDT to INR guide',        '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT to INR guide',        '/bep20-usdt-to-inr'        ],
            ['How to sell USDT in India',       '/how-to-sell-usdt-in-india'],
            ['SwappINR fees & charges',         '/fees'                     ],
            ['Buy USDT with INR',               '/buy-usdt-with-inr'        ],
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
