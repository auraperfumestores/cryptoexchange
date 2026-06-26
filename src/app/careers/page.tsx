import Link from 'next/link';
import type { Metadata } from 'next';
import { IconArrow, IconGlobe, IconZap, IconShield, IconChart } from '@/components/landing/page-icons';

export const metadata: Metadata = {
  title: 'Careers — SwappINR',
  description: 'Help build the fastest, most trusted USDT-to-INR exchange in India. See open roles at SwappINR.',
  alternates: { canonical: '/careers' },
};

const PERKS = [
  { icon: <IconGlobe />, title: 'Remote-friendly',     body: 'Work from anywhere in India — we care about output, not office hours.' },
  { icon: <IconZap />,   title: 'Move fast',            body: 'Small team, real ownership. Ship features that thousands of traders use the same week.' },
  { icon: <IconShield />, title: 'Health cover',         body: 'Group health insurance for you and your family.' },
  { icon: <IconChart />, title: 'Skin in the game',     body: 'Performance-linked bonuses tied directly to platform growth.' },
];

export default function CareersPage() {
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
          Build the rails India's<br />crypto economy runs on.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--fr-text-secondary)', lineHeight: 1.8, maxWidth: 640, marginBottom: 48 }}>
          We're a small, fast-moving team solving a real problem: getting crypto into rupees, reliably and quickly, for a country that's only just getting started with digital assets. If that sounds like your kind of problem, we'd like to hear from you — even if you don't see an exact match below.
        </p>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24 }}>Why work here</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {PERKS.map(p => (
              <div key={p.title} style={{ padding: 24, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', borderRadius: 16 }}>
                <div style={{ color: 'var(--fr-lime)', marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--fr-text-tertiary)', lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>Open roles</h2>
          <div style={{ padding: 28, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14.5, color: 'var(--fr-text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
              We don't have specific openings posted right now, but we're always open to hearing from strong engineers, compliance specialists, and customer support talent who want to work on crypto-to-INR infrastructure.
            </p>
            <a href="mailto:careers@swappinr.com" className="fr-btn fr-btn--secondary">Send us your resume</a>
          </div>
        </section>

        <section style={{ padding: 32, background: 'linear-gradient(135deg, rgba(204,255,0,0.06), transparent)', border: '1px solid rgba(204,255,0,0.18)', borderRadius: 20, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Not ready to apply?</h2>
          <p style={{ fontSize: 14, color: 'var(--fr-text-secondary)', marginBottom: 22 }}>Try the product first — see what we're building.</p>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg">Create Free Account <IconArrow /></Link>
        </section>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--fr-border-subtle)' }}>
          <Link href="/" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to SwappINR</Link>
        </div>
      </div>
    </div>
  );
}
