import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';
import { UsdtCalcWidget } from '@/components/landing/usdt-calc-widget';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';

export const metadata: Metadata = {
  title: 'USDT to INR Calculator — Live Conversion Tool India',
  description: 'Calculate USDT to INR instantly. Enter USDT amount, choose TRC-20, BEP-20 or ERC-20, see exact INR payout after fees. Live rate calculator for India traders.',
  alternates: { canonical: '/usdt-to-inr-calculator' },
  keywords: ['USDT to INR calculator', 'usdt inr calculator', 'usdt to inr converter', 'tether to rupee calculator', 'usdt calculator india', '1 usdt to inr calculate', 'usdt conversion calculator india'],
  openGraph: {
    title: 'USDT to INR Calculator — Live Payout Estimator | SwappINR',
    description: 'Calculate exactly how much INR you\'ll receive for your USDT. Live rates, all networks.',
    url: 'https://www.swappinr.com/usdt-to-inr-calculator',
  },
};

const HOW_CALC_WORKS = [
  { step: '1', title: 'Live USDT/INR rate', body: 'The calculator uses the current USD/INR forex mid-market rate. Since USDT is pegged 1:1 to USD, this closely approximates the real USDT to INR conversion rate.' },
  { step: '2', title: 'Network fee deducted', body: 'SwappINR charges 0.5% (BEP-20), 0.6% (TRC-20), or 0.8% (ERC-20). The calculator shows you exactly how much is deducted before calculating your final INR payout.' },
  { step: '3', title: 'Network gas not included', body: 'The calculator doesn\'t include the blockchain network gas fee (typically ₹5–₹800 depending on the network), as this is paid from your wallet, not through SwappINR.' },
  { step: '4', title: 'Payout is guaranteed at confirmation', body: 'When you place a real order on SwappINR, the rate is locked at confirmation. The calculator\'s estimate may differ slightly from the live locked rate.' },
];

const EXAMPLES = [
  { usdt: 100,    bep20: null, trc20: null, erc20: null },
  { usdt: 500,    bep20: null, trc20: null, erc20: null },
  { usdt: 1000,   bep20: null, trc20: null, erc20: null },
  { usdt: 5000,   bep20: null, trc20: null, erc20: null },
  { usdt: 10000,  bep20: null, trc20: null, erc20: null },
];

