import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import ExchangeWidget from '@/components/landing/exchange-widget';
import LandingScripts from '@/components/landing/LandingScripts';
import {
  Bep20Icon, Erc20Icon, Trc20Icon,
  ShieldCheckIcon, LockIcon, ClockIcon, ArrowSwapIcon,
  ChartIcon, WalletIcon, GlobeIcon, ComplianceIcon,
  UpiIcon, BankIcon, StarRating, QuotationMark,
  FloatingBitcoin, FloatingEthereum, FloatingUsdt, FloatingBnb,
  PriceChartFloat, BlockchainFloat,
} from '@/components/landing/icons';

const PARTNERS = [
  'Binance', 'WazirX', 'CoinDCX', 'ZebPay', 'Coinome',
  'Bitbns', 'Giottus', 'CoinStats', 'Delta', 'BlockPier',
];

const TICKER_ITEMS = [
  { pair: 'USDT/INR', price: '₹83.42', change: '+0.12%', up: true },
  { pair: 'BTC/INR',  price: '₹72,14,320', change: '+1.43%', up: true },
  { pair: 'ETH/INR',  price: '₹2,34,880', change: '-0.38%', up: false },
  { pair: 'BNB/INR',  price: '₹44,210', change: '+0.71%', up: true },
  { pair: 'TRX/INR',  price: '₹10.84', change: '+0.05%', up: true },
  { pair: 'EUR/INR',  price: '₹91.32', change: '-0.09%', up: false },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(session.user.role === 'admin' ? '/admin' : '/dashboard');

  return (
    <div className="lp-wrapper">
      <LandingScripts />

      {/* ── Gradient hero section ── */}
      <div className="lp-hero-bg">
        {/* ── Floating crypto coin decorations ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {/* Bitcoin - top right, prominent */}
          <div style={{ position: 'absolute', top: '7%', right: '4%', animation: 'fcoin1 7s ease-in-out infinite' }}>
            <FloatingBitcoin size={72} opacity={0.72} />
          </div>
          {/* Ethereum - mid right */}
          <div style={{ position: 'absolute', top: '52%', right: '2%', animation: 'fcoin2 9s ease-in-out infinite' }}>
            <FloatingEthereum size={52} opacity={0.6} />
          </div>
          {/* USDT - top left */}
          <div style={{ position: 'absolute', top: '18%', left: '2%', animation: 'fcoin3 8s ease-in-out infinite' }}>
            <FloatingUsdt size={58} opacity={0.62} />
          </div>
          {/* BNB - bottom left */}
          <div style={{ position: 'absolute', top: '68%', left: '5%', animation: 'fcoin1 10s ease-in-out infinite reverse' }}>
            <FloatingBnb size={44} opacity={0.52} />
          </div>
          {/* Price chart - center-ish, behind content */}
          <div style={{ position: 'absolute', top: '78%', left: '22%', animation: 'fcoin2 11s ease-in-out infinite' }}>
            <PriceChartFloat width={120} height={70} opacity={0.38} />
          </div>
          {/* Blockchain network - bottom right */}
          <div style={{ position: 'absolute', bottom: '8%', right: '8%', animation: 'fcoin3 8.5s ease-in-out infinite reverse' }}>
            <BlockchainFloat size={96} opacity={0.42} />
          </div>
          {/* Small BTC accent - center top */}
          <div style={{ position: 'absolute', top: '4%', left: '36%', animation: 'fcoin1 12s ease-in-out infinite' }}>
            <FloatingBitcoin size={34} opacity={0.28} />
          </div>
          {/* Small ETH accent - left center */}
          <div style={{ position: 'absolute', top: '40%', left: '1%', animation: 'fcoin2 9.5s ease-in-out infinite' }}>
            <FloatingEthereum size={30} opacity={0.22} />
          </div>
          <style>{`
            @keyframes fcoin1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(6deg)}}
            @keyframes fcoin2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-11px) rotate(-5deg)}}
            @keyframes fcoin3{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(8deg)}}
          `}</style>
        </div>

        {/* ── Navbar ── */}
        <header className="lp-navbar">
          <div className="lp-navbar__inner">
            <Link href="/" className="lp-navbar__logo">
              <div className="lp-navbar__logo-mark">S</div>
              Swap<span style={{ background: 'linear-gradient(135deg, #4D9FFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>INR</span>
            </Link>
            <nav className="lp-navbar__nav">
              <a href="#how">How it works</a>
              <a href="#networks">Networks</a>
              <a href="#security">Security</a>
              <a href="#reviews">Reviews</a>
            </nav>
            <div className="lp-navbar__actions">
              <Link href="/login" className="lp-btn-ghost">Sign in</Link>
              <Link href="/register" className="lp-btn-cta">Get started →</Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="lp-hero">
          {/* Left: copy */}
          <div>
            <div className="lp-hero__eyebrow">
              <span className="lp-hero__dot" />
              Live rates · Updated every 15 seconds
            </div>
            <h1 className="lp-hero__headline">
              The fastest USDT<br />
              <span className="lp-hero__headline-accent">to INR exchange</span><br />
              in India
            </h1>
            <p className="lp-hero__sub">
              Best rates guaranteed. Instant UPI, bank transfer, or cash delivery.
              Settlement in under 30 minutes. 10,000+ Indians trust SwapINR.
            </p>
            <div className="lp-hero__actions">
              <Link href="/register" className="lp-btn-hero-primary">Start exchanging now</Link>
              <Link href="/login" className="lp-btn-hero-secondary">Sign in</Link>
            </div>
            <div className="lp-hero__stats">
              <div>
                <div className="lp-hero__stat-val">₹83.42</div>
                <div className="lp-hero__stat-label">Current USDT/INR rate</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', alignSelf: 'stretch' }} />
              <div>
                <div className="lp-hero__stat-val">10,000+</div>
                <div className="lp-hero__stat-label">Successful swaps</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', alignSelf: 'stretch' }} />
              <div>
                <div className="lp-hero__stat-val">₹83 Cr+</div>
                <div className="lp-hero__stat-label">Volume processed</div>
              </div>
            </div>
          </div>

          {/* Right: exchange widget */}
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)' }}>
            <ExchangeWidget />
          </div>
        </div>

        {/* ── Trust bar (inside hero gradient) ── */}
        <div className="lp-trust-bar">
          <div className="lp-trust-bar__inner">
            {[
              { icon: <ShieldCheckIcon size={18} color="#00E5A0" />, text: 'Non-custodial escrow' },
              { icon: <LockIcon size={18} color="#00E5A0" />, text: 'Bank-grade security' },
              { icon: <ClockIcon size={18} color="#00E5A0" />, text: 'UPI settlement < 5 min' },
              { icon: <ComplianceIcon size={18} color="#00E5A0" />, text: 'KYC compliant' },
              { icon: <ArrowSwapIcon size={18} color="#00E5A0" />, text: 'Best rate guaranteed' },
            ].map(({ icon, text }) => (
              <div key={text} className="lp-trust-bar__item">{icon}{text}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Partner logo strip ── */}
      <div className="lp-partners">
        <p className="lp-partners__label">Trusted by traders using</p>
        <div style={{ overflow: 'hidden' }}>
          <div className="lp-partners__track">
            {[...PARTNERS, ...PARTNERS].map((name, i) => (
              <span key={i} className="lp-partners__item">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why SwapINR ── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 56, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Why SwapINR</p>
            <h2 className="lp-heading">Why 10,000+ Indians choose us</h2>
            <p className="lp-subheading" style={{ margin: '0 auto' }}>
              Not just another exchange. Built for Indians who value speed, rate accuracy, and real support.
            </p>
          </div>

          <div className="lp-feature-grid" data-animate-stagger>
            {[
              {
                icon: <ArrowSwapIcon size={22} color="#4D9FFF" />, iconBg: 'rgba(26,63,255,0.2)', iconColor: '#4D9FFF',
                title: 'Best rate — guaranteed',
                desc: 'If you find a better USDT/INR rate anywhere else, we will match it. No marketing gimmicks — our rate is what you see is what you get.',
              },
              {
                icon: <ClockIcon size={22} color="#00E5A0" />, iconBg: 'rgba(0,229,160,0.15)', iconColor: '#00E5A0',
                title: 'UPI settlement in 5 minutes',
                desc: 'Most exchanges take hours. We process UPI transfers within 5 minutes of on-chain confirmation. IMPS and NEFT within 30 minutes.',
              },
              {
                icon: <WalletIcon size={22} color="#FBBF24" />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#FBBF24',
                title: 'Cash pickup & ATM available',
                desc: 'For larger amounts (₹5L+), we offer face-to-face cash delivery in major cities and ATM withdrawal assistance.',
              },
              {
                icon: <GlobeIcon size={22} color="#A78BFA" />, iconBg: 'rgba(107,33,255,0.2)', iconColor: '#A78BFA',
                title: 'Face-to-face support',
                desc: 'Our team operates in Mumbai, Delhi NCR, Bangalore, Hyderabad, and Chennai. Book an appointment or reach us on WhatsApp.',
              },
              {
                icon: <ChartIcon size={22} color="#00D4FF" />, iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00D4FF',
                title: 'On-chain escrow — zero risk',
                desc: 'Your USDT is held in a transparent on-chain escrow. We cannot access it until you confirm receipt of INR.',
              },
              {
                icon: <ComplianceIcon size={22} color="#00E5A0" />, iconBg: 'rgba(0,229,160,0.12)', iconColor: '#00E5A0',
                title: 'Fully regulation compliant',
                desc: 'Email + phone verification for standard limits. Optional full KYC for higher transaction limits up to ₹50L per transaction.',
              },
            ].map(({ icon, iconBg, iconColor, title, desc }) => (
              <div key={title} className="lp-feature-card">
                <div className="lp-feature-card__icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
                <div>
                  <h3 className="lp-feature-card__title">{title}</h3>
                  <p className="lp-feature-card__body">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 56, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Simple process</p>
            <h2 className="lp-heading">Three steps. Under 30 minutes.</h2>
            <p className="lp-subheading" style={{ margin: '0 auto' }}>
              No complicated forms. No waiting for KYC approval. Start exchanging in 60 seconds.
            </p>
          </div>

          <div className="lp-how-grid" data-animate-stagger>
            {[
              {
                step: '01', num: '1', icon: <WalletIcon size={26} color="#4D9FFF" />, iconBg: 'rgba(26,63,255,0.2)', iconColor: '#4D9FFF',
                subtitle: '60-second sign-up',
                title: 'Register & verify',
                desc: 'Enter your email, create a password, and verify your phone. No full KYC required to begin.',
                detail: 'Supports 2FA via Google Authenticator.',
              },
              {
                step: '02', num: '2', icon: <ArrowSwapIcon size={26} color="#00E5A0" />, iconBg: 'rgba(0,229,160,0.15)', iconColor: '#00E5A0',
                subtitle: 'See the rate before you commit',
                title: 'Place your order',
                desc: 'Select BEP20, ERC20, or TRC20. Enter the INR amount you need. Rate is locked for 10 minutes.',
                detail: 'Live rate with no hidden spread. Rate shown is rate received.',
              },
              {
                step: '03', num: '3', icon: <ChartIcon size={26} color="#00D4FF" />, iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00D4FF',
                subtitle: 'UPI / Bank / Cash — your choice',
                title: 'Receive INR',
                desc: 'Send USDT to our escrow address. We confirm on-chain and transfer INR instantly to your UPI or bank account.',
                detail: 'UPI: <5 min · IMPS/NEFT: <30 min · Cash: same-day',
              },
            ].map(({ num, step, icon, iconBg, iconColor, subtitle, title, desc, detail }) => (
              <div key={step} className="lp-how-card">
                <div className="lp-how-card__num">{num}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{icon}</div>
                <p className="lp-how-card__step">{subtitle}</p>
                <h3 className="lp-how-card__title">{title}</h3>
                <p className="lp-how-card__body">{desc}</p>
                <p className="lp-how-card__detail">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported networks ── */}
      <section id="networks" className="lp-section">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 56, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Multi-chain</p>
            <h2 className="lp-heading">Three networks, one account</h2>
            <p className="lp-subheading" style={{ margin: '0 auto' }}>
              BNB Chain, Ethereum, or Tron — all three supported on a single SwapINR account.
            </p>
          </div>

          <div className="lp-network-grid" data-animate-stagger>
            {[
              {
                icon: <Bep20Icon size={36} />, iconColor: '#F3BA2F', name: 'BNB Smart Chain', short: 'BEP20',
                badge: 'Lowest fees', rate: '₹83.42', features: ['Under ₹1 gas per transaction', '5-second block finality', 'Best for larger transfers'],
              },
              {
                icon: <Erc20Icon size={36} />, iconColor: '#627EEA', name: 'Ethereum', short: 'ERC20',
                badge: 'Most popular', rate: '₹83.28', features: ['Universal wallet support', 'Industry standard', 'Highest security level'],
              },
              {
                icon: <Trc20Icon size={36} />, iconColor: '#FF0013', name: 'Tron', short: 'TRC20',
                badge: 'Free transfers', rate: '₹83.55', features: ['Zero network fee on Tron', 'Instant confirmation', 'Ideal for frequent transfers'],
              },
            ].map(({ icon, iconColor, name, short, badge, rate, features }) => (
              <div key={short} className="lp-network-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ color: iconColor }}>{icon}</div>
                  <div>
                    <p className="lp-network-card__name">{name}</p>
                    <div className="lp-network-card__badges">
                      <span className="lp-network-card__badge" style={{ color: iconColor, background: `${iconColor}18` }}>{short}</span>
                      <span className="lp-network-card__badge">{badge}</span>
                    </div>
                  </div>
                </div>
                <p className="lp-network-card__rate-label">Current indicative rate</p>
                <p className="lp-network-card__rate">{rate}</p>
                <ul className="lp-network-card__list">
                  {features.map(f => (
                    <li key={f}>
                      <div className="lp-network-card__check">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2.5 5L4 6.5L7.5 3.5" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payout methods ── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 48, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Payout methods</p>
            <h2 className="lp-heading">How you receive your INR</h2>
          </div>
          <div className="lp-payout-grid" data-animate-stagger>
            {[
              {
                icon: <UpiIcon size={32} color="#00E5A0" />, iconColor: '#00E5A0', tagBg: 'rgba(0,229,160,0.15)',
                name: 'UPI Transfer', time: '< 5 minutes', limit: '₹50K – ₹5L per transaction',
                desc: 'Instant transfer to any UPI ID — GPay, PhonePe, Paytm. No bank account needed.',
              },
              {
                icon: <BankIcon size={32} color="#4D9FFF" />, iconColor: '#4D9FFF', tagBg: 'rgba(26,63,255,0.2)',
                name: 'Bank Transfer (IMPS/NEFT/RTGS)', time: '< 30 minutes', limit: '₹5L – ₹50L per transaction',
                desc: 'Direct credit to any Indian bank account. RTGS available for urgent large transfers.',
              },
              {
                icon: <BankIcon size={32} color="#FBBF24" />, iconColor: '#FBBF24', tagBg: 'rgba(245,158,11,0.15)',
                name: 'Cash / Face-to-Face', time: 'Same day', limit: '₹5L+ per transaction',
                desc: 'Secure cash delivery in Mumbai, Delhi NCR, Bangalore, Hyderabad, and Chennai. Book via WhatsApp.',
              },
            ].map(({ icon, iconColor, tagBg, name, time, limit, desc }) => (
              <div key={name} className="lp-payout-card">
                <div style={{ color: iconColor, marginBottom: 14 }}>{icon}</div>
                <h3 className="lp-payout-card__title">{name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="lp-payout-card__tag" style={{ background: tagBg, color: iconColor }}>{time}</span>
                  <span className="lp-payout-card__limit">{limit}</span>
                </div>
                <p className="lp-payout-card__body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & security ── */}
      <section id="security" className="lp-section">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 56, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Trust & safety</p>
            <h2 className="lp-heading">Your USDT is always protected</h2>
            <p className="lp-subheading" style={{ margin: '0 auto' }}>
              We operate on an escrow model. Your crypto is never in our sole custody until you confirm receipt of INR.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: <ShieldCheckIcon size={22} color="#4D9FFF" />, iconBg: 'rgba(26,63,255,0.2)', iconColor: '#4D9FFF', title: 'Non-custodial on-chain escrow', desc: 'Your USDT goes to a smart escrow address that neither SwapINR nor you can unilaterally release. Funds move only when both parties confirm.' },
                { icon: <ChartIcon size={22} color="#00E5A0" />, iconBg: 'rgba(0,229,160,0.12)', iconColor: '#00E5A0', title: 'Public blockchain verification', desc: 'Every transaction is verified live on-chain using BscScan, Etherscan, or Tronscan. Verify it yourself — no need to trust our word.' },
                { icon: <LockIcon size={22} color="#A78BFA" />, iconBg: 'rgba(107,33,255,0.2)', iconColor: '#A78BFA', title: 'Bank-grade account security', desc: '2FA via Google Authenticator, encrypted data storage, no third-party data sharing. Your KYC documents are stored encrypted.' },
                { icon: <GlobeIcon size={22} color="#00D4FF" />, iconBg: 'rgba(0,212,255,0.15)', iconColor: '#00D4FF', title: 'Transparent pricing — always', desc: 'The rate shown on the widget is the rate you receive. We do not add hidden spreads. Fee shown upfront before you confirm.' },
              ].map(({ icon, iconBg, iconColor, title, desc }) => (
                <div key={title} className="lp-trust-card">
                  <div className="lp-trust-card__icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
                  <div>
                    <h3 className="lp-trust-card__title">{title}</h3>
                    <p className="lp-trust-card__body">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { val: '< 5 min', label: 'UPI settlement time', color: '#4D9FFF' },
                  { val: '₹83.42', label: 'Current USDT/INR rate', color: '#00E5A0' },
                  { val: '₹0', label: 'Platform processing fee', color: '#FBBF24' },
                  { val: '99.8%', label: 'Transaction success rate', color: '#A78BFA' },
                ].map(({ val, label, color }) => (
                  <div key={label} className="lp-stat-box">
                    <p className="lp-stat-box__val" style={{ color }}>{val}</p>
                    <p className="lp-stat-box__label">{label}</p>
                  </div>
                ))}
              </div>

              <div className="lp-fee-table">
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Fee transparency</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'Platform processing fee', val: '₹0 (0%)', good: true },
                    { label: 'UPI / Bank transfer fee', val: '₹0', good: true },
                    { label: 'BEP20 network fee (you pay)', val: '~₹1', good: true },
                    { label: 'ERC20 network fee (you pay)', val: '₹30–₹200', good: false },
                    { label: 'TRC20 network fee (you pay)', val: '₹0', good: true },
                  ].map(({ label, val, good }) => (
                    <div key={label} className="lp-fee-row">
                      <span className="lp-fee-row__label">{label}</span>
                      <span className={good ? 'lp-fee-row__val-good' : 'lp-fee-row__val-warn'}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="lp-section lp-section-alt">
        <div className="lp-section-inner">
          <div style={{ marginBottom: 56, textAlign: 'center' }} data-animate="fade-up">
            <p className="lp-eyebrow">Reviews</p>
            <h2 className="lp-heading">What our users say</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <StarRating count={5} size={18} />
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>4.9 out of 5 from 1,200+ verified reviews</span>
            </div>
          </div>

          <div className="lp-review-grid" data-animate-stagger>
            {[
              { name: 'Vikram Iyer', loc: 'Mumbai', rating: 5, title: 'Best USDT rate I found in India', body: 'SwapINR consistently gives me 10–15 paise better than WazirX P2P. Last month I exchanged ₹12L and saved ₹1,800 just on the rate. UPI came through in under 4 minutes.', use: 'Crypto trading proceeds liquidation' },
              { name: 'Sneha R.', loc: 'Bangalore', rating: 5, title: 'Finally a service without KYC delays', body: 'Most platforms make you wait 48 hours for KYC. SwapINR let me start immediately after email verification. WhatsApp support replied in 8 minutes on a Saturday.', use: 'Freelance USDT from overseas clients' },
              { name: 'Arjun Mehta', loc: 'Delhi NCR', rating: 5, title: 'Cash delivery for ₹15L transaction', body: 'I needed to liquidate quickly without a bank. SwapINR arranged cash delivery in Connaught Place the same day. Professional, discreet. Rate was better than all competitors.', use: 'Large portfolio liquidation' },
              { name: 'Deepa Krishnan', loc: 'Chennai', rating: 5, title: 'TRC20 zero fees saved me thousands', body: 'I transfer USDT from international clients every week. TRC20 on SwapINR costs me zero in network fees — I get the full rate. Has saved me significant money over months.', use: 'Weekly freelance earnings' },
              { name: 'Rohan Desai', loc: 'Hyderabad', rating: 5, title: 'Better than any local exchanger', body: 'Used local USDT dealers before — inconsistent rates and risky. SwapINR is professional and the rate is better. IMPS reached my HDFC account in under 20 minutes each time.', use: 'Regular USDT to INR (₹3L–₹8L/month)' },
              { name: 'Ananya Patel', loc: 'Ahmedabad', rating: 4, title: 'Solid service, minor app polish', body: 'Core exchange works great — rate was good, INR arrived fast via UPI. The web app feels basic compared to big fintech but functions perfectly. Support was helpful.', use: 'Occasional travel expense conversion' },
            ].map(({ name, loc, rating, title, body, use }) => (
              <div key={name} className="lp-review-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div className="lp-review-card__avatar">{name.charAt(0)}</div>
                  <StarRating count={rating} size={14} />
                </div>
                <QuotationMark size={20} />
                <h3 className="lp-review-card__title">{title}</h3>
                <p className="lp-review-card__body">{body}</p>
                <div className="lp-review-card__footer">
                  <p className="lp-review-card__name">{name}</p>
                  <p className="lp-review-card__loc">{loc}</p>
                  <p className="lp-review-card__use">{use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div data-animate="fade-up" style={{ marginBottom: 48, textAlign: 'center' }}>
          <p className="lp-eyebrow">FAQ</p>
          <h2 className="lp-heading">Common questions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-animate-stagger>
          {[
            { q: 'How fast will I receive my INR?', a: 'UPI transfers are credited within 5 minutes of on-chain confirmation. IMPS/NEFT complete within 30 minutes during business hours (9 AM – 7 PM IST). RTGS for same-day large transfers.' },
            { q: 'Do I need to complete KYC?', a: 'No KYC required to start. Email and phone verification is enough for up to ₹50,000 per transaction. Optional full KYC unlocks limits up to ₹50 lakhs per transaction.' },
            { q: 'Which network — BEP20, ERC20, or TRC20?', a: 'BEP20 (BNB Chain) is recommended — fees under ₹1 and fast confirmations. Use TRC20 for zero network fees. Avoid ERC20 unless your USDT is already on Ethereum (gas fees are higher).' },
            { q: 'Is cash pickup available?', a: 'Yes. For amounts above ₹5 lakhs, we offer same-day cash delivery in Mumbai, Delhi NCR, Bangalore, Hyderabad, and Chennai. Contact us on WhatsApp to schedule.' },
            { q: 'How do I know the rate is locked?', a: 'After you place an order, the rate is locked for 10 minutes. A countdown timer is shown in your order details. Transfer USDT within this window to receive the locked rate.' },
            { q: 'What if there is a dispute?', a: 'Open a dispute from your transaction page. Our team responds within 2 hours. We review on-chain transaction data and mediate a fair resolution. 99.8% dispute resolution rate.' },
          ].map(({ q, a }) => (
            <div key={q} className="lp-faq-item">
              <h3 className="lp-faq-item__q">{q}</h3>
              <p className="lp-faq-item__a">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" data-animate="fade-up">
        <h2 className="lp-cta__headline">
          Start exchanging USDT<br />
          <span style={{ background: 'linear-gradient(135deg, #4D9FFF 0%, #00D4FF 50%, #00E5A0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>in under 60 seconds</span>
        </h2>
        <p className="lp-cta__sub">
          No credit card required. No full KYC needed to start. Best rate in India — guaranteed.
        </p>
        <div className="lp-cta__actions">
          <Link href="/register" className="lp-btn-hero-primary">Create free account</Link>
          <Link href="/login" className="lp-btn-hero-secondary">Sign in to account</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #1A3FFF 0%, #6B21FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 900 }}>S</div>
            Swap<span style={{ background: 'linear-gradient(135deg, #4D9FFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>INR</span>
          </div>
          <div className="lp-footer__links">
            <a href="#" className="lp-footer__link">Privacy Policy</a>
            <a href="#" className="lp-footer__link">Terms of Service</a>
            <a href="#" className="lp-footer__link">Support</a>
          </div>
          <p className="lp-footer__copy">&copy; {new Date().getFullYear()} SwapINR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
