import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'Buy USDT with UPI in India — GPay, PhonePe, Paytm | SwappINR',
  description: 'Buy USDT with UPI instantly in India. Pay via GPay, PhonePe, Paytm, BHIM or any UPI app. Receive USDT on BEP-20, TRC-20 or ERC-20 in under 30 minutes. Low fees.',
  alternates: { canonical: '/buy-usdt-with-upi' },
  keywords: [
    'buy usdt with upi', 'buy usdt upi india', 'buy usdt gpay india', 'buy usdt phonepe india',
    'buy usdt paytm india', 'buy usdt with upi payment', 'usdt purchase upi india',
    'buy tether with upi', 'buy usdt bhim upi', 'buy usdt via upi', 'usdt buy upi rupees india',
  ],
  openGraph: {
    title: 'Buy USDT with UPI India — GPay, PhonePe, Paytm | SwappINR',
    description: 'Pay with any UPI app. Receive USDT in your wallet in under 30 minutes. BEP-20, TRC-20, ERC-20.',
    url: 'https://www.swappinr.com/buy-usdt-with-upi',
  },
};

const UPI_APPS = [
  { name: 'Google Pay', icon: 'G', color: '#4285F4', upiHandle: '@okicici / @oksbi / @okaxis',  limit: '₹1 lakh/day',  note: 'Fastest confirmation' },
  { name: 'PhonePe',    icon: 'P', color: '#5F259F', upiHandle: '@ybl / @ibl / @axl',           limit: '₹1 lakh/day',  note: 'Instant alerts' },
  { name: 'Paytm',      icon: 'P', color: '#00BAF2', upiHandle: '@paytm',                       limit: '₹1 lakh/day',  note: 'Wallet + UPI both supported' },
  { name: 'BHIM',       icon: 'B', color: '#138A36', upiHandle: '@upi',                         limit: '₹1 lakh/day',  note: 'Official NPCI app' },
  { name: 'Amazon Pay', icon: 'A', color: '#FF9900', upiHandle: '@apl',                         limit: '₹1 lakh/day',  note: 'Works for UPI payments' },
  { name: 'Any UPI App', icon: '✓', color: '#CCFF00', upiHandle: 'Any registered UPI ID',      limit: 'Per your bank', note: 'All UPI handles accepted' },
];

const STEPS = [
  { n: '01', title: 'Create your SwappINR account', body: 'Sign up free with your email. Takes 30 seconds. No deposit or payment required to register.' },
  { n: '02', title: 'Complete one-time KYC (5 minutes)', body: 'Indian law requires identity verification for crypto purchases. Photograph your Aadhaar or PAN, record a quick selfie video. Approved in under 30 minutes — done forever after this.' },
  { n: '03', title: 'Place a buy order', body: 'Enter your USDT amount. Choose BEP-20 (lowest fee), TRC-20, or ERC-20. Enter your crypto wallet address. Review the exact INR cost and confirm the order.' },
  { n: '04', title: 'Pay via UPI — any app works', body: 'Open your UPI app (GPay, PhonePe, Paytm, BHIM — any app). Scan our QR code or enter our UPI ID. Send the exact INR amount shown. Done in seconds.' },
  { n: '05', title: 'Receive USDT in your wallet', body: 'Once your UPI payment confirms, we release USDT to your wallet address. BEP-20 and TRC-20 arrive within 30 minutes. ERC-20 within 1 hour. You\'ll get an email confirmation.' },
];

const NETWORKS = [
  {
    name: 'BEP-20',     chain: 'BNB Chain',       fee: '0.5%', gasFee: '₹4–₹8',   time: 'Under 10 min',  badge: 'LOWEST FEE',
    color: '#CCFF00',   wallets: 'Trust Wallet, MetaMask, Binance, OKX',
    bestFor: 'Most users — cheapest, fastest, widest wallet support',
  },
  {
    name: 'TRC-20',     chain: 'TRON Network',     fee: '0.6%', gasFee: '~₹12',    time: 'Under 10 min',  badge: 'FASTEST',
    color: '#00E5A0',   wallets: 'Trust Wallet, TronLink, Binance, OKX',
    bestFor: 'Speed-focused traders, TronLink users',
  },
  {
    name: 'ERC-20',     chain: 'Ethereum',          fee: '0.8%', gasFee: '₹170–₹850+', time: '15–60 min', badge: 'MOST SECURE',
    color: '#60A5FA',   wallets: 'MetaMask, Coinbase Wallet, Ledger, Trezor',
    bestFor: 'DeFi users, large amounts, hardware wallets',
  },
];

