export type TokenNetwork = 'BEP20' | 'ERC20' | 'TRC20';

const NET_SRC: Record<TokenNetwork, string> = {
  BEP20: '/tokens/bnb.png',
  ERC20: '/tokens/eth.png',
  TRC20: '/tokens/tron.png',
};

interface TokenIconProps {
  network?: TokenNetwork | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface NetworkIconProps {
  network: TokenNetwork;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** USDT circle + small network badge in the bottom-right corner */
export function TokenIcon({ network, size = 40, className, style }: TokenIconProps) {
  if (!network) {
    return (
      <img
        src="/tokens/usdt.png"
        alt="USDT"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, ...style }}
      />
    );
  }

  const badgeSize = Math.round(size * 0.44);

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}
    >
      <img
        src="/tokens/usdt.png"
        alt="USDT"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: '50%', display: 'block' }}
      />
      <img
        src={NET_SRC[network]}
        alt={network}
        width={badgeSize}
        height={badgeSize}
        style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: badgeSize,
          height: badgeSize,
          objectFit: 'contain',
          borderRadius: '50%',
          border: '2px solid #111',
          background: '#111',
        }}
      />
    </div>
  );
}

/** Standalone network logo (BNB / ETH / TRON) */
export function NetworkIcon({ network, size = 20, className, style }: NetworkIconProps) {
  return (
    <img
      src={NET_SRC[network]}
      alt={network}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, borderRadius: '50%', ...style }}
    />
  );
}
