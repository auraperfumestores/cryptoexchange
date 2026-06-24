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
  IconX, IconPro, IconTrend, PlatformFeatures, PayoutMethods,
} from '@/components/landing/page-icons';
import StatCounter from '@/components/ui/stat-counter';
import StaticMesh from '@/components/ui/static-mesh';
import { SnapCarousel } from '@/components/ui/snap-carousel';
import { connectToDatabase, Rate, rateToDocument } from '@/lib/db';

/* ─── Data ────────────────────────────────────────────── */
// TICKER_ITEMS built dynamically inside LandingPage() using live rates


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
  { label: 'Trust Wallet',   standard: 'Required',                        pro: 'Required'                                  },
  { label: 'USDT Networks',  standard: 'ERC-20 · BEP-20 · TRC-20',       pro: 'ERC-20 · BEP-20 · TRC-20'                 },
  { label: 'Exchange rate',  standard: 'Market rate',                     pro: '+0.3% better rate'                         },
  { label: 'Daily limit',    standard: '₹1 lakh',                         pro: 'Unlimited'                                 },
  { label: 'Settlement',     standard: '10–20 min',                       pro: '< 8 min*'                                  },
  { label: 'Payout methods', standard: 'UPI · NEFT · RTGS · IMPS',       pro: 'UPI · NEFT · RTGS · IMPS · CDM · Cash'    },
  { label: '24×7 Support',   standard: 'Chat · Email · Telegram',         pro: 'Dedicated manager'                         },
  { label: 'CDM access',     standard: false,                             pro: true                                        },
  { label: 'Cash deals',     standard: false,                             pro: true                                        },
];

const TESTIMONIALS = [
  { name: 'Arjun M.',  location: 'Mumbai',    trade: '₹5,00,000', rating: 5, photo: '/testimonials/t1.jpg', quote: 'Sent USDT on BEP-20 and had ₹5 lakhs in my UPI within 12 minutes. No other platform in India comes close to this speed.' },
  { name: 'Vikram R.', location: 'Bangalore', trade: '₹2,50,000', rating: 5, photo: '/testimonials/t2.jpg', quote: 'The live sell rate on the widget is exactly what lands in my account — zero hidden spread, zero surprise deductions. Refreshing honesty.' },
  { name: 'Rohit V.',  location: 'Delhi NCR', trade: '₹8,00,000', rating: 5, photo: '/testimonials/t3.jpg', quote: '20+ trades across ERC-20 and TRC-20 over 6 months. Not a single delay, not a single rupee short. I trust SwappINR completely.' },
  { name: 'Nikhil S.', location: 'Pune',      trade: '₹1,20,000', rating: 5, photo: '/testimonials/t4.jpg', quote: 'Sold TRC-20 USDT and received INR via IMPS in under 10 minutes on a Sunday. Their 24×7 support confirmed my transfer on WhatsApp instantly.' },
  { name: 'Karan T.',  location: 'Hyderabad', trade: '₹3,75,000', rating: 5, photo: '/testimonials/t5.jpg', quote: 'PRO membership pays for itself. The +0.3% better rate on every trade adds up fast, and the dedicated manager is always reachable.' },
  { name: 'Mohan K.',  location: 'Chennai',   trade: '₹60,000',   rating: 5, photo: '/testimonials/t6.jpg', quote: 'TRC-20 fees are near zero and SwappINR\'s INR rate beats every CEX I\'ve tried. One flat fee shown upfront — no withdrawal charge, ever.' },
  { name: 'Aditya P.', location: 'Kolkata',   trade: '₹9,50,000', rating: 5, photo: '/testimonials/t7.jpg', quote: 'Moved ₹9.5 lakhs via ERC-20 to RTGS on PRO — settled in under 8 minutes. AES-256 encryption and KYC operators give me full peace of mind.' },
  { name: 'Sahil D.',  location: 'Ahmedabad', trade: '₹2,10,000', rating: 5, photo: '/testimonials/t8.jpg', quote: 'Bought USDT with INR and sold it back the same day. Both directions work flawlessly. SwappINR is the only platform I recommend to other traders.' },
];

