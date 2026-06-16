import { useEffect, useState } from 'react';

export interface DetectedWallet {
  id: string;
  name: string;
  rdns?: string;
  /** True if this provider is the globally-injected window.ethereum */
  isInjected: boolean;
}

/**
 * Detect which EIP-1193 wallets are installed in the browser.
 * We look for well-known rdns values on `window.ethereum` plus
 * any provider exposed via `window.ethereum.providers` (used by
 * multiple-installed extensions).
 */
const KNOWN_WALLETS: Array<{ rdns: string; name: string }> = [
  { rdns: 'io.metamask', name: 'MetaMask' },
  { rdns: 'com.trustwallet.app', name: 'Trust Wallet' },
  { rdns: 'com.okex.wallet', name: 'OKX Wallet' },
  { rdns: 'com.coinbase.wallet', name: 'Coinbase Wallet' },
  { rdns: 'io.rabby', name: 'Rabby' },
  { rdns: 'com.binance.wallet', name: 'Binance Wallet' },
  { rdns: 'walletconnect', name: 'WalletConnect' },
];

interface EIP1193Provider {
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  isMetaMask?: boolean;
  isTrust?: boolean;
  isOKExWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  providers?: EIP1193Provider[];
}

export function useDetectedWallets(): DetectedWallet[] {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const eth = (window as any).ethereum as EIP1193Provider | undefined;
    if (!eth) {
      setWallets([]);
      return;
    }

    const detected: DetectedWallet[] = [];
    const providers: EIP1193Provider[] = eth.providers && eth.providers.length ? eth.providers : [eth];

    providers.forEach((p, i) => {
      // Try to find a matching name via rdns (EIP-6963 friendly)
      // or via the boolean flags each wallet sets.
      let name = 'Injected Wallet';
      let rdns: string | undefined;
      if (p.isMetaMask) {
        name = 'MetaMask';
        rdns = 'io.metamask';
      } else if (p.isTrust) {
        name = 'Trust Wallet';
        rdns = 'com.trustwallet.app';
      } else if (p.isOKExWallet) {
        name = 'OKX Wallet';
        rdns = 'com.okex.wallet';
      } else if (p.isCoinbaseWallet) {
        name = 'Coinbase Wallet';
        rdns = 'com.coinbase.wallet';
      } else if (p.isRabby) {
        name = 'Rabby';
        rdns = 'io.rabby';
      } else {
        // fallback by index
        name = `Wallet ${i + 1}`;
      }
      detected.push({
        id: rdns || `provider-${i}`,
        name,
        rdns,
        isInjected: true,
      });
    });

    setWallets(detected);
  }, []);

  return wallets;
}

/** Request accounts from the first available provider. */
export async function connectInjected(): Promise<{ address: string; chainId: number }> {
  const eth = (window as any).ethereum as EIP1193Provider | undefined;
  if (!eth) throw new Error('No injected wallet detected. Install MetaMask, Trust, OKX, or another EIP-1193 wallet.');
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  const chainHex: string = await eth.request({ method: 'eth_chainId' });
  return { address: accounts[0], chainId: parseInt(chainHex, 16) };
}

/** Switch to a target chain id; if not present, attempt to add. */
export async function switchOrAddChain(targetChainId: number): Promise<void> {
  const eth = (window as any).ethereum as EIP1193Provider | undefined;
  if (!eth) throw new Error('No injected wallet detected');
  const hex = `0x${targetChainId.toString(16)}`;
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hex }],
    });
  } catch (err: any) {
    if (err?.code === 4902) {
      // Chain not added — provide a minimal definition for Ethereum / BSC
      const definitions: Record<number, any> = {
        1: {
          chainId: hex,
          chainName: 'Ethereum Mainnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://cloudflare-eth.com'],
          blockExplorerUrls: ['https://etherscan.io'],
        },
        56: {
          chainId: hex,
          chainName: 'BNB Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed.binance.org'],
          blockExplorerUrls: ['https://bscscan.com'],
        },
      };
      const def = definitions[targetChainId];
      if (!def) throw err;
      await eth.request({ method: 'wallet_addEthereumChain', params: [def] });
    } else {
      throw err;
    }
  }
}
