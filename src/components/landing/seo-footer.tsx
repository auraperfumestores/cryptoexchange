import Link from 'next/link';

const COL_EXCHANGE = [
  ['Sell USDT for INR',      '/sell-usdt-for-inr'       ],
  ['Buy USDT with INR',      '/buy-usdt-with-inr'        ],
  ['USDT to INR Rate',       '/usdt-to-inr'              ],
  ['USDT to INR Calculator', '/usdt-to-inr-calculator'   ],
  ['Fees & Charges',         '/fees'                     ],
];

const COL_GUIDES = [
  ['How to Sell USDT India',  '/how-to-sell-usdt-in-india'],
  ['TRC-20 USDT to INR',      '/trc20-usdt-to-inr'        ],
  ['BEP-20 USDT to INR',      '/bep20-usdt-to-inr'        ],
  ['Blog & Guides',           '/blog'                     ],
];

const COL_COMPANY = [
  ['About SwappINR', '/about'         ],
  ['Careers',        '/careers'       ],
  ['Privacy Policy', '/privacy'       ],
  ['Terms of Use',   '/terms'         ],
  ['Refund Policy',  '/refund-policy' ],
];

export function SeoFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'var(--fr-black)',
      padding: '56px 24px 32px',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        {/* Logo + tagline */}
        <div style={{ marginBottom: 48 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#000', fontSize: 12, fontWeight: 900 }}>S</span>
            </div>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em' }}>
              Swapp<span style={{ color: '#CCFF00' }}>INR</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 340, lineHeight: 1.6, margin: '6px 0 0' }}>
            India&apos;s fastest USDT ↔ INR exchange. Live rates, instant UPI payouts, zero hidden fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Exchange</p>
            {COL_EXCHANGE.map(([label, href]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 13, textDecoration: 'none', marginBottom: 9, lineHeight: 1.4 }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Guides</p>
            {COL_GUIDES.map(([label, href]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 13, textDecoration: 'none', marginBottom: 9, lineHeight: 1.4 }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Company</p>
            {COL_COMPANY.map(([label, href]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.42)', fontSize: 13, textDecoration: 'none', marginBottom: 9, lineHeight: 1.4 }}>{label}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 14 }}>Start Trading</p>
            <Link href="/register" style={{
              display: 'inline-block', background: '#CCFF00', color: '#000', fontSize: 13,
              fontWeight: 800, textDecoration: 'none', padding: '10px 20px', borderRadius: 10, marginBottom: 12,
            }}>Create Free Account →</Link>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
              KYC verified in 5 minutes. No minimum trade.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© {year} SwappINR. All rights reserved.</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', maxWidth: 500, lineHeight: 1.55, textAlign: 'right' }}>
            Cryptocurrency trading involves risk. SwappINR facilitates USDT ↔ INR exchange and is not a financial advisor. Comply with Indian income tax (Section 115BBH) and FEMA guidelines.
          </p>
        </div>
      </div>
    </footer>
  );
}