const WHY_UPI = [
  { icon: '⚡', title: 'Instant payment confirmation', body: 'UPI payments settle in seconds 24/7/365. Once your UPI credit lands, we release USDT immediately — no banking hours, no T+1 delay.' },
  { icon: '🔒', title: 'Bank-grade security',          body: 'Every UPI transaction is authenticated by your bank with your UPI PIN. SwappINR never sees your PIN, banking password, or card details.' },
  { icon: '₹0', title: 'No UPI transaction fee',      body: 'Sending money via UPI is free. SwappINR charges only the exchange fee (0.5–0.8%). No hidden charges on the payment side.' },
  { icon: '📱', title: 'Any UPI app, any bank',        body: 'All 100+ UPI-enabled banks and 30+ UPI apps are supported. If your bank supports UPI, you can buy USDT with it on SwappINR.' },
  { icon: '🏦', title: 'Full transaction trail',       body: 'Your UPI payment creates a bank statement entry. This makes USDT purchase documentation simple for ITR filing — everything is traceable and legal.' },
  { icon: '🕐', title: 'Available 24/7',               body: 'Buy USDT at 2 AM on a Sunday or on Diwali — UPI works all the time. SwappINR processes orders around the clock, including holidays.' },
];

const FAQ_ITEMS = [
  {
    q: 'Can I buy USDT with UPI in India?',
    a: 'Yes — SwappINR lets you buy USDT using any UPI app including Google Pay, PhonePe, Paytm, BHIM, and any bank\'s UPI app. You complete KYC once (5 minutes), then pay via UPI for every trade. USDT is delivered to your wallet within 30 minutes of payment confirmation.',
  },
  {
    q: 'Which UPI apps can I use to buy USDT on SwappINR?',
    a: 'All UPI apps are supported: Google Pay (@okicici / @oksbi / @okaxis), PhonePe (@ybl / @ibl), Paytm (@paytm), BHIM (@upi), Amazon Pay (@apl), and any other UPI-registered app from 100+ Indian banks. If your app can send a UPI payment, it works on SwappINR.',
  },
  {
    q: 'How long does it take to buy USDT with UPI?',
    a: 'UPI payment confirmation is instant. After payment, USDT delivery takes under 30 minutes for BEP-20 and TRC-20, and up to 1 hour for ERC-20. From opening the SwappINR app to having USDT in your wallet, most users complete the full process in 15–20 minutes.',
  },
  {
    q: 'Is there a UPI transaction limit for buying USDT?',
    a: 'Standard UPI limit is ₹1 lakh per transaction per day (set by NPCI). SwappINR accepts multiple UPI transactions per order for amounts above this limit — contact support if you need to buy more than ₹1 lakh worth of USDT in a single session. IMPS/NEFT/RTGS are also available for larger amounts.',
  },
  {
    q: 'Which USDT network should I choose when buying with UPI?',
    a: 'BEP-20 (BNB Chain) is the best choice for most users: lowest SwappINR fee (0.5%) and cheapest network gas (₹4–₹8). TRC-20 is equally fast with a 0.6% fee. Only choose ERC-20 if your wallet or destination exchange specifically requires Ethereum-based USDT.',
  },
  {
    q: 'Do I need a bank account to buy USDT with UPI on SwappINR?',
    a: 'Yes — UPI requires a linked bank account with your KYC-verified mobile number. You can\'t buy USDT via UPI with a wallet-only balance (like a Paytm wallet). The UPI payment must come from a bank account. This is a UPI system requirement, not a SwappINR restriction.',
  },
  {
    q: 'What is the minimum amount to buy USDT with UPI on SwappINR?',
    a: 'Minimum order is ₹1,000 (approximately 11–12 USDT at current rates). There is no maximum — for large orders above ₹1 lakh, you can use IMPS, NEFT, or RTGS, or make multiple UPI payments toward one order. Contact support for orders above ₹10 lakh.',
  },
];

