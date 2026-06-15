// Professional SVG icons — pixel-perfect crypto & fintech graphics

export function UsdtCoin({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="usdt-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3EC99C" />
          <stop offset="100%" stopColor="#1A8C5B" />
        </radialGradient>
        <filter id="usdt-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#26A17B" floodOpacity="0.4" />
        </filter>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#usdt-bg)" filter="url(#usdt-shadow)" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* T bar */}
      <rect x="11" y="11" width="18" height="2.5" rx="1.25" fill="white" />
      {/* Vertical stem */}
      <rect x="18.75" y="13.5" width="2.5" height="7" rx="1.25" fill="white" />
      {/* USDT double line */}
      <rect x="13" y="22" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.9)" />
      <rect x="14" y="24.5" width="12" height="1.2" rx="0.6" fill="rgba(255,255,255,0.55)" />
    </svg>
  );
}

export function InrSymbol({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="inr-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4D9FFF" />
          <stop offset="100%" stopColor="#1A3FFF" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#inr-bg)" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* ₹ symbol paths */}
      <path d="M14 13H26M14 17H26M14 13C14 13 14 17 18 21L14 27" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 17C17 17 22 17 24 19C25.5 21 24 23 22 24L14 27" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function Bep20Icon({ size = 28 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bnb-g" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#C8960C" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#bnb-g)" />
      {/* BNB diamond pattern */}
      <path d="M16 7L20.5 11.5L16 16L11.5 11.5L16 7Z" fill="white" />
      <path d="M7 16L11.5 11.5L16 16L11.5 20.5L7 16Z" fill="rgba(255,255,255,0.85)" />
      <path d="M25 16L20.5 11.5L16 16L20.5 20.5L25 16Z" fill="rgba(255,255,255,0.85)" />
      <path d="M16 25L20.5 20.5L16 16L11.5 20.5L16 25Z" fill="white" />
      <path d="M16 13.5L18.5 16L16 18.5L13.5 16L16 13.5Z" fill="url(#bnb-g)" />
    </svg>
  );
}

export function Erc20Icon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="eth-g" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8FA3F0" />
          <stop offset="100%" stopColor="#4A67D6" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#eth-g)" />
      {/* ETH diamond */}
      <path d="M16 6L23 15.5L16 19.5L9 15.5L16 6Z" fill="rgba(255,255,255,0.55)" />
      <path d="M16 6L23 15.5L16 19.5V6Z" fill="rgba(255,255,255,0.9)" />
      <path d="M9 15.5L16 19.5L23 15.5L16 18L9 15.5Z" fill="rgba(255,255,255,0.2)" />
      <path d="M16 21L23 17L16 26L9 17L16 21Z" fill="rgba(255,255,255,0.55)" />
      <path d="M16 21L23 17L16 26V21Z" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

export function Trc20Icon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="trx-g" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF5C7C" />
          <stop offset="100%" stopColor="#C0000F" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#trx-g)" />
      {/* TRX icon */}
      <path d="M8 9.5L25 14.5L16.5 24L8 9.5Z" fill="rgba(255,255,255,0.9)" />
      <path d="M8 9.5L25 14.5L22 11L8 9.5Z" fill="rgba(255,255,255,0.5)" />
      <path d="M16.5 24L25 14.5L19 19.5L16.5 24Z" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2.5L4 6V11.5C4 16.2 7.4 20.7 12 22C16.6 20.7 20 16.2 20 11.5V6L12 2.5Z"
        fill={color} fillOpacity="0.15"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.5 12L10.8 14.3L15.5 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="11" width="16" height="11" rx="3" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
      <path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1.5" fill={color} />
      <line x1="12" y1="18" x2="12" y2="19.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      <path d="M12 7.5V12.5L15.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowSwapIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M17 4L21 8L17 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M7 20L3 16L7 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16H3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ChartIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 17L9 11L13 15L21 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6H21V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  );
}

export function WalletIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 8C2 6.9 2.9 6 4 6H20C21.1 6 22 6.9 22 8V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V8Z"
        fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.5" />
      <path d="M16 13.5C16 12.7 16.7 12 17.5 12H22V15H17.5C16.7 15 16 14.3 16 13.5Z"
        fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
      <circle cx="17.5" cy="13.5" r="1" fill={color} />
      <path d="M6 6V5C6 3.9 6.9 3 8 3H16C17.1 3 18 3.9 18 5V6" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function GlobeIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4.5" ry="9" stroke={color} strokeWidth="1.5" />
      <path d="M3.5 9H20.5M3.5 15H20.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ComplianceIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.5" />
      <path d="M8 12L10.5 14.5L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UpiIcon({ size = 32, color = '#00E5A0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={color} fillOpacity="0.12" />
      <rect x="1" y="1" width="38" height="38" rx="9" stroke={color} strokeOpacity="0.25" strokeWidth="1" />
      {/* UPI lightning bolt */}
      <path d="M23 8L14 22H20L17 32L26 18H20L23 8Z" fill={color} />
    </svg>
  );
}

