import Link from 'next/link';
import LandingScripts from '@/components/landing/LandingScripts';

const NAV_LINKS = [
  { label: 'Sell USDT',  href: '/sell-usdt-for-inr'  },
  { label: 'Buy USDT',   href: '/buy-usdt-with-inr'   },
  { label: 'Calculator', href: '/usdt-to-inr-calculator' },
  { label: 'Fees',       href: '/fees'                },
  { label: 'Blog',       href: '/blog'                },
];

export function SeoNav({ active }: { active?: string }) {
  return (
    <>
      <LandingScripts />

      {/* ── Sticky nav — exact fr-nav CSS classes ── */}
      <nav className="fr-nav">
        <div className="fr-nav__inner">

          {/* Logo */}
          <Link href="/" className="fr-nav__logo">
            <div className="fr-nav__logo-icon">S</div>
            <span className="fr-nav__logo-name">
              Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="fr-nav__links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`fr-nav__link${active === href ? ' fr-nav__link--active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="fr-nav__actions">
            {/* PRO badge */}
            <Link href="/register" className="fr-nav__pro-badge">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                <path d="M6 0L12 3.5V7C12 10.5 9 13.5 6 14C3 13.5 0 10.5 0 7V3.5L6 0Z" opacity="0.9"/>
              </svg>
              PRO
            </Link>

            <Link href="/login" className="fr-nav__login">Sign in</Link>

            <Link href="/register" className="fr-btn fr-btn--primary fr-btn--md">
              Get Started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            {/* Hamburger — mobile only */}
            <button className="fr-nav__hamburger" data-mobile-toggle aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <div className="fr-mobile-menu" data-mobile-menu>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>
            Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
          <button
            data-mobile-toggle
            style={{ background: 'none', border: '1px solid var(--fr-border-default)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--fr-text-secondary)', display: 'flex' }}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {NAV_LINKS.map(({ label, href }) => (
          <Link key={href} href={href} className="fr-mobile-menu__item">{label}</Link>
        ))}

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/register" className="fr-btn fr-btn--primary fr-btn--lg fr-btn--full">
            Get Started Free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/login" className="fr-btn fr-btn--ghost fr-btn--lg fr-btn--full">Sign In</Link>
        </div>
      </div>
    </>
  );
}
