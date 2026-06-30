import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'SwappINR Fees — Cheapest USDT to INR Exchange in India',
  description: 'SwappINR charges 0.5–0.8% per trade. No withdrawal fees, no hidden spread, no subscription. Transparent USDT to INR fee breakdown for all networks. Compare and save.',
  alternates: { canonical: '/fees' },
  keywords: ['cheapest USDT exchange India', 'USDT to INR fees', 'SwappINR fees', 'usdt exchange fee India', 'lowest fee USDT INR', 'USDT to INR charges', 'best USDT exchange India fee'],
  openGraph: {
    title: 'SwappINR Fees — Cheapest USDT to INR Exchange | SwappINR',
    description: '0.5–0.8% exchange fee. No hidden charges. Full USDT to INR fee breakdown.',
    url: 'https://www.swappinr.com/fees',
  },
};

const FEE_TABLE = [
  { network: 'BEP-20 (BNB Chain)', fee: '0.5%', gas: '~$0.05 (very low)', settlement: '~8 min', color: '#CCFF00', badge: 'LOWEST FEE', href: '/bep20-usdt-to-inr' },
  { network: 'TRC-20 (TRON)',      fee: '0.6%', gas: '~1 TRX (~₹12)',     settlement: '~10 min', color: '#00E5A0', badge: 'POPULAR',    href: '/trc20-usdt-to-inr' },
  { network: 'ERC-20 (Ethereum)', fee: '0.8%', gas: '₹170–₹850+',        settlement: '~15 min', color: '#60A5FA', badge: null,         href: null                 },
];

const WHAT_INCLUDED = [
  { included: true,  item: 'Exchange fee (shown upfront at order confirmation)'       },
  { included: true,  item: 'INR payout to UPI, IMPS, NEFT, RTGS (all methods)'       },
  { included: true,  item: 'On-chain transaction monitoring & auto-confirmation'       },
  { included: true,  item: 'KYC verification (one-time, lifetime validity)'            },
  { included: true,  item: 'Trade confirmations, receipts & tax-ready transaction log' },
  { included: false, item: 'Withdrawal fee (we charge none)'                           },
  { included: false, item: 'Hidden spread in the quoted rate (we show real rate)'      },
  { included: false, item: 'Subscription or monthly platform fee'                      },
  { included: false, item: 'Re-KYC or account maintenance charges'                    },
  { included: false, item: 'Minimum trade fee or fixed charges'                       },
];

const PAYOUT_FEES = [
  { method: 'UPI',   fee: '₹0',    note: 'Instant. PhonePe, GPay, Paytm, BHIM — all free.' },
  { method: 'IMPS',  fee: '₹0',    note: '24/7 bank transfer. We cover the bank charge.'    },
  { method: 'NEFT',  fee: '₹0',    note: 'Business hours. No extra fee from SwappINR.'      },
  { method: 'RTGS',  fee: '₹0',    note: 'Above ₹2 lakhs. Real-time. Covered by us.'       },
  { method: 'CDM',   fee: 'Ask',   note: 'PRO members only. Arrange via support.'           },
  { method: 'Cash',  fee: 'Ask',   note: 'PRO members only. Delhi/Mumbai coverage.'         },
];

const CEX_COMPARISON = [
  { platform: 'SwappINR',     fee: '0.5–0.8%', hidden: 'None',         withdrawal: '₹0',     total: '0.5–0.8%' },
  { platform: 'WazirX',       fee: '0.2%',     hidden: '~1.5% spread', withdrawal: '₹0–₹25', total: '~1.7–2%'  },
  { platform: 'CoinDCX',      fee: '0.2%',     hidden: '~1.2% spread', withdrawal: '₹0–₹20', total: '~1.4–1.6%' },
  { platform: 'Zebpay',       fee: '0.1%',     hidden: '~1.8% spread', withdrawal: '₹0–₹30', total: '~1.9–2.1%' },
  { platform: 'P2P (unverified)', fee: '0%',   hidden: 'Counterparty + escrow delay', withdrawal: 'Variable', total: 'Often 2–4%+' },
];