export function BankIcon({ size = 32, color = '#4D9FFF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={color} fillOpacity="0.12" />
      <rect x="1" y="1" width="38" height="38" rx="9" stroke={color} strokeOpacity="0.25" strokeWidth="1" />
      {/* Bank building */}
      <path d="M20 9L32 16H8L20 9Z" fill={color} />
      <rect x="10" y="17" width="3.5" height="9" rx="1" fill={color} />
      <rect x="16.25" y="17" width="3.5" height="9" rx="1" fill={color} />
      <rect x="22.5" y="17" width="3.5" height="9" rx="1" fill={color} />
      <rect x="28.5" y="17" width="3.5" height="9" rx="1" fill={color} />
      <rect x="8" y="27" width="24" height="2.5" rx="1" fill={color} />
    </svg>
  );
}

export function StarRating({ count = 5, size = 16 }: { count?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5L9.6 6.1H14.5L10.5 8.9L12.1 13.5L8 10.7L3.9 13.5L5.5 8.9L1.5 6.1H6.4L8 1.5Z"
            fill={i < count ? '#FFB800' : 'rgba(255,255,255,0.12)'}
            stroke={i < count ? '#FFB800' : 'transparent'}
            strokeWidth="0.5" />
        </svg>
      ))}
    </span>
  );
}

export function QuotationMark({ size = 24, color = 'rgba(77,159,255,0.3)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 32 22" fill="none" style={{ marginBottom: 10 }}>
      <path d="M0 22V14C0 10 1.33 7 4 5C6.67 3 9.67 2 13 2V6C11 6 9.33 6.67 8 8C6.67 9.33 6 11 6 13H10V22H0ZM18 22V14C18 10 19.33 7 22 5C24.67 3 27.67 2 31 2V6C29 6 27.33 6.67 26 8C24.67 9.33 24 11 24 13H28V22H18Z"
        fill={color} />
    </svg>
  );
}

/* ── Hero decorative floating crypto coins ── */

export function FloatingBitcoin({ size = 60, opacity = 0.8 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ opacity }}>
      <defs>
        <radialGradient id="btc-float" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#F7931A" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="#C4720F" />
      <circle cx="30" cy="28.5" r="28" fill="url(#btc-float)" />
      <ellipse cx="22" cy="17" rx="9" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-20 22 17)" />
      {/* ₿ body */}
      <rect x="23" y="16" width="3" height="22" rx="1.5" fill="rgba(255,255,255,0.92)" />
      <path d="M26 16H33C35.5 16 37 17.5 37 19.5C37 21.5 35.5 23 33 23H26V16Z" fill="rgba(255,255,255,0.92)" />
      <path d="M26 23H34C36.5 23 38 24.5 38 27C38 29.5 36.5 31 34 31H26V23Z" fill="rgba(255,255,255,0.92)" />
      <rect x="22" y="13" width="2.5" height="4" rx="1.25" fill="rgba(255,255,255,0.92)" />
      <rect x="29" y="13" width="2.5" height="4" rx="1.25" fill="rgba(255,255,255,0.92)" />
      <rect x="22" y="35" width="2.5" height="4" rx="1.25" fill="rgba(255,255,255,0.92)" />
      <rect x="29" y="35" width="2.5" height="4" rx="1.25" fill="rgba(255,255,255,0.92)" />
    </svg>
  );
}

export function FloatingEthereum({ size = 60, opacity = 0.75 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ opacity }}>
      <defs>
        <radialGradient id="eth-float" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#9B7FFF" />
          <stop offset="100%" stopColor="#4A67D6" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="#3551C2" />
      <circle cx="30" cy="28.5" r="28" fill="url(#eth-float)" />
      <ellipse cx="22" cy="17" rx="9" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 22 17)" />
      {/* ETH crystal */}
      <path d="M30 10L43 29L30 35L17 29L30 10Z" fill="rgba(255,255,255,0.82)" />
      <path d="M30 10L43 29L30 35V10Z" fill="rgba(255,255,255,0.25)" />
      <path d="M17 29L30 35L43 29L30 32.5L17 29Z" fill="rgba(0,0,0,0.12)" />
      <path d="M30 36.5L43 31L30 50L17 31L30 36.5Z" fill="rgba(255,255,255,0.55)" />
      <path d="M30 36.5L43 31L30 50V36.5Z" fill="rgba(255,255,255,0.82)" />
    </svg>
  );
}

