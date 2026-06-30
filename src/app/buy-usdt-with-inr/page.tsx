import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Buy USDT with INR in India — Pay via UPI or Bank Transfer',
  description: 'Buy USDT with INR in India. Pay via UPI, IMPS, NEFT or bank transfer. Get TRC-20, BEP-20 or ERC-20 USDT. KYC-verified, instant delivery. Best rates.',
  alternates: { canonical: '/buy-usdt-with-inr' },
  keywords: ['buy USDT with INR', 'buy USDT from UPI', 'buy USDT India', 'purchase USDT UPI', 'buy tether India', 'INR to USDT', 'buy USDT bank transfer India', 'cheapest USDT India'],
  openGraph: {
    title: 'Buy USDT with INR in India — UPI & Bank Transfer | SwappINR',
    description: 'Buy USDT paying with UPI, IMPS or NEFT. TRC-20, BEP-20, ERC-20 delivered to your wallet instantly.',
    url: 'https://www.swappinr.com/buy-usdt-with-inr',
  },
};

const STEPS = [
  { n: '01', title: 'Create your free SwappINR account', body: 'Sign up with email and complete one-time KYC in under 5 minutes. Required for all buy trades in compliance with Indian regulations.' },
  { n: '02', title: 'Enter how much INR you want to spend', body: 'Enter the INR amount or the USDT quantity you want to receive. See the real-time rate and exactly how much USDT lands in your wallet before you pay.' },
  { n: '03', title: 'Choose your USDT network & wallet address', body: 'Select TRC-20, BEP-20 or ERC-20 and paste your receiving wallet address (Trust Wallet, MetaMask, Binance, etc.). Double-check the network matches your wallet.' },
  { n: '04', title: 'Pay with UPI, IMPS or NEFT', body: 'Complete payment via UPI (GPay, PhonePe, Paytm), IMPS, or NEFT from your bank account. PRO members can also pay via CDM.' },
  { n: '05', title: 'Receive USDT in your wallet', body: 'We verify your INR payment and send USDT to your wallet address within 15 minutes. You receive a transaction hash for on-chain verification.' },
];

const PAYMENT_METHODS = [
  { method: 'UPI',   desc: 'PhonePe, Google Pay, Paytm, BHIM, any UPI app',   time: 'Instant',  limit: 'Up to ₹1L/day standard', recommended: true  },
  { method: 'IMPS',  desc: 'Direct bank-to-bank transfer, all Indian banks',   time: '< 30 min', limit: 'Up to ₹5L per transaction', recommended: false },
  { method: 'NEFT',  desc: 'National Electronic Funds Transfer, bank hours',   time: '< 2 hrs',  limit: 'No upper limit',           recommended: false },
  { method: 'RTGS',  desc: 'For large amounts above ₹2 lakhs, real-time',      time: '< 30 min', limit: 'Min ₹2L, no upper limit',  recommended: false },
];

const WALLETS = [
  { name: 'Trust Wallet',  networks: 'TRC-20, BEP-20, ERC-20', note: 'Most popular in India — official SwappINR recommended wallet' },
  { name: 'MetaMask',      networks: 'ERC-20, BEP-20',          note: 'Browser extension & mobile, great for DeFi users' },
  { name: 'Binance',       networks: 'TRC-20, BEP-20, ERC-20', note: 'CEX address — verify network before sending' },
  { name: 'OKX Wallet',   networks: 'TRC-20, BEP-20, ERC-20', note: 'Multi-chain wallet with Indian rupee on/off ramp' },
  { name: 'Coinbase',      networks: 'ERC-20',                  note: 'ERC-20 only — best for Ethereum-ecosystem users' },
  { name: 'TronLink',      networks: 'TRC-20',                  note: 'TRON-native wallet — ideal for TRC-20 USDT buyers' },
];

