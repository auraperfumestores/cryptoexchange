import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'BEP-20 USDT to INR — Lowest Fee USDT Exchange India',
  description: 'Sell BEP-20 USDT for INR with the lowest 0.5% fee in India. BNB Chain USDT to rupees in ~8 minutes via UPI or bank. Zero hidden fees. KYC-verified exchange.',
  alternates: { canonical: '/bep20-usdt-to-inr' },
  keywords: ['BEP-20 USDT to INR', 'BEP20 USDT India', 'sell BEP-20 USDT', 'BNB Chain USDT to rupees', 'BEP20 USDT exchange India', 'cheapest USDT exchange India', 'lowest fee USDT India'],
  openGraph: {
    title: 'BEP-20 USDT to INR — Lowest Fee Exchange India | SwappINR',
    description: 'Sell BEP-20 USDT for INR at the lowest 0.5% fee. BNB Chain, UPI settlement in ~8 minutes.',
    url: 'https://www.swappinr.com/bep20-usdt-to-inr',
  },
};

const BEP20_FACTS = [
  { label: 'Exchange fee',           value: '0.5%'                },
  { label: 'Network gas',            value: '~$0.05 (very low)'  },
  { label: 'Avg. settlement',        value: '~8 minutes'         },
  { label: 'Confirmations req.',     value: '15 blocks'          },
  { label: 'Block time',             value: '~3 seconds'         },
  { label: 'SwappINR fee rank',      value: 'Lowest network'     },
];

const STEPS = [
  { n: '01', title: 'Set up a BEP-20 compatible wallet', body: 'Trust Wallet, MetaMask (connected to BNB Smart Chain), or your Binance account all support BEP-20 USDT. Ensure you hold a small amount of BNB (~0.001 BNB ≈ ₹50) for gas.' },
  { n: '02', title: 'Create your SwappINR account & KYC', body: 'Register and complete one-time video KYC in under 5 minutes. Valid once — no repeated verification for future trades.' },
  { n: '03', title: 'Place a sell order — select BEP-20', body: 'Enter your USDT amount, choose BEP-20 (BNB Smart Chain), and enter your UPI ID or bank details. See the INR payout locked at the live rate.' },
  { n: '04', title: 'Send BEP-20 USDT to our wallet', body: 'Send USDT on the BNB Smart Chain to the address shown. Always verify "BEP-20" or "BSC" is selected in your wallet — do not mix with TRC-20 or ERC-20.' },
  { n: '05', title: 'Receive INR in ~8 minutes', body: 'After 15 BSC block confirmations (~45 seconds), our system detects your transfer automatically and sends INR. Standard orders settle in about 8 minutes.' },
];

const WHY_BEP20 = [
  { title: 'Lowest exchange fee on SwappINR',   body: 'BEP-20 carries our lowest exchange rate at 0.5% — 0.1% lower than TRC-20 and 0.3% lower than ERC-20. On a ₹1 lakh trade, that saves ₹100–₹300 vs other networks.' },
  { title: 'Near-zero BNB gas costs',            body: 'BNB Smart Chain gas fees are among the lowest of any major blockchain — typically $0.03–$0.05 regardless of network traffic. You keep more of your USDT value.' },
  { title: 'Fastest settlement on SwappINR',     body: 'BEP-20 orders settle in approximately 8 minutes — the fastest of any network we support. Fewer confirmations required and rapid BSC block times combine for speed.' },
  { title: 'Compatible with MetaMask & Trust',   body: 'Both MetaMask (on BNB Smart Chain) and Trust Wallet fully support BEP-20 USDT. No special wallet needed — if you already have either app, you\'re ready.' },
];

const WALLET_GUIDE = [
  { wallet: 'Trust Wallet',  steps: 'Tap Send → USDT → select "Smart Chain (BEP-20)" → paste SwappINR address → confirm' },
  { wallet: 'MetaMask',      steps: 'Switch network to "BNB Smart Chain" → Send → USDT (BSC) → paste address → confirm' },
  { wallet: 'Binance',       steps: 'Withdraw → USDT → select BEP-20 (BSC) network → enter address → confirm 2FA' },
  { wallet: 'OKX Wallet',   steps: 'Assets → Withdraw → USDT → BEP-20 (BSC) → paste address → amount → confirm' },
];