const NETWORK_DEFS = [
  { network: 'ERC20' as const, short: 'ERC-20', color: 'blue'  as const, name: 'Ethereum (ERC-20)',  fee: '~0.8%', time: '~15 min', desc: 'Ethereum mainnet — the most secure standard. Best for large one-off USDT transfers where on-chain verifiability matters most.' },
  { network: 'BEP20' as const, short: 'BEP-20', color: 'teal'  as const, name: 'BNB Chain (BEP-20)', fee: '~0.5%', time: '~8 min',  desc: 'Lowest gas fees and fastest confirmations. Our most popular network for traders who send USDT frequently.' },
  { network: 'TRC20' as const, short: 'TRC-20', color: 'green' as const, name: 'TRON (TRC-20)',      fee: '~0.6%', time: '~10 min', desc: "World's most-used USDT network by volume. Near-zero gas, widely supported across wallets and exchanges." },
];

const FAQ_ITEMS = [
  { q: 'How quickly do I receive INR after sending USDT?', a: 'Most trades settle within 10–20 minutes after your crypto transaction is confirmed. PRO members receive settlements in under 8 minutes.' },
  { q: 'Which networks do you support?', a: 'We support USDT on BEP-20 (BNB Chain), ERC-20 (Ethereum), and TRC-20 (TRON). BEP-20 offers the lowest fees; TRC-20 is most popular globally.' },
  { q: 'Are there hidden fees?', a: 'No. Our fee is a simple percentage (0.5–0.8%) shown upfront before you confirm. What you see is exactly what you get.' },
  { q: 'What are the trade limits?', a: 'No minimums or maximums. We handle trades from ₹5,000 to ₹1 crore+. For trades above ₹25 lakhs, PRO membership gives the best rates.' },
  { q: 'How do I receive my INR?', a: 'Via UPI (instant), IMPS bank transfer (same-day), or cash deal for eligible PRO users. Provide your UPI ID or bank details when placing your order.' },
  { q: 'Is SwappINR safe and regulated?', a: 'Yes. All transactions are verified on-chain. We follow Indian FEMA guidelines, KYC/AML best practices, and operate with full blockchain transparency.' },
];

const MARQUEE_ITEMS = ['INSTANT SETTLEMENT', 'BEST RATES', 'ZERO HIDDEN FEES', 'ON-CHAIN VERIFIED', '24/7 SUPPORT', 'UPI PAYOUTS', 'BANK TRANSFER', 'CASH DEALS', 'MULTI-NETWORK'];

const PERKS = [
  'Real-time rate guarantee — get the rate you see',
  'No minimum or maximum trade limits',
  'Direct UPI settlement in seconds',
  'Transparent fee — no surprises ever',
];

const ACADEMY_FEATURES = [
  'How to send USDT from Binance to SwappINR',
  'Choosing the right network: BEP-20 vs TRC-20',
  'Understanding crypto-to-INR market rates',
  'Avoiding common mistakes in P2P trading',
  'PRO tips to maximise your payout',
];

