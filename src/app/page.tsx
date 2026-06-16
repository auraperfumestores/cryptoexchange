import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import ExchangeWidget from '@/components/landing/exchange-widget';
import LandingScripts from '@/components/landing/LandingScripts';
import HeroBg3D from '@/components/landing/HeroBg3D';
import {
  IconArrow, IconShield, IconClock, IconZap, IconLock, IconSwap,
  IconChart, IconGlobe, IconUpi, IconStar, IconCheck, IconPlay,
  IconX, IconPro, IconTrend, PlatformFeatures,
} from '@/components/landing/page-icons';
import StatCounter from '@/components/ui/stat-counter';
import StaticMesh from '@/components/ui/static-mesh';

/* ─── Data ────────────────────────────────────────────── */
const TICKER_ITEMS = [
  { label: 'USDT/INR', value: '₹88.45', accent: true },
  { label: 'BEP-20 Fee', value: '0.5%', accent: false },
  { label: '24H Volume', value: '₹4.2 Cr', accent: true },
  { label: 'Trades Today', value: '1,247', accent: false },
  { label: 'Avg Payout', value: '< 15 min', accent: true },
  { label: 'ERC-20 Rate', value: '₹87.90', accent: false },
  { label: 'TRC-20 Rate', value: '₹88.10', accent: true },
  { label: 'Users Online', value: '834', accent: false },
];

const FEATURES = [
  { icon: <IconZap />, title: 'Instant Settlement', body: 'Most trades settle in 10–15 minutes. No banking delays, day or night.', color: 'var(--fr-lime)' },
  { icon: <IconChart />, title: 'Best Market Rates', body: 'We monitor rates continuously to ensure you always get maximum value.', color: 'var(--fr-neon-teal)' },
  { icon: <IconShield />, title: '100% Secure', body: 'Every transaction verified on-chain. No custody risk, no exposure.', color: 'var(--fr-neon-purple)' },
  { icon: <IconGlobe />, title: 'Multi-Network', body: 'BEP-20, ERC-20, TRC-20 — trade from any blockchain ecosystem.', color: 'var(--fr-neon-blue)' },
  { icon: <IconUpi />, title: 'UPI · Bank · Cash', body: 'Receive directly to UPI ID, IMPS bank transfer, or in-person cash.', color: 'var(--fr-neon-orange)' },
  { icon: <IconClock />, title: '24/7 Support', body: 'Real humans on every trade. WhatsApp, Telegram, or email anytime.', color: 'var(--fr-neon-pink)' },
];