export function FloatingUsdt({ size = 60, opacity = 0.75 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ opacity }}>
      <defs>
        <radialGradient id="usdt-float" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#53D9A0" />
          <stop offset="100%" stopColor="#1A8C5B" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="#0E6B43" />
      <circle cx="30" cy="28.5" r="28" fill="url(#usdt-float)" />
      <ellipse cx="22" cy="17" rx="9" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-20 22 17)" />
      <rect x="16" y="15" width="28" height="4.5" rx="2.25" fill="rgba(255,255,255,0.92)" />
      <rect x="27" y="19.5" width="6" height="11" rx="3" fill="rgba(255,255,255,0.92)" />
      <rect x="19" y="33" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.85)" />
      <rect x="21" y="37.5" width="18" height="2.2" rx="1.1" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

export function FloatingBnb({ size = 60, opacity = 0.72 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ opacity }}>
      <defs>
        <radialGradient id="bnb-float" cx="38%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFE168" />
          <stop offset="100%" stopColor="#E8A900" />
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="#B07900" />
      <circle cx="30" cy="28.5" r="28" fill="url(#bnb-float)" />
      <ellipse cx="22" cy="17" rx="9" ry="5" fill="rgba(255,255,255,0.22)" transform="rotate(-20 22 17)" />
      {/* BNB 4-diamond pattern */}
      <path d="M30 14L36 20L30 26L24 20L30 14Z" fill="rgba(255,255,255,0.92)" />
      <path d="M18 26L24 20L30 26L24 32L18 26Z" fill="rgba(255,255,255,0.78)" />
      <path d="M42 26L36 20L30 26L36 32L42 26Z" fill="rgba(255,255,255,0.78)" />
      <path d="M30 38L36 32L30 26L24 32L30 38Z" fill="rgba(255,255,255,0.92)" />
      <path d="M30 22L34 26L30 30L26 26L30 22Z" fill="url(#bnb-float)" />
    </svg>
  );
}

export function PriceChartFloat({ width = 110, height = 64, opacity = 0.65 }: { width?: number; height?: number; opacity?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 110 64" fill="none" style={{ opacity }}>
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E5A0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00E5A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      <line x1="0" y1="54" x2="110" y2="54" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />
      <line x1="0" y1="38" x2="110" y2="38" stroke="rgba(0,212,255,0.08)" strokeWidth="1" />
      <line x1="0" y1="22" x2="110" y2="22" stroke="rgba(0,212,255,0.06)" strokeWidth="1" />
      {/* Area fill */}
      <path d="M0 50 L16 46 L32 48 L48 36 L64 30 L80 20 L96 12 L110 6 L110 54 L0 54Z" fill="url(#chart-fill)" />
      {/* Price line */}
      <path d="M0 50 L16 46 L32 48 L48 36 L64 30 L80 20 L96 12 L110 6" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Candle bodies */}
      {[[14,42,48],[30,44,50],[46,32,38],[62,26,32],[78,16,22],[94,8,14]].map(([x,t,b], i) => (
        <rect key={i} x={x-4} y={t} width={8} height={b-t} rx="2" fill="rgba(0,229,160,0.28)" />
      ))}
      {/* Glowing endpoint */}
      <circle cx="110" cy="6" r="5" fill="#00E5A0" />
      <circle cx="110" cy="6" r="9" fill="#00E5A0" opacity="0.18" />
      {/* Label badge */}
      <rect x="2" y="2" width="52" height="16" rx="5" fill="rgba(0,229,160,0.12)" stroke="rgba(0,229,160,0.25)" strokeWidth="1" />
      <text x="28" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="#00E5A0" fontFamily="monospace">USDT/INR ↑</text>
    </svg>
  );
}

export function BlockchainFloat({ size = 90, opacity = 0.5 }: { size?: number; opacity?: number }) {
  const nodes: [number, number][] = [[45, 9], [80, 28], [68, 63], [22, 63], [10, 28]];
  const links: [number, number][] = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[1,3]];
  return (
    <svg width={size} height={size} viewBox="0 0 90 80" fill="none" style={{ opacity }}>
      {links.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="rgba(0,212,255,0.28)" strokeWidth="1"
          strokeDasharray={i > 4 ? "3 3" : undefined}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
          <circle cx={x} cy={y} r="4" fill="#00D4FF" />
          <circle cx={x} cy={y} r="7" fill="#00D4FF" opacity="0.12" />
        </g>
      ))}
    </svg>
  );
}
