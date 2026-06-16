// Barrel re-export — keeps existing imports from @/lib/utils working
// while delegating to the organised module files.

import { formatINRNumber as _formatINRNumber } from './utils/format';

export { cn } from './utils/cn';
export {
  formatINR,
  formatINRNumber,
  formatRate,
  formatInt,
  formatCrypto,
  formatPercent,
  shortenAddress,
  shortenTxHash,
  timeAgo,
  formatDateTime,
  formatDate,
  generateOrderId,
} from './utils/format';
export {
  NETWORK_CONFIG,
  EVM_NETWORKS,
  getNetworkConfig,
  txExplorerUrl,
  addressExplorerUrl,
} from './utils/chains';
export { HttpError, errorResponse, unauthorized, forbidden, notFound, badRequest } from './utils/errors';

// Compatibility alias
export const formatINRCurrency = (amount: number) => `₹${_formatINRNumber(amount, { showSymbol: false })}`;

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTronAddress(address: string): boolean {
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    56: 'BSC',
    137: 'Polygon',
    97: 'BSC Testnet',
    11155111: 'Sepolia',
  };
  return networks[chainId] || 'Unknown';
}

export function getNetworkLabel(network: string): string {
  const labels: Record<string, string> = {
    ERC20: 'Ethereum (ERC20)',
    BEP20: 'BSC (BEP20)',
    TRC20: 'Tron (TRC20)',
  };
  return labels[network] || network;
}

export function calculateINR(cryptoAmount: number, rate: number, fee: number = 0): number {
  return cryptoAmount * rate - fee;
}

export function calculateFeeBreakdown(cryptoAmount: number, rate: number, platformFeePercent: number = 0.5) {
  const grossINR = cryptoAmount * rate;
  const platformFee = grossINR * (platformFeePercent / 100);
  const netINR = grossINR - platformFee;
  return { grossINR, platformFee, netINR };
}