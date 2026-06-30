import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';

export const metadata: Metadata = {
  title: 'USDT to INR Rate Today — Live Exchange Rate India',
  description: 'Check live USDT to INR exchange rate in India. Sell USDT at the best rate with instant UPI payout. TRC-20, BEP-20, ERC-20 supported. Zero hidden fees.',
  alternates: { canonical: '/usdt-to-inr' },
  keywords: ['USDT to INR', 'USDT to INR rate today', '1 USDT to INR', 'USDT INR price', 'tether to rupee', 'USDT INR rate', 'usdt inr exchange rate', 'usdt price india today'],
  openGraph: {
    title: 'USDT to INR Live Rate — Best Exchange in India | SwappINR',
    description: 'Live USDT to INR rate updated every minute. Sell USDT for rupees in under 15 minutes.',
    url: 'https://www.swappinr.com/usdt-to-inr',
  },
};

const RATE_FACTORS = [
  { title: 'USD/INR forex rate',      body: 'The USDT/INR rate starts with the USD/INR interbank mid-market rate. As USDT is pegged 1:1 to USD, the base exchange rate follows this forex pair closely.' },
  { title: 'USDT peg stability',      body: 'USDT (Tether) maintains a near-1:1 peg with the US Dollar. Minor deviations (±0.01%) may occur during extreme market volatility, which can slightly affect the INR rate.' },
  { title: 'Our exchange spread',     body: 'SwappINR charges 0.5–0.8% on top of the mid-market rate, shown transparently before you confirm. No additional hidden spread is built into the quoted rate.' },
  { title: 'Network confirmation',    body: 'The rate is locked at the time you confirm your order and remains valid for the confirmation window. We do not re-quote or slip on settled trades.' },
];

const NETWORK_RATES = [
  { network: 'BEP-20 (BNB Chain)', fee: '0.5%', gas: 'Very low', advantage: 'Lowest total cost to sell USDT for INR', color: '#CCFF00', href: '/bep20-usdt-to-inr' },
  { network: 'TRC-20 (TRON)',      fee: '0.6%', gas: 'Near zero', advantage: 'Most popular — near-zero gas worldwide', color: '#00E5A0', href: '/trc20-usdt-to-inr' },
  { network: 'ERC-20 (Ethereum)', fee: '0.8%', gas: 'Moderate–high', advantage: 'Highest security for large amounts', color: '#60A5FA', href: null },
];

const MYTHS = [
  { myth: '"CEX rates are better"',       truth: 'Centralised exchanges add 1–2% spread hidden in the quoted rate. Our 0.5–0.8% shown fee is typically lower net cost than most Indian CEXs.' },
  { myth: '"P2P gives a better price"',   truth: 'P2P introduces counterparty risk, escrow delays, and inconsistent rates. SwappINR is instant, auditable, and rate-locked at confirmation.' },
  { myth: '"USDT and USD are the same"',  truth: 'USDT is near-pegged to USD but traded on-chain. Our rate tracks the USD/INR mid-market, so you get close to bank rate for your rupees.' },
  { myth: '"Higher USDT volume = worse rate"', truth: 'Our rate is independent of trade size up to ₹25 lakhs. PRO members actually get +0.3% better rate on every trade regardless of size.' },
];

