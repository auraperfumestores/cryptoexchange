import Link from 'next/link';
import type { Metadata } from 'next';
import { SeoNav } from '@/components/landing/seo-nav';
import { SeoFooter } from '@/components/landing/seo-footer';

export const metadata: Metadata = {
  title: 'How to Sell USDT in India — Complete Guide 2025',
  description: 'Step-by-step guide to sell USDT for INR in India. Choose the right network (TRC-20, BEP-20, ERC-20), avoid common mistakes, get INR via UPI in 15 minutes.',
  alternates: { canonical: '/how-to-sell-usdt-in-india' },
  keywords: ['how to sell USDT in India', 'sell USDT India guide', 'USDT to INR India steps', 'sell tether India 2025', 'how to convert USDT to INR', 'sell USDT UPI India guide', 'sell usdt india 2024'],
  openGraph: {
    title: 'How to Sell USDT in India — Complete 2025 Guide | SwappINR',
    description: 'Full beginner guide: sell USDT for INR in India via UPI. TRC-20, BEP-20, ERC-20 explained.',
    url: 'https://www.swappinr.com/how-to-sell-usdt-in-india',
  },
};

const OPTIONS = [
  {
    option: 'Option 1: Sell via a crypto-to-INR exchange (SwappINR)',
    pros: ['Instant INR to UPI or bank account', 'No CEX account needed', 'Best net rate (0.5–0.8% flat fee, no spread)', 'Works 24/7 including weekends', 'Direct wallet to bank — no exchange registration'],
    cons: ['Requires KYC verification (one-time, 5 min)'],
    best: 'Best for: Most traders who want speed, best rates, and simplicity',
    recommended: true,
  },
  {
    option: 'Option 2: Sell on a centralised exchange (WazirX, CoinDCX, Zebpay)',
    pros: ['Familiar interface for exchange users', 'Can hold funds on the platform'],
    cons: ['Hidden 1–2% spread built into the rate', 'Withdrawal processing can take 1–4 hours', 'Requires exchange account + separate KYC', 'INR withdrawal sometimes has fees'],
    best: 'Best for: Users already registered and active on that CEX',
    recommended: false,
  },
  {
    option: 'Option 3: P2P (peer-to-peer)',
    pros: ['No platform fee (though implicit costs exist)', 'Some platforms allow cash deals'],
    cons: ['Counterparty risk — you rely on the buyer', 'Escrow delays of 30 min–2 hours common', 'Rate varies widely by buyer; hidden premium', 'Fraud risk on unverified P2P platforms'],
    best: 'Best for: Large cash deals where bank trail is inconvenient (PRO members on SwappINR get cash settlement with zero counterparty risk)',
    recommended: false,
  },
];

const COMMON_MISTAKES = [
  { mistake: 'Sending on the wrong network',       fix: 'Always verify the network label (TRC-20 / BEP-20 / ERC-20) in your wallet matches the address on SwappINR before confirming.' },
  { mistake: 'Not having enough gas in your wallet', fix: 'Keep a small reserve: ~5 TRX for TRC-20, ~0.001 BNB (~₹40) for BEP-20, ~0.003 ETH (~₹700) for ERC-20.' },
  { mistake: 'Sending before order is confirmed',   fix: 'Always wait for SwappINR to display the wallet address for your specific order — never send to a generic address.' },
  { mistake: 'Comparing stated fee, not total cost', fix: 'Factor in the exchange fee AND network gas. TRC-20 and BEP-20 have near-zero gas — ERC-20 gas can add ₹700+ to your cost.' },
  { mistake: 'Selling all USDT before checking rate', fix: 'Check the live rate on SwappINR first. Lock in the best rate by confirming your order, then send the exact amount. Never overpay or underpay the confirmed amount.' },
  { mistake: 'Not keeping trade records for tax',    fix: 'Download your SwappINR transaction history after each trade. Under Section 115BBH, crypto gains are taxed at 30% — records are essential for your ITR.' },
];

