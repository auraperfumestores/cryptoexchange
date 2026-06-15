import { createConfig, http } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

const RPC_URLS: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com',
  56: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org',
};

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '';

// Trust Wallet specific connector — avoids accidentally connecting to Phantom or other injected wallets
// when multiple browser extensions are active.
const trustWalletInjected = injected({
  shimDisconnect: true,
  target() {
    if (typeof window === 'undefined') return { id: 'trustWallet', name: 'Trust Wallet', provider: undefined as any };
    const eth = (window as any).ethereum;
    const providers: any[] = eth?.providers ?? (eth ? [eth] : []);
    const provider = providers.find((p: any) => p.isTrust)
                  ?? (window as any).trustwallet?.ethereum
                  ?? (eth?.isTrust ? eth : undefined);
    return { id: 'trustWallet', name: 'Trust Wallet', provider };
  },
});

const connectors = [
  injected({ shimDisconnect: true }),
  trustWalletInjected,
  coinbaseWallet({ appName: 'SwapINR' }),
  ...(WC_PROJECT_ID
    ? [walletConnect({ projectId: WC_PROJECT_ID, showQrModal: true })]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [mainnet, bsc],
  connectors,
  transports: {
    [mainnet.id]: http(RPC_URLS[1]),
    [bsc.id]: http(RPC_URLS[56]),
  },
  ssr: true,
});

export const hasWalletConnect = !!WC_PROJECT_ID;
export { mainnet, bsc };