const FAQ_ITEMS = [
  {
    q: 'How do I calculate USDT to INR?',
    a: 'Multiply your USDT amount by the current USD/INR rate (since 1 USDT ≈ 1 USD). Then subtract the exchange fee: 0.5% for BEP-20, 0.6% for TRC-20, 0.8% for ERC-20. The result is the INR you receive. SwappINR\'s calculator above does this automatically at the live rate.',
  },
  {
    q: 'What is 1 USDT to INR today?',
    a: 'The current USDT to INR rate is approximately ₹83–88, depending on the USD/INR forex rate at the moment. Use the live calculator above for the exact current figure, or check the USDT to INR rate page for a real-time reading.',
  },
  {
    q: 'How much INR will I get for 100 USDT?',
    a: 'At approximately ₹86/USDT with a 0.6% TRC-20 fee: 100 USDT × ₹86 = ₹8,600 gross, minus ₹51.60 fee = ₹8,548 net. Use the calculator above with your exact amount for a precise figure at the current live rate.',
  },
  {
    q: 'Does the USDT to INR calculator include network gas fees?',
    a: 'No. The calculator shows the SwappINR exchange fee (0.5–0.8%) but not the blockchain network gas fee you pay from your wallet. Gas costs: BEP-20 ~₹4–₹8, TRC-20 ~₹12, ERC-20 ₹170–₹850+ depending on network traffic.',
  },
  {
    q: 'Is the USDT to INR calculator accurate?',
    a: 'The calculator uses the last-fetched USD/INR mid-market rate and the exact SwappINR fee percentages. It\'s a reliable estimate, but the actual locked rate when you confirm an order may differ by 0.1–0.3% due to market movement. For the guaranteed locked rate, log in and start a live trade.',
  },
  {
    q: 'Which USDT network gives the most INR?',
    a: 'BEP-20 (BNB Chain) gives the most INR per USDT because it has the lowest SwappINR exchange fee at 0.5%. TRC-20 is close at 0.6%. ERC-20 gives the least at 0.8%, though for very large amounts the security of Ethereum may be worth the extra 0.3% cost.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default async function UsdtToInrCalculatorPage() {
  let approxRate = 86.5;
  try {
    await connectToDatabase();
    const docs = await Rate.find({ isActive: true, symbol: 'USDT', network: 'BEP20' }).lean();
    if (docs.length > 0) {
      const d = rateToDocument(docs[0] as Parameters<typeof rateToDocument>[0]);
      approxRate = d.sellRate / (1 - 0.005);
    }
  } catch { /* use default */ }

  const fmt = (usdt: number, feePct: number) => {
    const inr = usdt * approxRate * (1 - feePct);
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

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
      { '@type': 'ListItem', position: 2, name: 'USDT to INR Calculator', item: `${SITE_URL}/usdt-to-inr-calculator` },
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
          🧮 Live rate · All 3 networks · Exact fee breakdown
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          USDT to INR Calculator —<br />
          <span style={{ color: '#CCFF00' }}>See Exact Payout Before You Trade</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 48px' }}>
          Enter your USDT amount, choose your network, and see exactly how many rupees you&apos;ll receive after fees — at the live USD/INR rate, updated continuously.
        </p>
      </section>

      {/* ── Live calculator widget ── */}
      <section style={{ padding: '0 24px 80px', maxWidth: 560, margin: '0 auto' }}>
        <UsdtCalcWidget approxRate={approxRate} />
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Rate used: ~₹{approxRate.toFixed(2)}/USDT ·{' '}
          <Link href="/usdt-to-inr" style={{ color: '#CCFF00', textDecoration: 'none' }}>See live rate page</Link>
        </p>
      </section>

      {/* ── Example table ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>USDT to INR conversion examples</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Approximate INR payout at ~₹{approxRate.toFixed(2)}/USDT after SwappINR fees.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['USDT amount', 'BEP-20 (0.5%)', 'TRC-20 (0.6%)', 'ERC-20 (0.8%)'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 11, fontWeight: 700, color: i === 0 ? 'rgba(255,255,255,0.38)' : i === 1 ? '#CCFF00' : i === 2 ? '#00E5A0' : '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map(({ usdt }, ri) => (
                  <tr key={usdt} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: '#fff', fontFamily: 'var(--fr-font-mono)' }}>{usdt.toLocaleString('en-IN')} USDT</td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', fontWeight: 700 }}>{fmt(usdt, 0.005)}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: '#00E5A0', fontFamily: 'var(--fr-font-mono)', fontWeight: 700 }}>{fmt(usdt, 0.006)}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', color: '#60A5FA', fontFamily: 'var(--fr-font-mono)', fontWeight: 700 }}>{fmt(usdt, 0.008)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
            *Figures are estimates based on the current rate of ₹{approxRate.toFixed(2)}/USDT. Network gas fees (₹4–₹850+ depending on network) are not included. Actual payout may vary with live rate.
          </p>
        </div>
      </section>

      {/* ── How the calc works ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How the USDT to INR calculator works</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Understanding what drives the number you see.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {HOW_CALC_WORKS.map(({ step, title, body }) => (
            <div key={step} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#CCFF00', marginBottom: 14, fontFamily: 'var(--fr-font-mono)' }}>{step}</div>
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>USDT to INR calculator — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Answers about converting and calculating USDT to INR.</p>
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
            ['USDT to INR live rate',    '/usdt-to-inr'              ],
            ['Sell USDT for INR',        '/sell-usdt-for-inr'        ],
            ['BEP-20 USDT to INR',       '/bep20-usdt-to-inr'        ],
            ['TRC-20 USDT to INR',       '/trc20-usdt-to-inr'        ],
            ['SwappINR fees',            '/fees'                     ],
            ['How to sell USDT India',   '/how-to-sell-usdt-in-india'],
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