const FAQ_ITEMS = [
  {
    q: 'What is the fee to sell USDT for INR on SwappINR?',
    a: 'SwappINR charges a single transparent exchange fee: 0.5% for BEP-20 (BNB Chain), 0.6% for TRC-20 (TRON), and 0.8% for ERC-20 (Ethereum). There are no withdrawal fees, no hidden spreads, and no subscription charges.',
  },
  {
    q: 'Are there any hidden fees on SwappINR?',
    a: 'No. The INR amount shown at order confirmation is exactly what lands in your account. We do not build a spread into the rate — you see the real USD/INR rate with our fee shown separately. No surprises, ever.',
  },
  {
    q: 'What is the cheapest way to sell USDT for INR in India?',
    a: 'Use BEP-20 (BNB Chain) USDT on SwappINR. The exchange fee is 0.5% with near-zero BNB gas (~$0.05). This is the cheapest combination of exchange fee + network gas available for USDT to INR conversion in India.',
  },
  {
    q: 'Why does SwappINR charge a higher fee for ERC-20 vs TRC-20?',
    a: 'ERC-20 (Ethereum) has significantly higher and more volatile gas fees, which increases our operational cost to process those transactions. We pass through the exact cost with no markup — 0.8% reflects the real cost difference of operating on Ethereum vs TRON or BNB Chain.',
  },
  {
    q: 'Is there a minimum trade fee or fixed charge?',
    a: 'No fixed minimum charge. You pay the percentage fee on whatever amount you trade. A ₹1,000 trade at 0.5% costs ₹5 in fees. A ₹1,00,000 trade costs ₹500 in fees. There are no minimum charges, setup fees, or fixed per-trade costs.',
  },
  {
    q: 'Do I pay extra for UPI or bank transfer payouts?',
    a: 'No. All payout methods — UPI, IMPS, NEFT, RTGS — are included in the single exchange fee. SwappINR covers the bank transfer costs on our end. There is no extra charge for receiving INR in your account by any method.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function FeesPage() {
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
      { '@type': 'ListItem', position: 2, name: 'Fees', item: `${SITE_URL}/fees` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SeoNav active="/fees" />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          💰 Transparent · No hidden charges · No surprises
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          SwappINR Fees —<br />
          <span style={{ color: '#CCFF00' }}>Cheapest USDT to INR Exchange in India</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 36px' }}>
          One flat percentage fee per network. No withdrawal charges. No hidden spread. No subscription. The INR amount you see before confirming is exactly what arrives in your account.
        </p>

        {/* Fee summary cards */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
          {FEE_TABLE.map(n => (
            <div key={n.network} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 16, padding: '20px 24px', textAlign: 'center', minWidth: 140, position: 'relative' }}>
              {n.badge && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: n.color, color: '#000', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: '0 0 8px 8px' }}>{n.badge}</div>}
              <div style={{ fontSize: 28, fontWeight: 900, color: n.color, fontFamily: 'var(--fr-font-mono)', marginBottom: 6, marginTop: 8 }}>{n.fee}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>{n.network}</div>
            </div>
          ))}
        </div>

        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
          Start Trading →
        </Link>
      </section>

      {/* ── Full fee table ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Full fee breakdown by network</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>All costs you will ever pay on SwappINR, by network.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FEE_TABLE.map(net => (
              <div key={net.network} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', position: 'relative' }}>
                {net.badge && <div style={{ position: 'absolute', top: 14, right: 14, background: net.color, color: '#000', fontSize: 10, fontWeight: 900, padding: '3px 9px', borderRadius: 99 }}>{net.badge}</div>}
                <div style={{ fontSize: 16, fontWeight: 800, color: net.color, marginBottom: 20 }}>{net.network}</div>
                {[
                  ['SwappINR exchange fee', net.fee],
                  ['Network gas (yours)',   net.gas],
                  ['INR payout fee',        '₹0 (free)'],
                  ['Withdrawal fee',        '₹0 (free)'],
                  ['Subscription',          'None'],
                  ['Settlement time',       net.settlement],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: v === '₹0 (free)' || v === 'None' ? '#00E5A0' : 'rgba(255,255,255,0.7)', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
                {net.href && (
                  <Link href={net.href} style={{ display: 'block', marginTop: 16, fontSize: 12, color: net.color, textDecoration: 'none', fontWeight: 700 }}>
                    {net.network.split(' ')[0]} full guide →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's included ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>What&apos;s included and what&apos;s not</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Exactly what you pay for — and what you never will.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {WHAT_INCLUDED.map(({ included, item }) => (
            <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: included ? 'rgba(0,229,160,0.04)' : 'rgba(248,113,113,0.04)', border: `1px solid ${included ? 'rgba(0,229,160,0.14)' : 'rgba(248,113,113,0.12)'}`, borderRadius: 10 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{included ? '✅' : '❌'}</span>
              <span style={{ fontSize: 13, color: included ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Payout method fees ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>INR payout fees</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>All bank and UPI transfer fees are covered by SwappINR — you pay nothing extra.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {PAYOUT_FEES.map(({ method, fee, note }) => (
              <div key={method} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{method}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: fee === '₹0' ? '#00E5A0' : '#CCFF00', fontFamily: 'var(--fr-font-mono)' }}>{fee}</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CEX comparison ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How SwappINR fees compare to Indian crypto exchanges</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Most platforms hide their real cost in the spread. We don&apos;t.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Platform', 'Stated fee', 'Hidden spread', 'Withdrawal', 'Real total cost'].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CEX_COMPARISON.map(({ platform, fee, hidden, withdrawal, total }, ri) => (
                <tr key={platform} style={{ background: ri === 0 ? 'rgba(204,255,0,0.04)' : ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td style={{ padding: '13px 14px', fontWeight: ri === 0 ? 900 : 600, color: ri === 0 ? '#CCFF00' : 'rgba(255,255,255,0.65)' }}>{platform}{ri === 0 && ' ✓'}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--fr-font-mono)' }}>{fee}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'center', color: ri === 0 ? '#00E5A0' : 'rgba(248,113,113,0.8)', fontSize: 12 }}>{hidden}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--fr-font-mono)' }}>{withdrawal}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'center', fontWeight: 800, color: ri === 0 ? '#CCFF00' : 'rgba(248,113,113,0.7)', fontFamily: 'var(--fr-font-mono)' }}>{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>*Spread estimates are approximate based on observed CEX mid-market deviations. Actual figures vary. SwappINR data is exact.</p>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>See the exact fee on your trade before you commit</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            Enter your amount, see the fee and exact INR payout — all before sending a single USDT. Use the <Link href="/usdt-to-inr-calculator" style={{ color: '#CCFF00', textDecoration: 'none' }}>USDT calculator</Link> to estimate, or sign up and see live.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
              Start Trading Free →
            </Link>
            <Link href="/usdt-to-inr-calculator" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              Calculate payout
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Fee FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Answers about SwappINR fees and charges.</p>
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
        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Related</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            ['BEP-20 USDT to INR (lowest fee)', '/bep20-usdt-to-inr'        ],
            ['TRC-20 USDT to INR',              '/trc20-usdt-to-inr'        ],
            ['Sell USDT for INR',               '/sell-usdt-for-inr'        ],
            ['USDT to INR calculator',          '/usdt-to-inr-calculator'   ],
            ['USDT to INR rate',                '/usdt-to-inr'              ],
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
