import { formatINR, formatINRNumber, formatCrypto, shortenAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function INRAmount({ amount, className, size = 'md' }: { amount: number; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };
  return (
    <span className={cn('font-semibold text-secondary', sizes[size], className)}>
      {formatINR(amount)}
    </span>
  );
}

export function CryptoAmount({ amount, symbol, className }: { amount: number; symbol?: string; className?: string }) {
  return (
    <span className={cn('font-mono-crypto text-secondary', className)}>
      {formatCrypto(amount)}
      {symbol && <span className="text-muted ml-1 font-sans text-sm">{symbol}</span>}
    </span>
  );
}

export function ShortAddress({ address, className }: { address: string; className?: string }) {
  return (
    <span className={cn('font-mono-crypto text-sm text-muted', className)}>
      {shortenAddress(address)}
    </span>
  );
}