const NETWORK_CHOICE = [
  { q: 'You want the cheapest option',           a: 'BEP-20 (BNB Chain) — 0.5% fee + very low gas (~₹4–₹8).'         },
  { q: 'You use Trust Wallet or TronLink',       a: 'TRC-20 (TRON) — near-zero gas, world\'s most-used USDT network.' },
  { q: 'You use MetaMask (default network)',     a: 'BEP-20 or ERC-20 — check MetaMask is on BNB Smart Chain for BEP-20.' },
  { q: 'You\'re transferring more than ₹5 lakh', a: 'ERC-20 for maximum on-chain security, or BEP-20 for cost efficiency.' },
  { q: 'You want fastest settlement',            a: 'BEP-20 — ~8 min from send to INR in your account.'               },
  { q: 'You hold USDT on Binance',               a: 'All three work from Binance. Choose BEP-20 for best value.'        },
];

const FULL_STEPS = [
  {
    phase: 'Before you start',
    steps: [
      { title: 'Have USDT in a compatible wallet', body: 'You need USDT in your crypto wallet — Trust Wallet, MetaMask (BNB/ETH), TronLink (TRON), Binance, or similar. Ensure you hold enough network gas: ~5 TRX (TRC-20), ~0.001 BNB (BEP-20), or ~0.003 ETH (ERC-20).' },
      { title: 'Create and verify your SwappINR account', body: 'Register at swappinr.com with your email. Complete video KYC — a 2-minute process using your Aadhaar/PAN and a short selfie video. You only do this once; all future trades skip this step.' },
      { title: 'Have your INR destination ready', body: 'Know your UPI ID (e.g. name@upi), or have your bank account number and IFSC ready. You\'ll enter this when placing your order.' },
    ],
  },
  {
    phase: 'Placing your sell order',
    steps: [
      { title: 'Log in and click "Sell USDT"', body: 'From your SwappINR dashboard, select "New Trade" → "Sell USDT". Choose your network — BEP-20, TRC-20, or ERC-20.' },
      { title: 'Enter the amount', body: 'Type in the USDT amount you want to sell. The widget shows you the live rate and the exact INR you\'ll receive after the exchange fee. Verify this number before proceeding.' },
      { title: 'Enter your UPI ID or bank details', body: 'Input your UPI ID for instant transfer, or bank account number + IFSC for IMPS/NEFT/RTGS. PRO members can opt for cash or CDM settlement here.' },
      { title: 'Confirm the order', body: 'Review the summary: USDT amount, network, exchange rate, fee, and final INR payout. Click "Confirm Order" — this locks your rate for the confirmation window.' },
    ],
  },
  {
    phase: 'Sending your USDT',
    steps: [
      { title: 'Open your wallet and initiate transfer', body: 'Go to your wallet (Trust Wallet, MetaMask, etc.), tap Send, search for USDT, and SELECT THE CORRECT NETWORK. This is the most critical step — a wrong network means lost funds.' },
      { title: 'Paste the SwappINR wallet address', body: 'Copy the address from your SwappINR order page (never type manually — always copy-paste). Double-check the first and last 6 characters of the address match before sending.' },
      { title: 'Enter the exact USDT amount and send', body: 'Enter exactly the amount shown on your order. Sending more or less than the confirmed amount may delay processing. Confirm the transaction in your wallet and pay the gas fee.' },
    ],
  },
  {
    phase: 'Receiving your INR',
    steps: [
      { title: 'Wait for blockchain confirmation', body: 'Your SwappINR order page shows real-time confirmation progress. TRC-20 needs ~60 seconds (20 blocks), BEP-20 ~45 seconds (15 blocks), ERC-20 ~2–3 minutes (12 blocks).' },
      { title: 'INR sent automatically', body: 'Once confirmed on-chain, SwappINR\'s system automatically initiates the INR transfer to your UPI or bank. Standard settlement is 10–20 minutes from the time you sent USDT. PRO members: under 8 minutes.' },
      { title: 'Receive confirmation', body: 'You\'ll receive an in-app notification and email confirmation with the transaction details, including the UPI reference number or bank transfer ID. Download this for your tax records.' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is the fastest way to sell USDT for INR in India?',
    a: 'SwappINR is the fastest: send BEP-20 USDT and receive INR via UPI in approximately 8–10 minutes. For TRC-20, it\'s approximately 10–12 minutes. Centralised exchanges typically take 1–4 hours from sell order to INR landing in your bank.',
  },
  {
    q: 'Do I need to pay tax when I sell USDT in India?',
    a: 'Yes. Under Section 115BBH of the Indian Income Tax Act (effective April 2022), profits from selling cryptocurrency including USDT are taxed at 30% flat, plus 4% health and education cess. You must also deduct 1% TDS on transactions above ₹10,000 per year. Maintain records of every trade for your ITR.',
  },
  {
    q: 'Is it safe to sell USDT via SwappINR?',
    a: 'Yes. SwappINR is a KYC/AML-compliant exchange. Transactions are verified on-chain, funds are settled directly to your bank or UPI without intermediaries, and all trade records are available for audit. We do not custody your USDT — you send directly from your wallet to our wallet for each trade.',
  },
  {
    q: 'Can I sell USDT for INR without KYC in India?',
    a: 'No — SwappINR requires one-time KYC for all users in compliance with Indian FEMA and AML regulations. KYC takes approximately 5 minutes with a phone camera. Once completed, you never repeat it for future trades. Platforms claiming no-KYC USDT selling in India are operating outside regulatory compliance.',
  },
  {
    q: 'What is the daily limit for selling USDT in India?',
    a: 'SwappINR standard accounts have a ₹1 lakh daily sell limit. PRO membership removes this limit and is suitable for traders who sell ₹25 lakhs or more per month. There is no minimum sell amount.',
  },
  {
    q: 'What happens if I send USDT on the wrong network?',
    a: 'Sending USDT on the wrong network (e.g., TRC-20 USDT to a BEP-20 address) almost always results in permanent loss of funds — no recovery is possible, even by SwappINR or Tether. Always verify the exact network in your wallet matches the network shown on your SwappINR order before confirming.',
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.swappinr.com';

export default function HowToSellUsdtInIndiaPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Sell USDT in India — Complete Guide 2025',
    description: 'Step-by-step guide to sell USDT for INR in India. Choose the right network, avoid mistakes, receive INR via UPI in 15 minutes.',
    author: { '@type': 'Organization', name: 'SwappINR', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'SwappINR', url: SITE_URL },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    url: `${SITE_URL}/how-to-sell-usdt-in-india`,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'How to Sell USDT in India', item: `${SITE_URL}/how-to-sell-usdt-in-india` },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-sans)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <SeoNav />

      {/* ── Hero ── */}
      <section style={{ padding: '72px 24px 64px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.05em' }}>
          📘 Complete guide · Updated 2025 · India-specific
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          How to Sell USDT in India —<br />
          <span style={{ color: '#CCFF00' }}>Complete Step-by-Step Guide 2025</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 36px' }}>
          Everything you need to know to convert USDT to Indian Rupees safely, at the best rate, and get INR in your bank account in under 15 minutes. Network selection, common mistakes, tax guidance, and more.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Sell USDT Now →
          </Link>
          <Link href="/usdt-to-inr-calculator" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Calculate payout first
          </Link>
        </div>
      </section>

      {/* ── Options comparison ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>3 ways to sell USDT for INR in India</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Understand your options before choosing.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {OPTIONS.map((opt, i) => (
              <div key={i} style={{ background: opt.recommended ? 'rgba(204,255,0,0.04)' : 'rgba(255,255,255,0.025)', border: opt.recommended ? '1px solid rgba(204,255,0,0.2)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 22px', position: 'relative' }}>
                {opt.recommended && <div style={{ position: 'absolute', top: 14, right: 14, background: '#CCFF00', color: '#000', fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 99 }}>RECOMMENDED</div>}
                <h3 style={{ fontSize: 16, fontWeight: 800, color: opt.recommended ? '#CCFF00' : '#fff', marginBottom: 16 }}>{opt.option}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#00E5A0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pros</div>
                    {opt.pros.map(p => <div key={p} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 5, lineHeight: 1.5 }}>✓ {p}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Cons</div>
                    {opt.cons.map(c => <div key={c} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 5, lineHeight: 1.5 }}>✗ {c}</div>)}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: opt.recommended ? '#CCFF00' : 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 4 }}>📌 {opt.best}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full steps ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Full step-by-step: How to sell USDT on SwappINR</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 44 }}>From wallet to bank — everything you need to do, in order.</p>
        {FULL_STEPS.map(({ phase, steps }, pi) => (
          <div key={pi} style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 99, padding: '5px 14px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#CCFF00', letterSpacing: '0.04em' }}>
              Phase {pi + 1}: {phase}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {steps.map((s, si) => (
                <div key={si} style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                  <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', marginTop: 2 }}>
                    {si + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: '#fff' }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.46)', lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Network choice guide ── */}
      <section style={{ background: 'rgba(255,255,255,0.018)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>Which USDT network should you use to sell in India?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Quick decision guide based on your situation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NETWORK_CHOICE.map(({ q, a }) => (
              <div key={q} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{q}</div>
                <div style={{ fontSize: 14, color: '#CCFF00', fontWeight: 700 }}>→ {a}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/bep20-usdt-to-inr" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, fontSize: 13, color: '#CCFF00', textDecoration: 'none', fontWeight: 700 }}>
              BEP-20 full guide →
            </Link>
            <Link href="/trc20-usdt-to-inr" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 99, fontSize: 13, color: '#00E5A0', textDecoration: 'none', fontWeight: 700 }}>
              TRC-20 full guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Common mistakes ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>6 mistakes to avoid when selling USDT in India</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Common errors and how to avoid them.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
          {COMMON_MISTAKES.map(({ mistake, fix }) => (
            <div key={mistake} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#F87171', marginBottom: 8 }}>✗ {mistake}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>✓ {fix}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tax note ── */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 16, padding: '28px 24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#60A5FA', marginBottom: 14 }}>Tax on selling USDT in India — what you need to know</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 12 }}>
            Under <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Section 115BBH</strong> of the Income Tax Act (effective April 2022), profits from selling USDT or any VDA (Virtual Digital Asset) are taxed at a flat <strong style={{ color: '#F87171' }}>30%</strong>, plus 4% health and education cess — regardless of your income bracket.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 12 }}>
            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>1% TDS</strong> is also applicable under Section 194S on transactions exceeding ₹10,000 per year. The buyer (or platform) deducts this and deposits it with the government.
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75 }}>
            SwappINR provides a complete transaction history you can download for your CA or ITR filing. Keep records of every trade — purchase price, sell price, date, and amounts.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 780, margin: '0 auto 64px', padding: '0 24px' }}>
        <div style={{ background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: '44px 32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>Ready to sell your USDT for INR?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 28px' }}>
            Create a free account, complete one-time KYC in 5 minutes, and get your first USDT to INR trade settled in under 15 minutes.
          </p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CCFF00', color: '#000', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            Start Selling USDT →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>How to sell USDT in India — FAQ</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', textAlign: 'center', marginBottom: 36 }}>Common questions about selling USDT in India.</p>
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
            ['Sell USDT for INR',         '/sell-usdt-for-inr'        ],
            ['BEP-20 USDT to INR',        '/bep20-usdt-to-inr'        ],
            ['TRC-20 USDT to INR',        '/trc20-usdt-to-inr'        ],
            ['USDT to INR calculator',   '/usdt-to-inr-calculator'   ],
            ['USDT to INR live rate',    '/usdt-to-inr'              ],
            ['SwappINR fees',            '/fees'                     ],
            ['Buy USDT with INR',        '/buy-usdt-with-inr'        ],
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