const LIVE_TRADES = [
  { name: 'Raj***', amount: '₹42,500',  txid: 'TXN***4521', network: 'BEP-20', time: '1 min ago',  color: 'teal',   nameColor: '#00D4C8' },
  { name: 'Pri***', amount: '₹18,750',  txid: 'TXN***8832', network: 'TRC-20', time: '2 min ago',  color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Vik***', amount: '₹75,000',  txid: 'TXN***2219', network: 'ERC-20', time: '3 min ago',  color: 'green',  nameColor: '#22C55E' },
  { name: 'Anu***', amount: '₹33,200',  txid: 'TXN***6670', network: 'BEP-20', time: '4 min ago',  color: 'pink',   nameColor: '#F72585' },
  { name: 'Sam***', amount: '₹91,000',  txid: 'TXN***3344', network: 'TRC-20', time: '5 min ago',  color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Dev***', amount: '₹27,800',  txid: 'TXN***7751', network: 'BEP-20', time: '6 min ago',  color: 'teal',   nameColor: '#00D4C8' },
  { name: 'Kav***', amount: '₹55,600',  txid: 'TXN***9983', network: 'ERC-20', time: '7 min ago',  color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Rah***', amount: '₹12,450',  txid: 'TXN***1127', network: 'TRC-20', time: '8 min ago',  color: 'green',  nameColor: '#22C55E' },
  { name: 'Moh***', amount: '₹68,900',  txid: 'TXN***5566', network: 'BEP-20', time: '9 min ago',  color: 'pink',   nameColor: '#F72585' },
  { name: 'Nis***', amount: '₹24,300',  txid: 'TXN***4488', network: 'ERC-20', time: '10 min ago', color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Tan***', amount: '₹87,500',  txid: 'TXN***2295', network: 'TRC-20', time: '11 min ago', color: 'teal',   nameColor: '#00D4C8' },
  { name: 'She***', amount: '₹46,750',  txid: 'TXN***7743', network: 'BEP-20', time: '12 min ago', color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Arp***', amount: '₹15,800',  txid: 'TXN***3311', network: 'ERC-20', time: '13 min ago', color: 'green',  nameColor: '#22C55E' },
  { name: 'Kir***', amount: '₹62,000',  txid: 'TXN***8899', network: 'TRC-20', time: '14 min ago', color: 'pink',   nameColor: '#F72585' },
  { name: 'Man***', amount: '₹38,400',  txid: 'TXN***6622', network: 'BEP-20', time: '15 min ago', color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Poo***', amount: '₹99,200',  txid: 'TXN***1144', network: 'ERC-20', time: '16 min ago', color: 'teal',   nameColor: '#00D4C8' },
];

const PRO_FEATURES = [
  { label: 'Exchange rates', standard: 'Market rate', pro: '+0.3% better rate' },
  { label: 'Daily volume limit', standard: '₹10 lakhs', pro: 'Unlimited' },
  { label: 'Settlement speed', standard: '10–20 min', pro: 'Priority < 8 min' },
  { label: 'Payment methods', standard: 'UPI + Bank', pro: 'UPI + Bank + Cash' },
  { label: 'Support', standard: 'Email / Telegram', pro: 'Dedicated manager' },
  { label: 'Cash deals', standard: false, pro: true },
  { label: 'Bulk pricing', standard: false, pro: true },
];

const TESTIMONIALS = [
  { name: 'Arjun M.', location: 'Mumbai', trade: '₹5,00,000', rating: 5, quote: 'Fastest crypto-to-INR service I\'ve used. Got ₹5 lakhs credited within 12 minutes. Absolutely seamless.' },
  { name: 'Priya S.', location: 'Bangalore', trade: '₹2,50,000', rating: 5, quote: 'Finally an exchange that works in India. Best rates I\'ve found, and the team is super responsive.' },
  { name: 'Rohit V.', location: 'Delhi', trade: '₹8,00,000', rating: 5, quote: 'My go-to for 6 months. Done 20+ trades and never had an issue. Trust them completely.' },
];

const NETWORKS = [
  { name: 'Ethereum (ERC-20)', short: 'ERC-20', color: 'blue' as const, rate: '₹87.90', fee: '0.8%', time: '~15 min', desc: 'Trade USDT on Ethereum mainnet. High security, supported across all major wallets.' },
  { name: 'BNB Chain (BEP-20)', short: 'BEP-20', color: 'teal' as const, rate: '₹88.45', fee: '0.5%', time: '~8 min', desc: 'Fastest and cheapest network. Ideal for frequent traders who want minimal fees.' },
  { name: 'TRON (TRC-20)', short: 'TRC-20', color: 'green' as const, rate: '₹88.10', fee: '0.6%', time: '~10 min', desc: 'Most popular USDT network globally. Near-zero fees with fast confirmation times.' },
];

const FAQ_ITEMS = [
  { q: 'How quickly do I receive INR after sending USDT?', a: 'Most trades settle within 10–20 minutes after your crypto transaction is confirmed. PRO members receive settlements in under 8 minutes.' },
  { q: 'Which networks do you support?', a: 'We support USDT on BEP-20 (BNB Chain), ERC-20 (Ethereum), and TRC-20 (TRON). BEP-20 offers the lowest fees; TRC-20 is most popular globally.' },
  { q: 'Are there hidden fees?', a: 'No. Our fee is a simple percentage (0.5–0.8%) shown upfront before you confirm. What you see is exactly what you get.' },
  { q: 'What are the trade limits?', a: 'No minimums or maximums. We handle trades from ₹5,000 to ₹1 crore+. For trades above ₹25 lakhs, PRO membership gives the best rates.' },
  { q: 'How do I receive my INR?', a: 'Via UPI (instant), IMPS bank transfer (same-day), or cash deal for eligible PRO users. Provide your UPI ID or bank details when placing your order.' },
  { q: 'Is SwapINR safe and regulated?', a: 'Yes. All transactions are verified on-chain. We follow Indian FEMA guidelines, KYC/AML best practices, and operate with full blockchain transparency.' },
];

const MARQUEE_ITEMS = ['INSTANT SETTLEMENT', 'BEST RATES', 'ZERO HIDDEN FEES', 'ON-CHAIN VERIFIED', '24/7 SUPPORT', 'UPI PAYOUTS', 'BANK TRANSFER', 'CASH DEALS', 'MULTI-NETWORK'];

const PERKS = [
  'Real-time rate guarantee — get the rate you see',
  'No minimum or maximum trade limits',
  'Direct UPI settlement in seconds',
  'Transparent fee — no surprises ever',
];

const ACADEMY_FEATURES = [
  'How to send USDT from Binance to SwapINR',
  'Choosing the right network: BEP-20 vs TRC-20',
  'Understanding crypto-to-INR market rates',
  'Avoiding common mistakes in P2P trading',
  'PRO tips to maximise your payout',
];

/* ─── Page ─────────────────────────────────────────────── */
export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect('/dashboard');

  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const marqueeDoubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <main style={{ background: 'var(--fr-black)', overflowX: 'hidden', fontFamily: 'var(--fr-font-sans)' }}>
      <LandingScripts />

      {/* ══ 1. TICKER ══ */}
      <div className="fr-ticker-strip">
        <div className="fr-ticker-track">
          {tickerDoubled.map((item, i) => (
            <span key={i} className={`fr-ticker-item${item.accent ? ' fr-ticker-item--accent' : ''}`}>
              {item.label}&nbsp;
              <span style={{ fontFamily: 'var(--fr-font-mono)', fontWeight: 700 }}>{item.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ 2. NAV ══ */}
      <nav className="fr-nav">
        <div className="fr-nav__inner">
          <Link href="/" className="fr-nav__logo">
            <div className="fr-nav__logo-icon">S</div>
            <span className="fr-nav__logo-name">Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
          </Link>
          <ul className="fr-nav__links">
            {[['How it Works','#how'],['Features','#features'],['Networks','#networks'],['PRO','#pro'],['FAQ','#faq']].map(([l, h]) => (
              <li key={l}><Link href={h} className="fr-nav__link">{l}</Link></li>
            ))}
          </ul>
          <div className="fr-nav__actions">
            <Link href="#pro" className="fr-nav__pro-badge">
              <IconPro /> PRO
            </Link>
            <Link href="/login" className="fr-nav__login">Sign in</Link>
            <Link href="/register" className="fr-btn fr-btn--primary fr-btn--md">Get Started <IconArrow /></Link>
            <button className="fr-nav__hamburger" data-mobile-toggle aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="fr-mobile-menu" data-mobile-menu>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
          <button data-mobile-toggle style={{ background: 'none', border: '1px solid var(--fr-border-default)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--fr-text-secondary)', display: 'flex' }}><IconX /></button>
        </div>
        {[['How it Works','#how'],['Features','#features'],['Networks','#networks'],['PRO','#pro'],['FAQ','#faq']].map(([l, h]) => (
          <Link key={l} href={h} className="fr-mobile-menu__item">{l}</Link>
        ))}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full">Create Free Account <IconArrow /></Link>
          <Link href="/login" className="fr-btn fr-btn--ghost fr-btn--lg fr-btn--full">Sign In</Link>
        </div>
      </div>

      {/* ══ 3. HERO ══ */}
      <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 96, overflow: 'hidden', minHeight: 640 }}>
        {/* Interactive 3D background — cursor tracking, particles, coin + rupee */}
        <HeroBg3D />
        <div className="fr-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="lp-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: 64, alignItems: 'center' }}>
            {/* Left copy */}
            <div data-animate="fade-up">
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 999, marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fr-lime)', display: 'inline-block', boxShadow: '0 0 8px rgba(204,255,0,0.8)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-lime)', letterSpacing: '0.06em' }}>LIVE RATES ACTIVE</span>
                <span style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', fontFamily: 'var(--fr-font-mono)' }}>USDT/INR ₹88.45</span>
              </div>

              {/* Headline — Sora display font for hero */}
              <h1 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(38px,5.5vw,72px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.07, marginBottom: 24, color: 'var(--fr-text-primary)' }}>
                Sell USDT.<br />
                Get <span className="fr-gradient-text">₹ INR</span>.<br />
                <span style={{ color: 'var(--fr-text-secondary)', fontWeight: 700, fontSize: '0.68em' }}>In Under 15 Minutes.</span>
              </h1>

              <p style={{ fontSize: 17, lineHeight: 1.78, color: 'var(--fr-text-secondary)', marginBottom: 36, maxWidth: 480 }}>
                India&apos;s most trusted USDT ↔ INR exchange. Send USDT on BEP-20, TRC-20, or ERC-20 and receive INR directly in your UPI or bank account — zero hidden fees, live rates.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
                <Link href="/register" className="fr-btn fr-btn--primary fr-btn--xl" style={{ fontFamily: 'var(--fr-font-sans)', fontWeight: 700 }}>
                  Start Trading Free <IconArrow />
                </Link>
                <Link href="#how" className="fr-btn fr-btn--ghost fr-btn--xl">How It Works</Link>
              </div>

              {/* Trustpilot-style rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: 22, height: 22, background: i <= 4 ? '#00B67A' : 'rgba(0,182,122,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="white"><path d="M7 1L8.8 5.2H13.5L9.5 7.8L11 12.5L7 9.9L3 12.5L4.5 7.8L0.5 5.2H5.2L7 1Z"/></svg>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)' }}>Great</div>
                    <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>4.9 · 10,000+ reviews</div>
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: 'var(--fr-border-subtle)' }} />
                {[
                  { icon: <IconShield />, label: '100% Secure' },
                  { icon: <IconClock />, label: '< 15 min' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fr-text-tertiary)' }}>
                    <span style={{ color: 'var(--fr-lime)' }}>{icon}</span>{label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: widget */}
            <div className="lp-hero-exchange" style={{ borderRadius: 'var(--fr-radius-xl)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,255,0,0.1), 0 0 60px rgba(204,255,0,0.04)' }}>
              <ExchangeWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 4. STATS BAR ══ */}
      <div style={{ background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', borderBottom: '1px solid var(--fr-border-subtle)' }}>
        <div className="fr-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { label: 'Total Volume Processed', color: 'var(--fr-lime)',         counter: <StatCounter prefix="₹" target={83}   suffix=" Cr+" color="var(--fr-lime)" /> },
              { label: 'Verified Traders',       color: 'var(--fr-neon-teal)',    counter: <StatCounter target={10000} suffix="+" color="var(--fr-neon-teal)" /> },
              { label: 'Avg Settlement Time',    color: 'var(--fr-neon-purple)',  counter: <StatCounter prefix="< " target={15}  suffix=" min" color="var(--fr-neon-purple)" /> },
              { label: 'Trader Rating',          color: 'var(--fr-neon-orange)',  counter: <StatCounter target={4.9} suffix=" / 5.0" decimals={1} color="var(--fr-neon-orange)" /> },
            ].map(({ label, counter }, i, arr) => (
              <div key={label} style={{ padding: '24px 28px', borderRight: i < arr.length - 1 ? '1px solid var(--fr-border-subtle)' : 'none', textAlign: 'center' }}>
                {counter}
                <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 5. PRESS MARQUEE ══ */}
      <div style={{ background: 'var(--fr-black)', padding: '32px 0', borderBottom: '1px solid var(--fr-border-subtle)' }}>
        <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--fr-text-disabled)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>As Featured In</p>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to right, var(--fr-black), transparent)', zIndex: 2 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to left, var(--fr-black), transparent)', zIndex: 2 }} />
          <div style={{ display: 'flex', gap: 60, animation: 'fr-ticker-scroll 28s linear infinite', width: 'max-content' }}>
            {['CoinDesk India','Economic Times Crypto','Inc42 Fintech','YourStory Tech','Moneycontrol','BusinessLine','CoinDesk India','Economic Times Crypto','Inc42 Fintech','YourStory Tech','Moneycontrol','BusinessLine'].map((n, i) => (
              <span key={i} style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.14)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 6. HOW IT WORKS — aurora cards with INNER UI MOCKUPS ══ */}
      <section id="how" style={{ padding: '100px 0', background: 'var(--fr-black)', position: 'relative' }}>
        {/* Curved 3D mesh — right 30% of section */}
        <StaticMesh
          cols={22} rows={18}
          opacity={0.28}
          lineColor="255,255,255"
          waveAmp={80}
          waveT={2.1}
          diagonals={true}
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '34%', height: '100%',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
          }}
        />
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 16 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Simple Process</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>How to Get Started?</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 480, margin: '0 auto 40px' }}>Follow these straightforward steps to start converting crypto to INR</p>
            <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg" style={{ marginBottom: 56 }}>Get Started <IconArrow /></Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} data-animate-stagger>

            {/* Step 01 — purple — network/amount selector UI */}
            <div className="fr-aurora-card fr-aurora-card--purple" style={{ overflow: 'hidden' }}>
              {/* Curved 3D mesh — bottom half of card, fades toward top */}
              <StaticMesh
                cols={16} rows={12}
                opacity={0.38}
                lineColor="210,190,255"
                waveAmp={55}
                waveT={0.8}
                diagonals={true}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', zIndex: 0,
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
                }}
              />
              <span className="fr-aurora-card__step" style={{ position: 'relative', zIndex: 1 }}>STEP 01</span>
              <h3 className="fr-aurora-card__title" style={{ position: 'relative', zIndex: 1 }}>Send Your Crypto</h3>
              <p className="fr-aurora-card__body" style={{ position: 'relative', zIndex: 1 }}>Select the network and amount. Send USDT to our verified wallet address.</p>
              {/* Inner UI: send crypto flow */}
              <div style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
                {/* Wallet address row */}
                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(196,163,255,0.6)', marginBottom: 3 }}>To Wallet</div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--fr-font-mono)', color: 'rgba(255,255,255,0.8)' }}>0x4f2a…d8C3</div>
                  </div>
                  <div style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, background: 'rgba(196,163,255,0.15)', color: '#C4A3FF', fontWeight: 700, border: '1px solid rgba(196,163,255,0.25)' }}>Copy</div>
                </div>
                {/* Network pills */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {[['BEP-20', true], ['TRC-20', false], ['ERC-20', false]].map(([n, active]) => (
                    <div key={String(n)} style={{ flex: 1, textAlign: 'center', padding: '5px 0', borderRadius: 7, background: active ? 'rgba(196,163,255,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(196,163,255,0.45)' : 'rgba(255,255,255,0.07)'}`, fontSize: 10, fontWeight: 700, color: active ? '#C4A3FF' : 'rgba(255,255,255,0.35)' }}>{n}</div>
                  ))}
                </div>
                {/* Amount highlighted */}
                <div style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.28)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 18, fontWeight: 800, color: '#CCFF00', letterSpacing: '-0.02em' }}>500 USDT</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>≈ ₹41,750</span>
                </div>
              </div>
            </div>

            {/* Step 02 — teal — live verification with trader-like rows */}
            <div className="fr-aurora-card fr-aurora-card--teal">
              <span className="fr-aurora-card__step">STEP 02</span>
              <h3 className="fr-aurora-card__title">We Verify On-Chain</h3>
              <p className="fr-aurora-card__body">Our system detects your deposit and confirms it on the blockchain in minutes.</p>
              {/* Inner UI: on-chain verification flow */}
              <div style={{ marginTop: 20 }}>
                {/* TXN hash */}
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '9px 13px', marginBottom: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(94,234,228,0.6)', marginBottom: 3 }}>Transaction Hash</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--fr-font-mono)', color: 'rgba(255,255,255,0.7)' }}>0x7c3f4a…b2e91d</div>
                </div>
                {/* Confirmations progress */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Block Confirmations</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--fr-font-mono)', fontWeight: 700, color: '#5EEAE4' }}>8 / 12</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.35)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: '66%', background: 'linear-gradient(to right, #00D4C8, #5EEAE4)', borderRadius: 99 }} />
                  </div>
                </div>
                {/* Status checklist */}
                {[
                  { label: 'Deposit Detected', done: true },
                  { label: 'Network Confirmed', done: true },
                  { label: 'Identity Verified', done: true },
                  { label: 'Releasing Funds', done: false, active: true },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 15, height: 15, borderRadius: '50%', flexShrink: 0, background: item.done ? '#00D4C8' : 'rgba(0,212,200,0.12)', border: item.active ? '1.5px solid #00D4C8' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.done && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3 5.5L6.5 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400, color: item.done ? 'rgba(255,255,255,0.8)' : item.active ? '#5EEAE4' : 'rgba(255,255,255,0.28)' }}>{item.label}</span>
                    {item.active && <span style={{ marginLeft: 'auto', fontSize: 8, color: '#5EEAE4', animation: 'none' }}>●</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 03 — red — payout chart */}
            <div className="fr-aurora-card fr-aurora-card--red">
              <span className="fr-aurora-card__step">STEP 03</span>
              <h3 className="fr-aurora-card__title">Get Funded &amp; Receive INR</h3>
              <p className="fr-aurora-card__body">INR lands in your UPI or bank. Typically under 15 minutes, zero hidden fees.</p>
              {/* Inner UI: INR payout receipt */}
              <div style={{ marginTop: 20 }}>
                {/* Big INR amount */}
                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: '14px', marginBottom: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,138,184,0.65)', marginBottom: 6 }}>Amount Credited</div>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--fr-font-mono)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>₹41,750</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>500 USDT · Rate ₹83.50</div>
                </div>
                {/* UPI row */}
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '9px 13px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,138,184,0.55)', marginBottom: 2 }}>Via UPI</div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--fr-font-mono)', color: 'rgba(255,255,255,0.75)' }}>raj***@okaxis</div>
                  </div>
                  <div style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, background: 'rgba(74,222,128,0.15)', color: '#4ADE80', fontWeight: 700, border: '1px solid rgba(74,222,128,0.25)' }}>✓ Sent</div>
                </div>
                {/* Settlement time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 8, background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.2)' }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#FF8AB8" strokeWidth="1.2"/><path d="M7 4v3.2L9.2 9" stroke="#FF8AB8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,138,184,0.9)' }}>Settled in 11 min 43 sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. PLATFORM FEATURES ══ */}
      <section style={{ padding: '100px 0', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', borderBottom: '1px solid var(--fr-border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Indian tricolour gradient — left saffron, right green */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(to right, rgba(255,153,51,0.07) 0%, transparent 38%, transparent 62%, rgba(19,136,8,0.06) 100%)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', top: '40%', left: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,153,51,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '10%', right: '5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(19,136,8,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div className="fr-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fr-platform-section">
            <div data-animate="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Why SwapINR</div>
              <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.12, marginBottom: 16 }}>
                India's most trusted<br />
                <span style={{ color: 'var(--fr-lime)' }}>USDT ↔ INR</span><br />
                exchange
              </h2>
              <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.75, marginBottom: 40, maxWidth: 400 }}>
                Built exclusively for the Indian market. Convert USDT to INR — or INR to USDT — with bank-level security, live rates, and instant UPI payouts.
              </p>

              <PlatformFeatures />

              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">Start Trading <IconArrow /></Link>
                <Link href="#how" className="fr-btn fr-btn--ghost fr-btn--lg">Learn More</Link>
              </div>
            </div>

            {/* CSS-art mockup */}
            <div className="fr-platform-mockup-wrap" style={{ position: 'relative', height: 520 }}>
              <div style={{ position: 'absolute', inset: '-60px', background: 'radial-gradient(ellipse at center, rgba(204,255,0,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
              {/* Back card: Rates */}
              <div style={{ position: 'absolute', bottom: 20, left: -10, width: 260, background: 'var(--fr-dark-3)', border: '1px solid rgba(0,212,200,0.2)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', transform: 'rotate(-5deg)', transformOrigin: 'bottom left' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-neon-teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>LIVE RATES</div>
                {[{ sym: 'USDT/INR', rate: '88.45', up: true }, { sym: 'ETH/INR', rate: '3,24,800', up: false }, { sym: 'BTC/INR', rate: '88,23,450', up: true }].map(r => (
                  <div key={r.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 11, color: 'var(--fr-text-secondary)' }}>{r.sym}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--fr-font-mono)', fontWeight: 700, color: r.up ? '#4ADE80' : '#F87171' }}>₹{r.rate}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginTop: 14, height: 34 }}>
                  {[22,38,28,48,32,56,42,65,50,72,48,80].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i > 8 ? 'rgba(204,255,0,0.6)' : 'rgba(255,255,255,0.1)', borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
              </div>
              {/* Mid card: Trades */}
              <div style={{ position: 'absolute', top: 30, right: -10, width: 238, background: 'var(--fr-dark-2)', border: '1px solid rgba(155,93,229,0.25)', borderRadius: 14, padding: '16px 18px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transform: 'rotate(4deg)', transformOrigin: 'top right' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#B78FFF', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>RECENT TRADES</div>
                {[{ a: '500 USDT', r: '₹44,225', t: '2m' }, { a: '1,000 USDT', r: '₹88,450', t: '5m' }, { a: '2,500 USDT', r: '₹2,21,125', t: '14m' }].map((tr, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div><div style={{ fontSize: 11, fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-primary)', fontWeight: 600 }}>{tr.a}</div><div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)' }}>{tr.t} ago</div></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-lime)', fontFamily: 'var(--fr-font-mono)' }}>{tr.r}</span>
                  </div>
                ))}
              </div>
              {/* Front card: Exchange mock */}
              <div style={{ position: 'absolute', top: 0, left: 20, right: 20, background: 'var(--fr-dark-2)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, padding: 24, boxShadow: '0 0 0 1px rgba(204,255,0,0.06), 0 32px 64px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12 }}>{['Sell','Buy'].map((t,i) => <span key={t} style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--fr-text-primary)' : 'var(--fr-text-tertiary)' }}>{t}</span>)}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fr-lime)', background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.2)', borderRadius: 99, padding: '3px 10px' }}>LIVE</span>
                </div>
                <div style={{ background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: 'var(--fr-text-tertiary)', marginBottom: 4, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>You Send</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--fr-text-primary)' }}>500</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-neon-teal)', background: 'rgba(0,212,200,0.1)', borderRadius: 8, padding: '4px 12px' }}>USDT</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fr-lime)' }}><IconSwap /></div>
                </div>
                <div style={{ background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-default)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: 'var(--fr-text-tertiary)', marginBottom: 4, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>You Receive</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--fr-lime)' }}>₹44,225</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '4px 12px' }}>INR</span>
                  </div>
                </div>
                <div style={{ height: 46, background: 'var(--fr-lime)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#000', fontFamily: 'var(--fr-font-sans)' }}>Swap Now</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 8. WHY SWAPINR ══ */}
      <section id="features" style={{ padding: '100px 0', background: 'var(--fr-black)' }}>
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Why SwapINR</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Built for serious traders</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 460, margin: '0 auto' }}>Everything you need to trade crypto for INR — nothing you don&apos;t.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} data-animate-stagger>
            {FEATURES.map(f => (
              <div key={f.title} className="lp-hover-card" style={{ background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-subtle)', borderRadius: 'var(--fr-radius-xl)', padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fr-text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. KINETIC MARQUEE ══ */}
      <div className="fr-feature-strip">
        <div className="fr-feature-strip__track">
          {marqueeDoubled.map((item, i) => (
            <span key={i} className={`fr-feature-strip__item${i % 3 === 0 ? ' fr-feature-strip__item--accent' : ''}`}>{item} &nbsp;·&nbsp; </span>
          ))}
        </div>
      </div>

      {/* ══ 10. TESTIMONIALS ══ */}
      <section style={{ padding: '100px 0', background: 'var(--fr-black)' }}>
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Testimonials</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Trusted by 10,000+ traders</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 440, margin: '0 auto' }}>Real stories from people who trade with SwapINR every day.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} data-animate-stagger>
            {TESTIMONIALS.map((t, i) => {
              const colors = ['#CCFF00','#00D4C8','#9B5DE5'];
              const bgs = ['linear-gradient(135deg,#1a0533,#3B1D8A)','linear-gradient(135deg,#041520,#1D9575)','linear-gradient(135deg,#1a0208,#8A1A2A)'];
              return (
                <div key={i} className="fr-video-card">
                  <div className="fr-video-thumb" style={{ height: 160, background: bgs[i] }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#000', border: '3px solid rgba(255,255,255,0.15)' }}>{t.name[0]}</div>
                    <div className="fr-video-play" style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36 }}><IconPlay /></div>
                    <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--fr-font-mono)' }}>Trade: {t.trade}</div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <div className="fr-stars">{Array.from({length:t.rating}).map((_,j)=><IconStar key={j}/>)}</div>
                    <p style={{ fontSize: 13, color: 'var(--fr-text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000' }}>{t.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>🇮🇳 {t.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 11. NETWORKS ══ */}
      <section id="networks" style={{ padding: '100px 0', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)' }}>
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Supported Networks</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Trade from any blockchain</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 460, margin: '0 auto' }}>Send USDT from whichever network works best — we handle the rest.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-animate-stagger>
            {NETWORKS.map(n => (
              <div key={n.name} className={`fr-neon-card fr-neon-card--${n.color}`}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-subtle)', fontSize: 11, fontWeight: 700, color: 'var(--fr-text-secondary)', letterSpacing: '0.06em', marginBottom: 20 }}>{n.short}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}>{n.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', lineHeight: 1.65, marginBottom: 24 }}>{n.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[{ label: 'Rate', value: n.rate }, { label: 'Fee', value: n.fee }, { label: 'Time', value: n.time }].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24 }}>
                  <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--md fr-btn--full">Trade {n.short} <IconArrow /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 12. PRO MEMBERSHIP ══ */}
      <section id="pro" style={{ padding: '100px 0', background: 'var(--fr-black)' }}>
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-lime)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, background: 'rgba(204,255,0,0.06)' }}>
              <IconPro /> PRO Membership
            </div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Unlock premium rates &amp; benefits</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 480, margin: '0 auto' }}>For serious traders who want the best rates, priority support, and exclusive cash deals.</p>
          </div>

          <div className="lp-pro-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 860, margin: '0 auto' }}>
            {/* Standard */}
            <div style={{ background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-default)', borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Standard</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--fr-font-display)', fontSize: 42, fontWeight: 900, color: 'var(--fr-text-primary)' }}>Free</span>
                <span style={{ fontSize: 14, color: 'var(--fr-text-tertiary)', marginLeft: 8 }}>forever</span>
              </div>
              {PRO_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid var(--fr-border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)' }}>{f.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: f.standard === false ? 'var(--fr-text-disabled)' : 'var(--fr-text-secondary)' }}>{f.standard === false ? '—' : String(f.standard)}</span>
                </div>
              ))}
              <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--lg fr-btn--full" style={{ marginTop: 28 }}>Get Started Free</Link>
            </div>

            {/* PRO */}
            <div style={{ background: 'linear-gradient(145deg,#0a1a00,#0d2200,#050505)', border: '1px solid rgba(204,255,0,0.25)', borderRadius: 20, padding: 32, position: 'relative', boxShadow: '0 0 60px rgba(204,255,0,0.06)' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--fr-lime)', color: '#000', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 16px', borderRadius: 999, whiteSpace: 'nowrap' }}>Most Popular</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-lime)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>PRO</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 42, fontWeight: 900, color: 'var(--fr-text-primary)' }}>₹499</span>
                <span style={{ fontSize: 14, color: 'var(--fr-text-tertiary)', marginLeft: 8 }}>/month</span>
              </div>
              {PRO_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(204,255,0,0.08)' }}>
                  <span style={{ fontSize: 13, color: 'var(--fr-text-secondary)' }}>{f.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: f.pro === true ? 'var(--fr-lime)' : 'var(--fr-text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {f.pro === true ? <><span style={{ color: 'var(--fr-lime)' }}><IconCheck /></span>Yes</> : String(f.pro)}
                  </span>
                </div>
              ))}
              <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginTop: 28 }}>Upgrade to PRO <IconArrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 13. LIVE TRANSACTION FEED ══ */}
      <section style={{ padding: '80px 0 100px', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)' }}>
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 52 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-success)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, background: 'rgba(74,222,128,0.06)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }} />
              Live Activity
            </div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Recent Payouts</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 480, margin: '0 auto' }}>Real INR settlements happening right now — names masked for privacy.</p>
          </div>
        </div>

        {/* Full-width scrolling ticker — no container constraint */}
        <div className="fr-live-feed">
          <div className="fr-live-feed__track">
            {[...LIVE_TRADES, ...LIVE_TRADES].map((t, i) => (
              <div key={i} className={`fr-tx-card fr-tx-card--${t.color}`}>
                {/* Dot pattern texture */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '8px 8px', borderRadius: 'inherit', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Header: logo + label */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, background: 'var(--fr-lime)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>SI</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3.5" stroke="#4ADE80" strokeWidth="1.2"/><path d="M2 4L3.5 5.5L6 3" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.08em' }}>VERIFIED</span>
                    </div>
                  </div>
                  {/* Masked name */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.nameColor, marginBottom: 6 }}>{t.name}</div>
                  {/* Amount — large, lime, JetBrains Mono */}
                  <div style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--fr-lime)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 10 }}>{t.amount}</div>
                  {/* Divider */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>TXN</div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-secondary)' }}>{t.txid}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.04em', marginBottom: 2 }}>{t.network}</div>
                      <div style={{ fontSize: 9, color: 'var(--fr-text-tertiary)' }}>{t.time}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live counter */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)' }}>
            <span style={{ fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-lime)', fontWeight: 700 }}>1,247</span> trades settled today · <span style={{ fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-success)', fontWeight: 700 }}>₹8.3 Cr+</span> paid out
          </p>
        </div>
      </section>

      {/* ══ 14. ACADEMY ══ */}
      <section style={{ padding: '100px 0', background: 'var(--fr-black)' }}>
        <div className="fr-container">
          <div className="fr-academy-section">
            <div className="fr-academy-visual" data-animate="fade-up">
              <div className="fr-academy-blob" />
              <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
                <div style={{ background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-default)', borderRadius: 24, padding: 24, boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(204,255,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000' }}>S</div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)' }}>SwapINR Academy</div><div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)' }}>Free crypto guides for India</div></div>
                    <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--fr-lime)', boxShadow: '0 0 8px rgba(204,255,0,0.7)' }} />
                  </div>
                  {ACADEMY_FEATURES.slice(0, 4).map((guide, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', background: 'var(--fr-dark-3)', border: '1px solid var(--fr-border-subtle)', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `rgba(${i===0?'204,255,0':i===1?'0,212,200':i===2?'155,93,229':'247,37,133'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke={i===0?'#CCFF00':i===1?'#00D4C8':i===2?'#9B5DE5':'#F72585'} strokeWidth="1.2"/><path d="M4 5H10M4 7H8M4 9H7" stroke={i===0?'#CCFF00':i===1?'#00D4C8':i===2?'#9B5DE5':'#F72585'} strokeWidth="1.2" strokeLinecap="round"/></svg>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--fr-text-secondary)', lineHeight: 1.4 }}>{guide}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: 'var(--fr-text-tertiary)' }}>+8 more free guides available</div>
                </div>
              </div>
            </div>
            <div data-animate="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Free Education</div>
              <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 20 }}>Learn to trade<br /><span style={{ color: 'var(--fr-lime)' }}>crypto smarter</span></h2>
              <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.78, marginBottom: 32 }}>Our free academy teaches everything about crypto-to-INR trading. From basics to advanced — in Hindi &amp; English.</p>
              <div style={{ marginBottom: 36 }}>
                {ACADEMY_FEATURES.map(f => (
                  <div key={f} className="fr-academy-feature">
                    <div className="fr-academy-check"><IconCheck /></div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">Access Free Guides <IconArrow /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 15. SECURITY ══ */}
      <section style={{ padding: '80px 0', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)' }}>
        <div className="fr-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }} data-animate-stagger>
            {[
              { icon: <IconShield />, title: 'On-Chain Verified', body: 'Every deposit confirmed via blockchain APIs.', color: 'var(--fr-lime)' },
              { icon: <IconLock />, title: '256-bit Encryption', body: 'All data and comms protected with TLS.', color: 'var(--fr-neon-teal)' },
              { icon: <IconClock />, title: 'Real-Time Tracking', body: 'Live confirmation updates on every trade.', color: 'var(--fr-neon-purple)' },
              { icon: <IconGlobe />, title: 'FEMA Compliant', body: 'Operating under Indian financial regulations.', color: 'var(--fr-neon-blue)' },
            ].map(({ icon, title, body, color }) => (
              <div key={title} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fr-text-primary)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 16. FAQ ══ */}
      <section id="faq" style={{ padding: '100px 0', background: 'var(--fr-black)' }}>
        <div className="fr-container">
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }} data-animate="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>FAQ</div>
              <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Common questions</h2>
            </div>
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="fr-faq-item">
                <summary>
                  {item.q}
                  <div className="fr-faq-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </summary>
                <p className="fr-faq-body">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 17. CTA ══ */}
      <section className="fr-cta-banner" style={{ padding: '100px 0' }}>
        <div className="fr-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div data-animate="fade-up">
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(32px,5vw,64px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.08 }}>
              Ready to get the{' '}
              <span style={{ color: 'var(--fr-lime)' }}>best rates?</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--fr-text-secondary)', marginBottom: 40, maxWidth: 460, margin: '0 auto 40px' }}>
              Join 10,000+ traders already using SwapINR. Free account in 60 seconds.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="fr-btn fr-btn--primary fr-btn--xl">Create Free Account <IconArrow /></Link>
              <Link href="/login" className="fr-btn fr-btn--ghost fr-btn--xl">Sign In</Link>
            </div>
            <p style={{ marginTop: 24, fontSize: 12, color: 'var(--fr-text-disabled)' }}>No credit card · No KYC hassle · Start in 60 seconds</p>
          </div>
        </div>
      </section>

      {/* ══ 18. FOOTER ══ */}
      <footer style={{ background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', padding: '64px 0 32px' }}>
        <div className="fr-container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
            <div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#000' }}>S</div>
                <span style={{ fontFamily: 'var(--fr-font-display)', fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
              </Link>
              <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', lineHeight: 1.75, maxWidth: 280, marginBottom: 20 }}>India&apos;s fastest and most trusted crypto-to-INR exchange. Secure, transparent, instant.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['T','X','in'].map(s => (
                  <div key={s} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)' }}>{s}</div>
                ))}
              </div>
            </div>
            {[
              { h: 'Product', links: [['Exchange','/register'],['PRO Membership','#pro'],['Academy','#academy'],['API','#']] },
              { h: 'Company',  links: [['About','#'],['Blog','#'],['Careers','#'],['Contact','#']] },
              { h: 'Legal',    links: [['Terms','#'],['Privacy','#'],['Refund Policy','#'],['FEMA Compliance','#']] },
            ].map(({ h, links }) => (
              <div key={h}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-disabled)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{h}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {links.map(([l, href]) => <Link key={l} href={href} className="lp-footer-link">{l}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--fr-border-subtle)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--fr-text-disabled)' }}>© {new Date().getFullYear()} SwapINR. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['BEP-20','ERC-20','TRC-20','UPI'].map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 700, color: 'var(--fr-text-disabled)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-subtle)', borderRadius: 6, padding: '3px 8px' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
