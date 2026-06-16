import type { Network, CryptoSymbol } from '@/types';

export interface NetworkConfig {
  network: Network;
  label: string;
  chainId: number | null; // null for non-EVM (Tron)
  isEvm: boolean;
  tokenSymbol: CryptoSymbol;
  decimals: number;
  explorer: string;
  explorerName: string;
}

export const NETWORK_CONFIG: Record<Network, NetworkConfig> = {
  ERC20: {
    network: 'ERC20',
    label: 'Ethereum (ERC20)',
    chainId: 1,
    isEvm: true,
    tokenSymbol: 'USDT',
    decimals: 6,
    explorer: 'https://etherscan.io',
    explorerName: 'Etherscan',
  },
  BEP20: {
    network: 'BEP20',
    label: 'BNB Smart Chain (BEP20)',
    chainId: 56,
    isEvm: true,
    tokenSymbol: 'USDT',
    decimals: 18, // BEP20 USDT uses 18 decimals
    explorer: 'https://bscscan.com',
    explorerName: 'BscScan',
  },
  TRC20: {
    network: 'TRC20',
    label: 'Tron (TRC20)',
    chainId: null,
    isEvm: false,
    tokenSymbol: 'USDT',
    decimals: 6,
    explorer: 'https://tronscan.org',
    explorerName: 'TronScan',
  },
};

/** Network configs that are EVM-compatible (for wallet connect). */
export const EVM_NETWORKS: NetworkConfig[] = Object.values(NETWORK_CONFIG).filter((n) => n.isEvm);

export function getNetworkConfig(network: Network): NetworkConfig {
  return NETWORK_CONFIG[network];
}

/** Build a block-explorer link for a transaction hash. */
export function txExplorerUrl(network: Network, hash: string): string {
  const cfg = NETWORK_CONFIG[network];
  if (!cfg || !hash) return '#';
  if (network === 'TRC20') return `${cfg.explorer}/#/transaction/${hash}`;
  return `${cfg.explorer}/tx/${hash}`;
}

/** Build a block-explorer link for a wallet address. */
export function addressExplorerUrl(network: Network, address: string): string {
  const cfg = NETWORK_CONFIG[network];
  if (!cfg || !address) return '#';
  if (network === 'TRC20') return `${cfg.explorer}/#/address/${address}`;
  return `${cfg.explorer}/address/${address}`;
}
