import Link from 'next/link';

const COL_PRODUCT = [
  ['Sell USDT for INR',      '/sell-usdt-for-inr'      ],
  ['Buy USDT with INR',      '/buy-usdt-with-inr'      ],
  ['USDT → INR Calculator',  '/usdt-to-inr-calculator' ],
  ['Live USDT Rate',         '/usdt-to-inr'            ],
  ['TRC-20 USDT to INR',     '/trc20-usdt-to-inr'      ],
  ['BEP-20 USDT to INR',     '/bep20-usdt-to-inr'      ],
  ['Fees & Limits',          '/fees'                   ],
];

const COL_COMPANY = [
  ['How It Works',  '/#how'    ],
  ['About Us',      '/about'   ],
  ['Blog',          '/blog'    ],
  ['Careers',       '/careers' ],
];

const COL_LEGAL = [
  ['Terms of Service', '/terms'         ],
  ['Privacy Policy',   '/privacy'       ],
  ['Refund Policy',    '/refund-policy' ],
  ['KYC / AML Policy', '/kyc-aml'       ],
];

export function SeoFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: 'var(--fr-dark-0)', borderTop: '1px solid var(--fr-border-subtle)', padding: '64px 0 32px' }}>
      <div className="fr-container">

        {/* ── 4-column grid matching real site ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>

          {/* Col 1 — Brand + tagline + socials */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div className="fr-nav__logo-icon">S</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--fr-text-primary)', letterSpacing: '-0.02em' }}>
                Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
              </span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--fr-text-secondary)', lineHeight: 1.7, maxWidth: 280, margin: '0 0 24px' }}>
              India&apos;s fastest USDT ↔ INR exchange. Live rates, instant UPI settlement, zero hidden fees.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Telegram', href: 'https://t.me/swappinr', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/></svg> },
                { label: 'X', href: 'https://x.com/swappinr', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: 'LinkedIn', href: 'https://linkedin.com/company/swappinr', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              ].map(({ label, href, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fr-text-secondary)', textDecoration: 'none' }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Product */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Product</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COL_PRODUCT.map(([label, href]) => (
                <li key={href}><Link href={href} style={{ fontSize: 14, color: 'var(--fr-text-secondary)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Company</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COL_COMPANY.map(([label, href]) => (
                <li key={href}><Link href={href} style={{ fontSize: 14, color: 'var(--fr-text-secondary)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Legal</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COL_LEGAL.map(([label, href]) => (
                <li key={href}><Link href={href} style={{ fontSize: 14, color: 'var(--fr-text-secondary)', textDecoration: 'none' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid var(--fr-border-subtle)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', margin: 0 }}>
            &copy; {year} SwappINR. All rights reserved. P2P settlement service — not a regulated broker.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['BEP-20','#CCFF00'],['TRC-20','#00E5A0'],['ERC-20','#60A5FA'],['UPI','#9B87F5']].map(([label, color]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--fr-text-tertiary)', background: 'var(--fr-dark-2)', border: '1px solid var(--fr-border-subtle)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