/* ─── Page ─────────────────────────────────────────────── */
export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect('/dashboard');

  // Fetch live USDT sell rates from DB for the networks section
  let liveRates: Record<string, number> = {};
  try {
    await connectToDatabase();
    const rates = await Rate.find({ isActive: true, symbol: 'USDT' }).lean();
    for (const r of rates) {
      const doc = rateToDocument(r as any);
      liveRates[doc.network] = doc.sellRate;
    }
  } catch { /* fall back to empty — cards show '—' */ }

  const fmt = (r: number | undefined, fb: string) => r ? `₹${r.toFixed(2)}` : fb;
  const TICKER_ITEMS = [
    { label: 'USDT/INR',     value: fmt(liveRates['BEP20'], '₹88.45'), accent: true  },
    { label: 'ERC-20 Rate',  value: fmt(liveRates['ERC20'], '₹87.90'), accent: false },
    { label: 'BEP-20 Rate',  value: fmt(liveRates['BEP20'], '₹88.45'), accent: true  },
    { label: 'TRC-20 Rate',  value: fmt(liveRates['TRC20'], '₹88.10'), accent: false },
    { label: 'BEP-20 Fee',   value: '0.5%',                            accent: true  },
    { label: 'Trades (24H)', value: '1,247',                           accent: false },
    { label: 'Avg Payout',   value: '< 15 min',                        accent: true  },
    { label: 'Users Online', value: '834',                             accent: false },
    { label: '💬 Need Help?', value: 'Contact Support for instant help', warn: true  },
  ];

  const tickerDoubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  const marqueeDoubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  const testiDoubled = [...TESTIMONIALS, ...TESTIMONIALS];

  const renderTestiCard = (t: (typeof TESTIMONIALS)[0], i: number) => (
    <div key={i} className="fr-video-card">
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: 260, overflow: 'hidden' }}>
        <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '3px 9px', fontFamily: 'var(--fr-font-mono)', backdropFilter: 'blur(4px)' }}>Trade: {t.trade}</div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div className="fr-stars">{Array.from({length: t.rating}).map((_,j) => <IconStar key={j}/>)}</div>
        <p style={{ fontSize: 13, color: 'var(--fr-text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>&ldquo;{t.quote}&rdquo;</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={t.photo} alt={t.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 15%', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)' }}>{t.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>🇮🇳 {t.location}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main style={{ background: 'var(--fr-black)', overflowX: 'hidden', fontFamily: 'var(--fr-font-sans)' }}>
      <LandingScripts />

      {/* ══ 1. TICKER ══ */}
      <div className="fr-ticker-strip">
        <div className="fr-ticker-track">
          {tickerDoubled.map((item, i) => (
            <span key={i} className={`fr-ticker-item${item.accent ? ' fr-ticker-item--accent' : item.warn ? ' fr-ticker-item--warn' : ''}`}>
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
            <span className="fr-nav__logo-name">Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
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
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
          <button data-mobile-toggle style={{ background: 'none', border: '1px solid var(--fr-border-default)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--fr-text-secondary)', display: 'flex' }}><IconX /></button>
        </div>
        {[['How it Works','#how'],['Features','#features'],['Networks','#networks'],['PRO','#pro'],['FAQ','#faq']].map(([l, h]) => (
          l === 'PRO'
            ? <Link key={l} href={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', margin: '8px 0 18px', borderRadius: 999, background: 'linear-gradient(135deg,#FFD700 0%,#FFE066 45%,#FFB800 100%)', border: '1px solid rgba(255,210,0,0.7)', boxShadow: '0 4px 16px rgba(255,195,0,0.25)', fontSize: 15, fontWeight: 900, letterSpacing: '0.08em', color: '#000', textDecoration: 'none' }}><IconPro size={17} color="#000" /> PRO</Link>
            : <Link key={l} href={h} className="fr-mobile-menu__item">{l}</Link>
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

              {/* Hero headline */}
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
                  Swap Now <IconArrow />
                </Link>
                <Link href="#how" className="fr-btn fr-btn--ghost fr-btn--xl">How It Works</Link>
              </div>

              {/* Trustpilot-style rating */}
              <div className="lp-hero-trust">
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
                    <div style={{ fontSize: 11, color: 'var(--fr-text-tertiary)' }}>4.9 · 1000+ reviews</div>
                  </div>
                </div>
                <div className="lp-hero-trust__divider" />
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
          <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { label: 'Total Volume Processed', counter: <StatCounter prefix="₹" base={5824600} ratePerSec={20.83} suffix="+"      color="#CCFF00" /> },
              { label: 'Verified Traders',       counter: <StatCounter            base={3142}   ratePerSec={0.00083} suffix="+"    color="#FFFFFF" /> },
              { label: 'Avg Settlement Time',    counter: <StatCounter prefix="< " base={15}                        suffix=" min"  color="#CCFF00" /> },
              { label: 'Trader Rating',          counter: <StatCounter            base={4.9}                        suffix=" / 5.0" decimals={1} color="#FFFFFF" /> },
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
          className="lp-how-mesh"
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

          <SnapCarousel bg="var(--fr-black)">
          <div className="sc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} data-animate-stagger>

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
          </SnapCarousel>
        </div>
      </section>

      {/* ══ 7. PLATFORM FEATURES ══ */}
      <section style={{ padding: '100px 0', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', borderBottom: '1px solid var(--fr-border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Indian flag — faded, angled 47°, anchored right */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
        }}>
          <svg
            viewBox="0 0 900 600"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              width: '72%',
              height: 'auto',
              right: '-8%',
              top: '50%',
              transform: 'translateY(-50%) rotate(47deg)',
              transformOrigin: 'center center',
              opacity: 0.08,
              maskImage: 'radial-gradient(ellipse 78% 78% at 60% 50%, black 20%, rgba(0,0,0,0.55) 55%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 78% 78% at 60% 50%, black 20%, rgba(0,0,0,0.55) 55%, transparent 80%)',
            }}
          >
            {/* Three horizontal bands */}
            <rect x="0" y="0"   width="900" height="200" fill="#FF9933" />
            <rect x="0" y="200" width="900" height="200" fill="#FFFFFF" />
            <rect x="0" y="400" width="900" height="200" fill="#138808" />

            {/* Ashoka Chakra — navy, centred in white band */}
            <circle cx="450" cy="300" r="94"  fill="none" stroke="#000080" strokeWidth="10" />
            <circle cx="450" cy="300" r="14"  fill="#000080" />
            {/* 24 spokes */}
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="450" y1="210"
                x2="450" y2="287"
                stroke="#000080"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${i * 15}, 450, 300)`}
              />
            ))}
            {/* Inner rim ring */}
            <circle cx="450" cy="300" r="35"  fill="none" stroke="#000080" strokeWidth="2.5" />
          </svg>
          {/* Saffron glow — upper-right */}
          <div style={{ position: 'absolute', top: '-5%', right: '5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,153,51,0.07) 0%, transparent 68%)', pointerEvents: 'none' }} />
          {/* Green glow — lower-right */}
          <div style={{ position: 'absolute', bottom: '-8%', right: '18%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(19,136,8,0.075) 0%, transparent 68%)', pointerEvents: 'none' }} />
        </div>

        <div className="fr-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="fr-platform-section">
            <div data-animate="fade-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Why SwappINR</div>
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

      {/* ══ 8. PAYOUT METHODS ══ */}
      <section id="features" style={{ padding: '100px 0', background: 'var(--fr-black)', position: 'relative' }}>
        {/* Curved 3D mesh — left 34% of section, fading right */}
        <StaticMesh
          cols={22} rows={18}
          opacity={0.28}
          lineColor="255,255,255"
          waveAmp={80}
          waveT={2.1}
          diagonals={true}
          className="lp-payout-mesh"
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '34%', height: '100%',
            WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 50%)',
            maskImage: 'linear-gradient(to left, transparent 0%, black 50%)',
          }}
        />
        <div className="fr-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Payout Methods</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Instant Payouts, Your Way</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 500, margin: '0 auto' }}>Six ways to receive your INR — from lightning-fast UPI to in-person cash. <span style={{ color: '#CCFF00', fontWeight: 600 }}>Pro users</span> unlock exclusive high-value channels.</p>
          </div>
          <SnapCarousel bg="var(--fr-black)">
            <div data-animate-stagger>
              <PayoutMethods />
            </div>
          </SnapCarousel>
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
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>Trusted by 3,000+ traders</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 440, margin: '0 auto' }}>Real stories from people who trade with SwappINR every day.</p>
          </div>
          {/* Infinite auto-scroll ticker — desktop + mobile */}
          <div className="fr-testi-ticker">
            <div className="fr-testi-ticker__track">
              {testiDoubled.map(renderTestiCard)}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 11. NETWORKS ══ */}
      <section id="networks" style={{ padding: '100px 0', background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', position: 'relative', overflow: 'hidden' }}>
        {/* Green grid mesh — bottom of section, fades upward */}
        <StaticMesh
          cols={24} rows={16}
          opacity={0.30}
          lineColor="204,255,0"
          waveAmp={55}
          waveT={0.9}
          diagonals={true}
          className="lp-networks-mesh"
          style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', height: '42%',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 55%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 55%)',
          }}
        />
        <div className="fr-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }} data-animate="fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', border: '1px solid var(--fr-border-default)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>USDT · 3 Networks</div>
            <h2 style={{ fontFamily: 'var(--fr-font-display)', fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 14 }}>We accept USDT on 3 Networks</h2>
            <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', maxWidth: 500, margin: '0 auto' }}>Send USDT from ERC-20, BEP-20, or TRC-20 — receive INR directly in your bank or UPI. Rates shown are live sell rates from our exchange desk.</p>
          </div>

          {/* Trust Wallet notice */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: 18,
            padding: '20px 28px',
            background: 'linear-gradient(115deg, rgba(0,5,255,0.12) 0%, rgba(0,180,140,0.07) 55%, rgba(0,5,255,0.05) 100%)',
            border: '1px solid rgba(80,130,255,0.28)',
            borderLeft: '3px solid #3375BB',
            borderRadius: 16,
            maxWidth: 640, margin: '0 auto 52px',
            boxShadow: '0 0 40px rgba(0,80,255,0.09), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            {/* Large shield watermark */}
            <svg aria-hidden="true" style={{ position: 'absolute', right: -18, top: -12, width: 150, height: 165, opacity: 0.13, pointerEvents: 'none' }} viewBox="0 0 140 170" fill="none">
              <defs>
                <linearGradient id="tw-bg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1EFFBC" />
                  <stop offset="100%" stopColor="#0088FF" />
                </linearGradient>
              </defs>
              <path d="M70,6 L130,30 L130,98 C130,136 70,166 70,166 L70,6Z" fill="#1A00FF" />
              <path d="M70,6 L10,30 L10,98 C10,136 70,166 70,166 L70,6Z" fill="url(#tw-bg)" />
            </svg>

            {/* Small Trust Wallet shield icon */}
            <div style={{ flexShrink: 0 }}>
              <svg width="36" height="42" viewBox="0 0 140 170" fill="none">
                <defs>
                  <linearGradient id="tw-icon" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1EFFBC" />
                    <stop offset="100%" stopColor="#0088FF" />
                  </linearGradient>
                </defs>
                <path d="M70,6 L130,30 L130,98 C130,136 70,166 70,166 L70,6Z" fill="#1A00FF" />
                <path d="M70,6 L10,30 L10,98 C10,136 70,166 70,166 L70,6Z" fill="url(#tw-icon)" />
              </svg>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: 5, letterSpacing: '-0.01em' }}>
                Automatic transfers supported via{' '}
                <span style={{ background: 'linear-gradient(90deg,#1EFFBC,#3375BB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                  Trust Wallet
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>
                Connect your Trust Wallet for the fastest automated processing. Other EVM-compatible wallets (MetaMask, Coinbase Wallet) are accepted via manual transfer.
              </div>
            </div>
          </div>

          <SnapCarousel bg="var(--fr-dark-0)">
          <div className="sc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} data-animate-stagger>
            {NETWORK_DEFS.map(n => {
              const sellRate = liveRates[n.network];
              const rateDisplay = sellRate ? `₹${sellRate.toFixed(2)}` : '—';
              return (
                <div key={n.name} className={`fr-neon-card fr-neon-card--${n.color}`}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--fr-border-subtle)', fontSize: 11, fontWeight: 700, color: 'var(--fr-text-secondary)', letterSpacing: '0.06em', marginBottom: 20 }}>{n.short}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}>{n.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', lineHeight: 1.65, marginBottom: 24 }}>{n.desc}</p>

                  {/* Live rate row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Live Sell Rate</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#CCFF00', fontFamily: 'var(--fr-font-mono)', letterSpacing: '-0.02em' }}>{rateDisplay}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>per USDT</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#CCFF00', background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 6, padding: '3px 8px' }}>● LIVE</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[{ label: 'Platform Fee', value: n.fee }, { label: 'Avg. Time', value: n.time }].map(({ label, value }) => (
                      <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fr-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fr-text-primary)', fontFamily: 'var(--fr-font-mono)' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--md fr-btn--full">Sell USDT via {n.short} <IconArrow /></Link>
                </div>
              );
            })}
          </div>
          </SnapCarousel>
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

          {/* Asymmetric grid — Pro card is wider */}
          <div className="lp-pro-asym" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, maxWidth: 920, margin: '0 auto', alignItems: 'start' }}>

            {/* ── Free card ── */}
            <div style={{ background: 'var(--fr-dark-1)', border: '1px solid var(--fr-border-default)', borderRadius: 20, padding: '28px 28px 24px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--fr-text-disabled)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Standard</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--fr-font-display)', fontSize: 40, fontWeight: 900, color: 'var(--fr-text-primary)', letterSpacing: '-0.03em' }}>Free</span>
                <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', marginLeft: 8 }}>forever</span>
              </div>

              {/* Trust Wallet pill — green */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.18)', fontSize: 11, fontWeight: 600, color: '#CCFF00', marginBottom: 24 }}>
                <svg width="11" height="13" viewBox="0 0 140 170" fill="none"><path d="M70,6 L130,30 L130,98 C130,136 70,166 70,166 L70,6Z" fill="#1A00FF"/><path d="M70,6 L10,30 L10,98 C10,136 70,166 70,166 L70,6Z" fill="#1EFFBC"/></svg>
                Trust Wallet required
              </div>

              {PRO_FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--fr-border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--fr-text-tertiary)', flexShrink: 0 }}>{f.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'right',
                    color: f.standard === false ? 'var(--fr-text-disabled)'
                      : (f.label === 'Trust Wallet' || f.label === '24×7 Support') ? '#CCFF00'
                      : 'var(--fr-text-secondary)'
                  }}>
                    {f.standard === false ? '—' : String(f.standard)}
                  </span>
                </div>
              ))}
              <Link href="/register" className="fr-btn fr-btn--ghost fr-btn--lg fr-btn--full" style={{ marginTop: 24 }}>Get Started Free</Link>
            </div>

            {/* ── PRO card ── */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 22, padding: '36px 32px 30px',
              background: 'linear-gradient(145deg,#091800,#0d2200,#060806)',
              border: '1px solid rgba(204,255,0,0.3)',
              boxShadow: '0 0 70px rgba(204,255,0,0.07), 0 0 0 1px rgba(204,255,0,0.05)',
            }}>
              {/* Same curved mesh as purple step card */}
              <StaticMesh
                cols={16} rows={12}
                opacity={0.22}
                lineColor="180,255,80"
                waveAmp={55}
                waveT={1.4}
                diagonals={true}
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', zIndex: 0,
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
                }}
              />
              {/* Content sits above mesh */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Most popular badge */}
                <div style={{ position: 'absolute', top: -37, left: '50%', transform: 'translateX(-50%)', background: '#CCFF00', color: '#000', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 18px', borderRadius: '0 0 10px 10px', whiteSpace: 'nowrap' }}>Most Popular</div>

                <div style={{ fontSize: 10, fontWeight: 800, color: '#CCFF00', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>PRO</div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--fr-font-mono)', fontSize: 46, fontWeight: 900, color: 'var(--fr-text-primary)', letterSpacing: '-0.03em' }}>₹499</span>
                  <span style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', marginLeft: 8 }}>/month</span>
                </div>

                {/* Trust Wallet pill — green */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.22)', fontSize: 11, fontWeight: 600, color: '#CCFF00', marginBottom: 24 }}>
                  <svg width="11" height="13" viewBox="0 0 140 170" fill="none"><path d="M70,6 L130,30 L130,98 C130,136 70,166 70,166 L70,6Z" fill="#1A00FF"/><path d="M70,6 L10,30 L10,98 C10,136 70,166 70,166 L70,6Z" fill="#1EFFBC"/></svg>
                  Trust Wallet required
                </div>

                {PRO_FEATURES.map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderBottom: '1px solid rgba(204,255,0,0.07)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>{f.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', display: 'flex', alignItems: 'center', gap: 5,
                      color: f.pro === true || f.label === 'Trust Wallet' || f.label === 'CDM access' || f.label === 'Cash deals' ? '#CCFF00' : 'rgba(255,255,255,0.9)'
                    }}>
                      {f.pro === true ? <><IconCheck />Yes</> : String(f.pro)}
                    </span>
                  </div>
                ))}

                {/* Settlement T&C footnote */}
                <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  * &lt; 8 min settlement applies to online UPI / IMPS / NEFT / RTGS transactions. CDM &amp; Cash Deals may take longer depending on location.
                </div>

                {/* CDM + Cash highlight note */}
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(204,255,0,0.05)', border: '1px solid rgba(204,255,0,0.15)', fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  <span style={{ color: '#CCFF00', fontWeight: 700 }}>PRO exclusive:</span> CDM &amp; in-person Cash Deals unlocked for verified Pro members in select cities.
                </div>

                <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full" style={{ marginTop: 22 }}>Upgrade to PRO <IconArrow /></Link>
              </div>
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
            <span style={{ fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-lime)', fontWeight: 700 }}>1,247</span> trades settled today · <span style={{ fontFamily: 'var(--fr-font-mono)', color: 'var(--fr-text-success)', fontWeight: 700 }}>₹28.4 L+</span> paid out
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
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--fr-text-primary)' }}>SwappINR Academy</div><div style={{ fontSize: 10, color: 'var(--fr-text-tertiary)' }}>Free crypto guides for India</div></div>
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
              <button disabled className="fr-btn fr-btn--primary fr-btn--lg" style={{ opacity: 0.6, cursor: 'not-allowed' }}>Coming Soon</button>
            </div>
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
              Join 3,000+ traders already using SwappINR. Free account in 60 seconds.
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
                <span style={{ fontFamily: 'var(--fr-font-display)', fontSize: 18, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span></span>
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
              { h: 'Legal',    links: [['Terms','/terms'],['Privacy','/privacy'],['Refund Policy','#'],['FEMA Compliance','#']] },
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
            <p style={{ fontSize: 12, color: 'var(--fr-text-disabled)' }}>© {new Date().getFullYear()} SwappINR. All rights reserved.</p>
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