const FAQ_ITEMS = [
  {
    q: 'How do I buy USDT with INR in India?',
    a: 'Create a SwappINR account and complete one-time KYC. Enter the USDT amount you want, select your network and paste your wallet address. Pay via UPI, IMPS or NEFT. USDT is sent to your wallet within 15 minutes of payment confirmation.',
  },
  {
    q: 'Can I buy USDT using UPI in India?',
    a: 'Yes — UPI is the most popular payment method for buying USDT on SwappINR. You can pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI-compatible app. Payment reflects instantly and USDT is sent as soon as it clears.',
  },
  {
    q: 'Which is the cheapest way to buy USDT in India?',
    a: 'SwappINR charges a transparent 0.5–0.8% exchange fee with no hidden spread. BEP-20 (BNB Chain) has the lowest fee at 0.5%, making it the cheapest network to receive USDT. TRC-20 follows at 0.6%. CEX alternatives often hide 1–2% in the quoted rate.',
  },
  {
    q: 'Is it legal to buy USDT in India?',
    a: 'Yes — buying USDT (Tether) in India is legal. Gains from selling cryptocurrency are taxed at 30% under Section 115BBH of the Income Tax Act. Purchases do not directly create taxable events, but you should keep records of every transaction for ITR filing.',
  },
  {
    q: 'How much USDT can I buy at once?',
    a: 'There is no minimum buy amount. Standard accounts can buy up to ₹1 lakh worth of USDT per day. PRO membership removes this limit and is recommended for users buying more than ₹25 lakhs per month.',
  },
  {
    q: 'Which USDT network should I choose when buying?',
    a: 'Match the network to your destination wallet. If your wallet supports multiple networks, BEP-20 gives the lowest fee and fastest USDT delivery for most trades. TRC-20 is best if your exchange or wallet primarily supports TRON. Only use ERC-20 if your wallet requires the Ethereum network.',
  },
  {
    q: 'What wallet do I need to receive USDT bought with INR?',
    a: 'Trust Wallet is the officially recommended wallet for SwappINR — it supports TRC-20, BEP-20, and ERC-20 USDT. MetaMask works for BEP-20 and ERC-20. For TRC-20 specifically, TronLink is also a good option. You can also receive USDT directly to a Binance exchange account.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function BuyUsdtWithInrPage() {
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
    ],
  };
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Buy USDT with INR',
    serviceType: 'Cryptocurrency Exchange',
    provider: { '@type': 'Organization', name: 'SwappINR', url: SITE_URL },
    areaServed: { '@type': 'Country', name: 'India' },
    description: 'Buy USDT (Tether) with Indian Rupees via UPI, IMPS, NEFT or RTGS. Supports TRC-20, BEP-20, ERC-20. Delivery to your wallet in under 15 minutes.',
    offers: { '@type': 'Offer', priceCurrency: 'INR', description: 'Exchange fee 0.5–0.8% depending on network. No hidden charges.' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <SeoNav active="/buy-usdt-with-inr" />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          ⚡ INR → USDT · Pay via UPI, IMPS, NEFT
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Buy USDT with INR in India —<br />
          <span style={{ color: '#CCFF00' }}>Pay via UPI or Bank Transfer</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px' }}>
          Purchase TRC-20, BEP-20 or ERC-20 USDT paying with Indian Rupees. Use UPI, IMPS, NEFT or RTGS. Delivered to your wallet within 15 minutes. One flat fee — no hidden spread.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[['₹58L+', 'Volume traded'], ['3.1K+', 'Verified traders'], ['< 15 min', 'USDT delivery'], ['4.9 ★', 'Trader rating']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
        <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
          Buy USDT Now →
        </Link>
      </section>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to buy USDT with INR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>Five steps from rupees to USDT in your wallet.</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: i === 0 ? '#CCFF00' : 'rgba(204,255,0,0.07)', border: i === 0 ? 'none' : '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : '#CCFF00', fontFamily: 'var(--fr-font-mono)' }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.06)', marginTop: 6 }} />}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Payment methods ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Payment methods accepted</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Multiple Indian payment options to buy USDT with rupees.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {PAYMENT_METHODS.map(p => (
              <div key={p.method} style={{ background: p.recommended ? 'rgba(204,255,0,0.04)' : 'rgba(255,255,255,0.025)', border: p.recommended ? '1px solid rgba(204,255,0,0.22)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: p.recommended ? '#CCFF00' : '#fff' }}>{p.method}</span>
                  {p.recommended && <span style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>FASTEST</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>{p.time}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, marginBottom: 6 }}>{p.desc}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--fr-font-mono)' }}>{p.limit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported wallets ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Where to receive your USDT</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>SwappINR sends USDT directly to your wallet — any address on the supported network.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {WALLETS.map(w => (
            <div key={w.name} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{w.name}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--fr-font-mono)', color: '#CCFF00', marginBottom: 8 }}>{w.networks}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{w.note}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
          ⚠️ <strong style={{ color: '#F87171' }}>Network mismatch warning:</strong> Always confirm the USDT network on SwappINR matches the network of your wallet address. Sending TRC-20 USDT to an ERC-20 address (or vice versa) will result in a permanent loss of funds.
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Buy USDT with INR today</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 28, lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            Create a free account, complete KYC in 5 minutes, and buy USDT with UPI or bank transfer at a live transparent rate. View <Link href="/fees" style={{ color: '#CCFF00', textDecoration: 'none' }}>full fee schedule</Link>.
          </p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
            Create Free Account →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.24)', marginTop: 14 }}>No minimum. KYC once. No subscription.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Buy USDT with INR — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Answers to common questions about purchasing USDT in India.</p>
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
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Related guides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['Sell USDT for INR',        '/sell-usdt-for-inr'        ],
            ['USDT to INR rate today',   '/usdt-to-inr'              ],
            ['USDT to INR calculator',  '/usdt-to-inr-calculator'   ],
            ['TRC-20 USDT guide',       '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT guide',       '/bep20-usdt-to-inr'        ],
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