const FAQ_ITEMS = [
  {
    q: 'What is BEP-20 USDT and why use it?',
    a: 'BEP-20 USDT is Tether (USDT) issued on BNB Smart Chain (BSC), Binance\'s blockchain. It combines very low gas fees (~$0.05), fast 3-second block times, and wide wallet support. On SwappINR it carries our lowest exchange fee of 0.5%, making it the most cost-efficient USDT to INR conversion option.',
  },
  {
    q: 'How do I sell BEP-20 USDT for INR on SwappINR?',
    a: 'Create an account, complete one-time KYC, start a sell order, select BEP-20, enter your UPI or bank details, send BEP-20 USDT from Trust Wallet or MetaMask to the displayed address. After ~15 BSC confirmations, INR is sent to your UPI within 8 minutes total.',
  },
  {
    q: 'What is the fee for BEP-20 USDT to INR?',
    a: 'SwappINR\'s BEP-20 exchange fee is 0.5% — the lowest across all supported networks. The only other cost is the BNB gas fee (~₹4–₹8), paid from your wallet. There are no hidden fees, no receiving charges, and no withdrawal deductions.',
  },
  {
    q: 'Is BEP-20 cheaper than TRC-20 for selling USDT in India?',
    a: 'On SwappINR, BEP-20 has a lower exchange fee (0.5% vs 0.6%). Both have near-zero gas fees. BEP-20 is slightly cheaper overall for most trade sizes, and it settles ~2 minutes faster (~8 min vs ~10 min). For traders focused on getting the absolute most INR per USDT, BEP-20 is the better choice.',
  },
  {
    q: 'Which wallets support BEP-20 USDT in India?',
    a: 'Trust Wallet, MetaMask (when switched to BNB Smart Chain), Binance, OKX Wallet, and most multi-chain wallets support BEP-20 USDT. TronLink does NOT support BEP-20 — it is a TRON-only wallet.',
  },
  {
    q: 'How long does BEP-20 USDT take to settle for INR?',
    a: 'SwappINR requires 15 BNB Smart Chain confirmations, which takes approximately 45 seconds. After that, we process your order and send INR — total time from sending USDT to receiving INR is approximately 7–10 minutes for standard trades.',
  },
  {
    q: 'Why does SwappINR charge less for BEP-20 than other networks?',
    a: 'Our fee structure reflects the actual operational cost per network. BEP-20 has reliable, low-cost infrastructure on BSC that reduces our on-chain costs, which we pass on to you as a lower fee. ERC-20 has higher infrastructure costs due to Ethereum gas volatility.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function Bep20UsdtToInrPage() {
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
      { '@type': 'ListItem', position: 2, name: 'BEP-20 USDT to INR', item: `${SITE_URL}/bep20-usdt-to-inr` },
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
          🏆 LOWEST FEE · 0.5% · BNB Smart Chain · ~8 min
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          BEP-20 USDT to INR —<br />
          <span style={{ color: '#CCFF00' }}>Lowest Fee USDT Exchange in India</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px' }}>
          Sell BEP-20 (BNB Chain) USDT for Indian Rupees at our lowest 0.5% fee. Near-zero BNB gas, fastest 8-minute settlement, and INR direct to your UPI or bank account.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 36, maxWidth: 680, margin: '0 auto 36px' }}>
          {BEP20_FACTS.map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(204,255,0,0.04)', border: '1px solid rgba(204,255,0,0.14)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>

        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
          Sell BEP-20 USDT →
        </Link>
      </section>

      {/* ── Why BEP-20 ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Why BEP-20 is the best network for selling USDT in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Lowest cost, fastest settlement, widest wallet support.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {WHY_BEP20.map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCFF00', marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to sell BEP-20 USDT for INR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>BNB Smart Chain USDT to your bank account in five steps.</p>
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
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wallet steps ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Sending BEP-20 USDT from your wallet</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Quick wallet-specific steps to send BNB Chain USDT.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WALLET_GUIDE.map(({ wallet, steps }) => (
              <div key={wallet} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#CCFF00', flexShrink: 0, minWidth: 100 }}>{wallet}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, fontFamily: 'var(--fr-font-mono)' }}>{steps}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.14)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            ⚠️ Sending BEP-20 USDT to a TRC-20 address (or vice versa) causes permanent loss of funds. Always verify the network label before confirming the transaction.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '64px auto', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Sell BEP-20 USDT for INR — lowest fee in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            0.5% fee. 8-minute settlement. UPI or bank transfer. <Link href="/fees" style={{ color: '#CCFF00', textDecoration: 'none' }}>Compare all fees</Link> or <Link href="/usdt-to-inr-calculator" style={{ color: '#CCFF00', textDecoration: 'none' }}>calculate your payout</Link> first.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Sell BEP-20 USDT Now →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>BEP-20 USDT to INR — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything about BEP-20 USDT to INR in India.</p>
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
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Related guides</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['TRC-20 USDT to INR',       '/trc20-usdt-to-inr'        ],
            ['Sell USDT for INR',        '/sell-usdt-for-inr'        ],
            ['USDT to INR rate today',   '/usdt-to-inr'              ],
            ['USDT to INR calculator',  '/usdt-to-inr-calculator'   ],
            ['SwappINR fees',           '/fees'                     ],
            ['How to sell USDT India',  '/how-to-sell-usdt-in-india'],
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
