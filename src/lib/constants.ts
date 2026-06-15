// Supported crypto networks and their configurations
export const NETWORKS = {
  ERC20: {
    name: 'Ethereum',
    chainId: 1,
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io',
    color: '#627EEA',
  },
  BEP20: {
    name: 'BSC',
    chainId: 56,
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com',
    color: '#F3BA2F',
  },
  TRC20: {
    name: 'Tron',
    chainId: null, // Not EVM-compatible
    symbol: 'TRX',
    blockExplorer: 'https://tronscan.org',
    color: '#FF0013',
  },
} as const;

export const CRYPTO_CONFIGS = [
  { symbol: 'USDT', name: 'Tether USD', networks: ['ERC20', 'BEP20', 'TRC20'], decimals: 6 },
  { symbol: 'BNB', name: 'BNB', networks: ['BEP20'], decimals: 18 },
] as const;

// Transaction statuses with labels and colors
export const TRANSACTION_STATUS = {
  pending: { label: 'Pending', color: 'warning' as const },
  crypto_deposit_pending: { label: 'Awaiting Deposit', color: 'warning' as const },
  crypto_deposit_confirmed: { label: 'Deposit Confirmed', color: 'success' as const },
  payment_pending: { label: 'Awaiting Payment', color: 'warning' as const },
  payment_proof_uploaded: { label: 'Proof Uploaded', color: 'info' as const },
  completed: { label: 'Completed', color: 'success' as const },
  cancelled: { label: 'Cancelled', color: 'muted' as const },
  rejected: { label: 'Rejected', color: 'error' as const },
} as const;

// Platform fee percentage
export const PLATFORM_FEE_PERCENT = 0.5;

// Minimum transaction amounts
export const MIN_CRYPTO_AMOUNTS: Record<string, number> = {
  USDT: 10,
  BNB: 0.1,
};

// Maximum transaction amounts (INR)
export const MAX_INR_AMOUNT = 500000;

// Deposit addresses for each crypto+network (admin-configurable in production)
export const DEPOSIT_ADDRESSES: Record<string, string> = {
  'USDT-ERC20': process.env.NEXT_PUBLIC_DEPOSIT_USDT_ERC20 || '0x0000000000000000000000000000000000000001',
  'USDT-BEP20': process.env.NEXT_PUBLIC_DEPOSIT_USDT_BEP20 || '0x0000000000000000000000000000000000000002',
  'USDT-TRC20': process.env.NEXT_PUBLIC_DEPOSIT_USDT_TRC20 || 'TJYzEYQnHPpMvUShQ1dZ5oAPYzHmMvK4LB',
  'BNB-BEP20': process.env.NEXT_PUBLIC_DEPOSIT_BNB_BEP20 || '0x0000000000000000000000000000000000000003',
};