const FAQ_ITEMS = [
  {
    q: 'What is the USDT to INR rate today?',
    a: 'The live USDT to INR rate tracks the USD/INR forex mid-market rate (currently around ₹83–88 per USDT). The exact rate changes every minute — sign in to see the live rate with our current fee included, locked for your trade.',
  },
  {
    q: 'How is the USDT to INR rate calculated?',
    a: 'USDT (Tether) is pegged 1:1 to USD. The USDT/INR rate is therefore the USD/INR interbank rate plus SwappINR\'s exchange fee (0.5–0.8%). We update our rate every minute from the forex mid-market to ensure you always get a fair price.',
  },
  {
    q: 'Why does the USDT to INR rate differ between platforms?',
    a: 'Some platforms hide a spread inside the rate (e.g., they quote ₹85 when the real rate is ₹87, keeping the ₹2 silently). SwappINR quotes close to the real rate and charges a transparent separate fee, so you can compare fairly.',
  },
  {
    q: 'What is 1 USDT to INR today?',
    a: 'As of today, 1 USDT is approximately ₹83–88 INR, depending on real-time USD/INR movements. Log in to SwappINR to see the exact live rate applicable to your trade — it\'s locked for 15 minutes after you confirm.',
  },
  {
    q: 'Does the USDT to INR rate change on weekends?',
    a: 'Yes. Crypto trades 24/7 and the USD/INR forex rate also shifts over the weekend due to offshore NDF (Non-Deliverable Forward) trading. SwappINR processes trades 24/7 at live rates including Saturdays, Sundays, and Indian holidays.',
  },
  {
    q: 'Is TRC-20 or BEP-20 better for getting the best USDT to INR rate?',
    a: 'BEP-20 gives the lowest exchange fee (0.5%), making it the best for net INR received. TRC-20 is close behind at 0.6% with near-zero gas costs. ERC-20 is best only for large amounts where security justifies the higher 0.8% fee.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default async function UsdtToInrPage() {
  // Fetch live rates for display
  let rates: Record<string, number> = {};
  try {
    await connectToDatabase();
    const docs = await Rate.find({ isActive: true, symbol: 'USDT' }).lean();
    for (const r of docs) {
      const d = rateToDocument(r as Parameters<typeof rateToDocument>[0]);
      rates[d.network] = d.sellRate;
    }
  } catch { /* show placeholder */ }

  const fmt = (r: number | undefined) => r ? `₹${r.toFixed(2)}` : '₹—';
  const avgRate = Object.values(rates).length > 0 ? Object.values(rates).reduce((a, b) => a + b, 0) / Object.values(rates).length : null;

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
      { '@type': 'ListItem', position: 2, name: 'USDT to INR', item: `${SITE_URL}/usdt-to-inr` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SeoNav active="/usdt-to-inr" />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          🟢 Live rates updated every minute
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          USDT to INR — Live Exchange Rate<br />
          <span style={{ color: '#CCFF00' }}>Best Price in India Today</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 40px' }}>
          See the live USDT/INR rate and convert Tether to Indian Rupees instantly. SwappINR tracks the USD/INR forex mid-market and shows your exact payout before you commit — no hidden spread.
        </p>

        {/* Live rate cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36, maxWidth: 640, margin: '0 auto 36px' }}>
          {[
            { label: 'BEP-20 Rate', value: fmt(rates['BEP20']), color: '#CCFF00', note: 'Fee: 0.5%' },
            { label: 'TRC-20 Rate', value: fmt(rates['TRC20']), color: '#00E5A0', note: 'Fee: 0.6%' },
            { label: 'ERC-20 Rate', value: fmt(rates['ERC20']), color: '#60A5FA', note: 'Fee: 0.8%' },
          ].map(({ label, value, color, note }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: '-0.02em', fontFamily: 'var(--fr-font-mono)', marginBottom: 6 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{note} · per 1 USDT</div>
            </div>
          ))}
        </div>

        {avgRate && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>
            Average rate across networks: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>₹{avgRate.toFixed(2)}</strong> per USDT · Updated live
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Sell USDT at Live Rate →
          </Link>
          <Link href="/usdt-to-inr-calculator" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Calculate payout
          </Link>
        </div>
      </section>

      {/* ── How rate is set ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How the USDT to INR rate is determined</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Understanding what drives the price you get when selling Tether for rupees.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {RATE_FACTORS.map(({ title, body }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CCFF00', marginBottom: 14 }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: '#fff' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.68, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rate by network ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>USDT to INR rate by network</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>The exchange rate differs slightly by network due to varying fee structures.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {NETWORK_RATES.map(net => (
            <div key={net.network} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: net.color, marginBottom: 16 }}>{net.network}</div>
              {[
                ['Exchange fee', net.fee],
                ['Network gas',  net.gas],
                ['Best for',     net.advantage],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
              {net.href && (
                <Link href={net.href} style={{ display: 'block', marginTop: 14, fontSize: 12, color: net.color, textDecoration: 'none', fontWeight: 700 }}>
                  Full {net.network.split(' ')[0]} guide →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Myth busting ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>USDT to INR rate — common misconceptions</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>What traders often get wrong when comparing USDT exchange rates in India.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MYTHS.map(({ myth, truth }) => (
              <div key={myth} style={{ display: 'flex', gap: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <span style={{ color: '#F87171', fontSize: 12, fontWeight: 900 }}>✗</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{myth}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>✓ {truth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '64px auto', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Get the live USDT to INR rate on your trade</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 28, lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            Log in or create a free account to see the real-time rate locked to your order. Want to estimate first? Try the <Link href="/usdt-to-inr-calculator" style={{ color: '#CCFF00', textDecoration: 'none' }}>USDT to INR calculator</Link>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: 'none' }}>
              Sell USDT at Live Rate →
            </Link>
            <Link href="/usdt-to-inr-calculator" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
              Calculate my payout
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>USDT to INR — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Common questions about the USDT to INR exchange rate in India.</p>
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
            ['Sell USDT for INR',         '/sell-usdt-for-inr'        ],
            ['USDT to INR calculator',   '/usdt-to-inr-calculator'   ],
            ['TRC-20 USDT to INR',       '/trc20-usdt-to-inr'        ],
            ['BEP-20 USDT to INR',       '/bep20-usdt-to-inr'        ],
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
