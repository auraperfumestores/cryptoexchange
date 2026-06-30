import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'TRC-20 USDT to INR — Sell TRON USDT for Rupees in India',
  description: 'Sell TRC-20 USDT for INR in India. Near-zero TRON gas fees, 10-minute settlement, UPI or bank payout. Best TRC-20 USDT exchange rate. Zero hidden fees.',
  alternates: { canonical: '/trc20-usdt-to-inr' },
  keywords: ['TRC-20 USDT to INR', 'TRC20 USDT India', 'sell TRC-20 USDT', 'TRON USDT to rupees', 'TRC20 USDT exchange India', 'USDT TRC20 to INR', 'sell trc20 usdt india'],
  openGraph: {
    title: 'TRC-20 USDT to INR — Sell TRON USDT for Rupees | SwappINR',
    description: 'Sell TRC-20 USDT for INR with near-zero TRON gas fees. UPI settlement in ~10 minutes.',
    url: 'https://www.swappinr.com/trc20-usdt-to-inr',
  },
};

const TRC20_FACTS = [
  { label: 'Exchange fee',       value: '0.6%'           },
  { label: 'Network gas',        value: '~1 TRX (~₹12)'  },
  { label: 'Avg. settlement',    value: '~10 minutes'    },
  { label: 'Confirmations req.', value: '20 blocks'      },
  { label: 'Block time',         value: '~3 seconds'     },
  { label: 'USDT supply on TRON','value': '> 55% worldwide' },
];

const STEPS = [
  { n: '01', title: 'Open your TRC-20 compatible wallet', body: 'Trust Wallet, TronLink, Binance, or any wallet that supports the TRON network. Ensure you hold a small amount of TRX (≈ 5–10 TRX) to cover the gas fee for the transfer.' },
  { n: '02', title: 'Create a SwappINR account & complete KYC', body: 'One-time video KYC in under 5 minutes. Required by Indian regulations — done once, never repeated for subsequent trades.' },
  { n: '03', title: 'Start a new sell order — select TRC-20', body: 'Enter the USDT amount, choose TRC-20 as the network, and add your UPI ID or bank account details. See the exact INR payout before confirming.' },
  { n: '04', title: 'Send TRC-20 USDT to our wallet address', body: 'Transfer USDT on the TRON network to the address shown on your order page. Always verify the "TRC20" label in your wallet before sending.' },
  { n: '05', title: 'Receive INR in ~10 minutes', body: 'After 20 TRON block confirmations (~60 seconds), our system auto-detects your transfer and sends INR to your UPI or bank. Most orders settle in under 10 minutes.' },
];

const WALLET_GUIDE = [
  { wallet: 'Trust Wallet',  steps: 'Tap "Send" → search USDT → select "TRON (TRC-20)" → paste SwappINR address → confirm' },
  { wallet: 'TronLink',      steps: 'Choose USDT → send → verify TRC-20 network is selected → enter address & amount → sign' },
  { wallet: 'Binance',       steps: 'Withdraw → USDT → select TRC-20 network → enter SwappINR address → confirm with 2FA' },
  { wallet: 'OKX',           steps: 'Assets → Withdraw → USDT → TRC-20 → paste address → amount → confirm identity check' },
];

const VS_OTHER = [
  { feature: 'Exchange fee',        trc20: '0.6%',           bep20: '0.5%',         erc20: '0.8%'       },
  { feature: 'Gas cost',            trc20: '~₹12 (1 TRX)',  bep20: '~₹4 ($0.05)', erc20: '₹170–850+'  },
  { feature: 'Block time',          trc20: '~3 seconds',     bep20: '~3 seconds',   erc20: '~12 seconds' },
  { feature: 'Settlement on SwappINR', trc20: '~10 min',    bep20: '~8 min',       erc20: '~15 min'    },
  { feature: 'Global USDT supply',  trc20: '>55%',           bep20: '~20%',         erc20: '~20%'       },
  { feature: 'Wallet support India', trc20: 'Excellent',     bep20: 'Very good',    erc20: 'Good'       },
];

