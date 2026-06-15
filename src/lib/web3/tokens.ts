/**
 * Token contract addresses per chain. Only the contracts we
 * actually accept (USDT and BNB on the supported EVM networks).
 * BNB is the native gas token of BSC, so no contract is needed
 * for BNB on BEP20; USDT has explicit contract addresses.
 */

import type { CryptoSymbol, Network } from '@/types';

export interface TokenMeta {
  symbol: CryptoSymbol;
  network: Network;
  decimals: number;
  /** ERC-20 contract address. Empty string for the native gas token. */
  address: `0x${string}` | '';
  isNative: boolean;
  name: string;
}

export const TOKENS: Record<string, TokenMeta> = {
  'USDT-ERC20': {
    symbol: 'USDT',
    network: 'ERC20',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Tether USD on Ethereum
    isNative: false,
    name: 'Tether USD',
  },
  'USDT-BEP20': {
    symbol: 'USDT',
    network: 'BEP20',
    decimals: 18,
    address: '0x55d398326f99059fF775485246999027B3197955', // Tether USD on BSC
    isNative: false,
    name: 'Tether USD',
  },
  'BNB-BEP20': {
    symbol: 'BNB',
    network: 'BEP20',
    decimals: 18,
    address: '',
    isNative: true,
    name: 'BNB',
  },
  // TRC20 is not EVM; no contract entry needed here.
};

export function getTokenMeta(symbol: CryptoSymbol, network: Network): TokenMeta | null {
  return TOKENS[`${symbol}-${network}`] || null;
}

/** A short list of networks that support EVM wallet connect. */
export const EVM_NETWORK_KEYS = ['ERC20', 'BEP20'] as const;
