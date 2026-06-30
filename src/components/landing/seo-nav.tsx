import Link from 'next/link';

const LINKS = [
  { label: 'Sell USDT',   href: '/sell-usdt-for-inr' },
  { label: 'Buy USDT',    href: '/buy-usdt-with-inr'  },
  { label: 'Fees',        href: '/fees'               },
  { label: 'Blog',        href: '/blog'               },
];

export function SeoNav({ active }: { active?: string }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,8,8,0.94)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: 1140, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58,
      }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 14, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: '#fff', fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swapp<span style={{ color: '#CCFF00' }}>INR</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 2, marginRight: 4 }}>
            {LINKS.map(({ label, href }) => (
              <Link key={href} href={href} style={{
                color: active === href ? '#CCFF00' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                padding: '6px 11px', borderRadius: 8,
                background: active === href ? 'rgba(204,255,0,0.07)' : 'none',
              }}>{label}</Link>
            ))}
          </div>
          <Link href="/login" style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', padding: '7px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.09)', marginRight: 6,
          }}>Sign in</Link>
          <Link href="/register" style={{
            background: '#CCFF00', color: '#000', fontSize: 13, fontWeight: 800,
            textDecoration: 'none', padding: '8px 18px', borderRadius: 9,
          }}>Get Started →</Link>
        </div>
      </div>
    </nav>
  );
}