const FAQ_ITEMS = [
  {
    q: 'What is TRC-20 USDT and how does it differ from other networks?',
    a: 'TRC-20 USDT is Tether (USDT) issued on the TRON blockchain. It uses the same USDT token but travels through TRON\'s network, which has near-zero gas fees (~1 TRX ≈ ₹12) and 3-second block times. It holds over 55% of global USDT supply, making it the world\'s most-used USDT network by volume.',
  },
  {
    q: 'How do I sell TRC-20 USDT for INR in India?',
    a: 'On SwappINR, create an account, complete KYC, start a sell order, and select TRC-20. Send USDT from your Trust Wallet or TronLink to the displayed address. After 20 TRON confirmations (~1 minute), INR is sent to your UPI or bank within ~10 minutes total.',
  },
  {
    q: 'What is the fee to sell TRC-20 USDT on SwappINR?',
    a: 'SwappINR charges 0.6% for TRC-20 USDT conversions to INR. The only additional cost is the TRON network gas fee (approximately 1 TRX ≈ ₹12), which you pay from your wallet — not to SwappINR. There are no receiving, withdrawal, or processing fees.',
  },
  {
    q: 'Is TRC-20 cheaper than ERC-20 for selling USDT in India?',
    a: 'Significantly cheaper. ERC-20 gas fees can range from ₹170 to ₹850+ depending on Ethereum congestion. TRC-20 gas is approximately ₹12 (1 TRX) regardless of congestion. For smaller trades (under ₹1 lakh), TRC-20 or BEP-20 are almost always the better choice.',
  },
  {
    q: 'How long does TRC-20 USDT take to confirm on TRON?',
    a: 'TRON produces a block every ~3 seconds, and SwappINR requires 20 confirmations — approximately 60 seconds total. After confirmation, our system processes your order and sends INR. Total settlement time from sending USDT to receiving INR is typically 8–12 minutes.',
  },
  {
    q: 'Which wallets support TRC-20 USDT in India?',
    a: 'Trust Wallet (most popular), TronLink (TRON-native), Binance app, OKX Wallet, and most multi-chain wallets support TRC-20 USDT. MetaMask does NOT support TRC-20 — it is an Ethereum/BNB Chain wallet only.',
  },
  {
    q: 'Can I accidentally send TRC-20 USDT to the wrong network?',
    a: 'Yes — always verify the "TRC-20 / TRON" label is selected in your wallet before sending. Sending TRC-20 USDT to an ERC-20 address (or vice versa) will result in permanent loss of funds. SwappINR\'s order page clearly labels each address with the correct network.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function Trc20UsdtToInrPage() {
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
      { '@type': 'ListItem', position: 2, name: 'TRC-20 USDT to INR', item: `${SITE_URL}/trc20-usdt-to-inr` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SeoNav />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.22)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#00E5A0', letterSpacing: '0.05em' }}>
          TRON Network · ~₹12 gas · ~10 min settlement
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          TRC-20 USDT to INR in India —<br />
          <span style={{ color: '#00E5A0' }}>Near-Zero Gas, Instant UPI Payout</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 36px' }}>
          Sell TRC-20 USDT for Indian Rupees with the world&apos;s most popular USDT network. Near-zero TRON gas fees, 0.6% exchange fee, and INR delivered to your UPI in about 10 minutes.
        </p>

        {/* TRC-20 fact strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 36, maxWidth: 680, margin: '0 auto 36px' }}>
          {TRC20_FACTS.map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.14)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#00E5A0', letterSpacing: '-0.01em', fontFamily: 'var(--fr-font-mono)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>

        <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
          Sell TRC-20 USDT →
        </Link>
      </section>

      {/* ── Steps ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to sell TRC-20 USDT for INR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>From your TRON wallet to your bank account in 5 steps.</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: i === 0 ? '#00E5A0' : 'rgba(0,229,160,0.07)', border: i === 0 ? 'none' : '1px solid rgba(0,229,160,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: i === 0 ? '#000' : '#00E5A0', fontFamily: 'var(--fr-font-mono)' }}>
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

      {/* ── Wallet guide ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to send TRC-20 USDT from popular wallets</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Quick steps for the most commonly used wallets in India.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WALLET_GUIDE.map(({ wallet, steps }) => (
              <div key={wallet} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#00E5A0', flexShrink: 0, minWidth: 100 }}>{wallet}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, fontFamily: 'var(--fr-font-mono)' }}>{steps}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: '14px 18px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>
            ⚠️ <strong style={{ color: '#F87171' }}>Important:</strong> MetaMask does not support TRC-20. If you only have MetaMask, use <Link href="/bep20-usdt-to-inr" style={{ color: '#CCFF00', textDecoration: 'none' }}>BEP-20</Link> or ERC-20 instead.
          </div>
        </div>
      </section>

      {/* ── vs other networks ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>TRC-20 vs BEP-20 vs ERC-20 for selling USDT</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Compare all three USDT networks side by side.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Feature', 'TRC-20 (TRON)', 'BEP-20 (BNB)', 'ERC-20 (ETH)'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 700, color: i === 1 ? '#00E5A0' : i === 2 ? '#CCFF00' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VS_OTHER.map(({ feature, trc20, bep20, erc20 }, ri) => (
                <tr key={feature} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{feature}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#00E5A0', fontWeight: 700 }}>{trc20}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#CCFF00', fontWeight: 700 }}>{bep20}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.45)' }}>{erc20}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          For most India traders, TRC-20 and <Link href="/bep20-usdt-to-inr" style={{ color: '#CCFF00', textDecoration: 'none' }}>BEP-20</Link> are the best choices. TRC-20 wins on global liquidity and wallet support; BEP-20 wins on the lowest exchange fee (0.5%).
        </p>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Sell your TRC-20 USDT for INR today</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            No minimum. 0.6% fee. INR to UPI in ~10 minutes. See <Link href="/fees" style={{ color: '#00E5A0', textDecoration: 'none' }}>all fees</Link> or <Link href="/usdt-to-inr-calculator" style={{ color: '#00E5A0', textDecoration: 'none' }}>calculate your payout</Link>.
          </p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">
            Sell TRC-20 USDT Now →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>TRC-20 USDT to INR — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Everything about selling TRC-20 USDT for Indian Rupees.</p>
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
            ['BEP-20 USDT to INR',       '/bep20-usdt-to-inr'        ],
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
