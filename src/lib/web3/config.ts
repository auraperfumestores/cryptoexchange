import { createConfig, http } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

const RPC_URLS: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com',
  56: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org',
};

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '';

const connectors = [
  injected({ shimDisconnect: true }),
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
