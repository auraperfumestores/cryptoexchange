import Link from 'next/link';
import type { Metadata } from 'next';
import { IconArrow, IconShield, IconClock, IconZap } from '@/components/landing/page-icons';

export const metadata: Metadata = {
  title: 'About Us — SwappINR',
  description: "SwappINR is India's USDT-to-INR exchange, built to make converting crypto to rupees fast, transparent, and secure.",
  alternates: { canonical: '/about' },
};

const VALUES = [
  { icon: <IconShield />, title: 'Security First',  body: 'Every transaction runs through layered fraud checks, KYC/AML screening, and on-chain monitoring before settlement is released.' },
  { icon: <IconClock />,  title: 'Speed Matters',    body: "Holding crypto while waiting for a bank transfer is a risk in itself. We're built around settling in minutes, not days." },
  { icon: <IconZap />,    title: 'No Hidden Fees',   body: 'The rate you see at order confirmation is the rate you get. No surprise deductions, no fine-print spreads.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 96px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 15, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
        </Link>

        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
          Converting crypto to rupees,<br />without the friction.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', lineHeight: 1.8, maxWidth: 640, marginBottom: 48 }}>
          SwappINR exists because turning USDT into spendable INR in India shouldn't take days, require navigating five different apps, or come with fees buried in the exchange rate. We built a single, focused exchange that does one thing well: get your crypto into your bank account or UPI, quickly and transparently.
        </p>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>What we do</h2>
          <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>
            We operate a USDT ↔ INR conversion platform supporting BEP-20, ERC-20, and TRC-20 networks, with settlement via UPI, IMPS, NEFT, and RTGS. Every user completes KYC verification in line with Indian regulatory requirements before transacting, and every order runs through compliance screening before funds move.
          </p>
          <p style={{ fontSize: 15, color: 'var(--fr-text-secondary)', lineHeight: 1.8 }}>
            We're not a wallet, a custodian, or an investment product — we're the bridge between your on-chain assets and the rupees in your bank account, built for traders, freelancers, and businesses who get paid in crypto and need it in INR.
          </p>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>What we stand for</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {VALUES.map(v => (
              <div key={v.title} style={{ padding: 24, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', borderRadius: 16 }}>
                <div style={{ color: 'var(--fr-lime)', marginBottom: 14 }}>{v.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--fr-text-tertiary)', lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: 32, background: 'linear-gradient(135deg, rgba(204,255,0,0.06), transparent)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Want to see it in action?</h2>
          <p style={{ fontSize: 14, color: 'var(--fr-text-secondary)', marginBottom: 22 }}>Create a free account and convert your first USDT to INR in under 15 minutes.</p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">Create Free Account <IconArrow /></Link>
        </section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--fr-border-subtle)' }}>
          <Link href="/" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to SwappINR</Link>
        </div>
      </div>
    </div>
  );
}