const WALLETS = [
  { name: 'Trust Wallet',    networks: 'BEP-20, TRC-20, ERC-20', type: 'Mobile',    best: 'Beginners — supports all 3 networks' },
  { name: 'MetaMask',        networks: 'BEP-20, ERC-20',         type: 'Mobile/Desktop', best: 'DeFi users on Ethereum/BSC' },
  { name: 'Binance App',     networks: 'BEP-20, TRC-20, ERC-20', type: 'Mobile',    best: 'Users who also trade on Binance' },
  { name: 'OKX Wallet',      networks: 'BEP-20, TRC-20, ERC-20', type: 'Mobile/Extension', best: 'Multi-chain power users' },
  { name: 'TronLink',        networks: 'TRC-20 only',             type: 'Mobile/Extension', best: 'TRC-20 specialists' },
  { name: 'Coinbase Wallet', networks: 'ERC-20, BEP-20',         type: 'Mobile',    best: 'ERC-20 users, US-based DeFi' },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function BuyUsdtWithUpiPage() {
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
      { '@type': 'ListItem', position: 3, name: 'Buy with UPI', item: `${SITE_URL}/buy-usdt-with-upi` },
    ],
  };
  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Buy USDT with UPI — SwappINR',
    provider: { '@type': 'Organization', name: 'SwappINR' },
    description: 'Purchase USDT using UPI (Google Pay, PhonePe, Paytm, BHIM) in India. Instant payment confirmation, USDT delivered to your wallet in under 30 minutes.',
    areaServed: 'IN',
    serviceType: 'Cryptocurrency Exchange',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <SeoNav />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          📱 GPay · PhonePe · Paytm · BHIM · Any UPI app
        </div>
        <h1 style={{ fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Buy USDT with UPI in India —<br />
          <span style={{ color: '#CCFF00' }}>Pay with Any UPI App, Get USDT in 30 Min</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 36px' }}>
          The fastest way to buy USDT in India. Pay with Google Pay, PhonePe, Paytm, BHIM, or any UPI-enabled bank app. Receive USDT in BEP-20, TRC-20, or ERC-20 directly in your wallet — in under 30 minutes.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { v: '< 30 min', l: 'USDT delivery'          },
            { v: '0.5%',     l: 'Lowest fee (BEP-20)'    },
            { v: '₹0',       l: 'UPI transaction fee'    },
            { v: '24/7',     l: 'Order processing'       },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#CCFF00', letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
          Buy USDT with UPI Now →
        </Link>
      </section>

      {/* ── Supported UPI apps ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Every UPI app works on SwappINR</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>All 100+ UPI-enabled banks and every major UPI app are supported.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
            {UPI_APPS.map(({ name, icon, color, upiHandle, limit, note }) => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: color === '#CCFF00' ? 'rgba(204,255,0,0.1)' : `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4, fontFamily: 'var(--fr-font-mono)' }}>{upiHandle}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{limit} · {note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to buy USDT with UPI — step by step</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>From zero to USDT in your wallet.</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: i === 0 ? '#CCFF00' : i === 3 ? 'rgba(96,165,250,0.15)' : 'rgba(204,255,0,0.07)', border: i === 0 ? 'none' : i === 3 ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : i === 3 ? '#60A5FA' : '#CCFF00', fontFamily: 'var(--fr-font-mono)' }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 1, flexGrow: 1, background: 'rgba(255,255,255,0.06)', marginTop: 6 }} />}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>{s.title}</h3>
                  {i === 1 && <span style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>ONCE ONLY</span>}
                  {i === 3 && <span style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>GPay / PhonePe / Paytm / BHIM</span>}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why UPI ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why UPI is the best way to buy USDT in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Instant, free, and available 24/7 — exactly like USDT should be.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {WHY_UPI.map(({ icon, title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px', display: 'flex', gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 7, color: '#fff' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Network picker ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Which USDT network to receive after paying with UPI</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Choose based on your wallet and intended use — you can switch on every order.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {NETWORKS.map(({ name, chain, fee, gasFee, time, badge, color, wallets, bestFor }) => (
            <div key={name} style={{ background: `rgba(${color === '#CCFF00' ? '204,255,0' : color === '#00E5A0' ? '0,229,160' : '96,165,250'},0.04)`, border: `1px solid ${color}22`, borderRadius: 18, padding: '24px 20px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 16, right: 16, background: `rgba(${color === '#CCFF00' ? '204,255,0' : color === '#00E5A0' ? '0,229,160' : '96,165,250'},0.1)`, color, fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em' }}>{badge}</span>
              <div style={{ fontSize: 20, fontWeight: 900, color, marginBottom: 3, fontFamily: 'var(--fr-font-mono)' }}>{name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>{chain}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { l: 'Exchange fee', v: fee  },
                  { l: 'Network gas',  v: gasFee },
                  { l: 'Delivery',     v: time },
                  { l: 'Wallets',      v: wallets },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color, fontWeight: 700 }}>Best for: <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>{bestFor}</span></div>
            </div>
          ))}
        </div>

        {/* Network mismatch warning */}
        <div style={{ marginTop: 24, padding: '18px 22px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#FBBF24', marginBottom: 8 }}>⚠️ Network mismatch — a common mistake</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
            Always match the network you choose on SwappINR with the network your wallet or destination exchange expects. Sending BEP-20 USDT to a TRC-20 address (or vice versa) can result in lost funds. Double-check the network label in your wallet before confirming your order.
          </p>
        </div>
      </section>

      {/* ── Wallet guide ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Wallets to receive USDT you buy with UPI</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>You need a wallet address before placing your order — USDT is sent there directly.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Wallet', 'Supported networks', 'Type', 'Best for'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WALLETS.map(({ name, networks, type, best }, ri) => (
                  <tr key={name} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: '#fff' }}>{name}</td>
                    <td style={{ padding: '13px 14px', color: '#CCFF00', fontSize: 12, fontFamily: 'var(--fr-font-mono)' }}>{networks}</td>
                    <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{type}</td>
                    <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{best}</td>
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
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Buy USDT with UPI now — takes under 30 minutes</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
            Create a free account, complete 5-minute KYC once, and buy USDT with GPay, PhonePe, Paytm, or any UPI app instantly on every trade.
          </p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
            Get Started Free →
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.24)', marginTop: 14 }}>No credit card. No deposit. Free account, 5-min KYC.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Buy USDT with UPI — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Common questions about buying USDT with UPI in India.</p>
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
            ['Buy USDT with INR',        '/buy-usdt-with-inr'        ],
            ['Buy USDT KYC guide',       '/buy-usdt-without-kyc'     ],
            ['Sell USDT for INR',        '/sell-usdt-for-inr'        ],
            ['TRC-20 USDT to INR',       '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT to INR',       '/bep20-usdt-to-inr'        ],
            ['USDT to INR calculator',  '/usdt-to-inr-calculator'   ],
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
