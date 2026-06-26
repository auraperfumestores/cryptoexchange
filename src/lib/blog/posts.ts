export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  tags: string[];
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-convert-usdt-to-inr',
    title: 'How to Convert USDT to INR in India: A Step-by-Step Guide',
    description: 'Learn how to safely and quickly convert your USDT to Indian Rupees, including KYC requirements, supported networks, and settlement times.',
    date: '2026-05-12',
    readingMinutes: 6,
    tags: ['guides', 'usdt', 'inr'],
    content: [
      `Converting USDT to INR has become one of the most common needs for crypto holders in India — whether you're a freelancer paid in stablecoins, a trader booking profits, or a business settling invoices. This guide walks through the process end to end.`,
      `**Step 1: Complete KYC.** Indian regulations require identity verification before any rupee settlement. You'll typically need a PAN card, a government ID, and a live selfie or short video check. This is a one-time process for most platforms.`,
      `**Step 2: Choose your network.** USDT exists on multiple blockchains — BEP-20 (Binance Smart Chain), ERC-20 (Ethereum), and TRC-20 (Tron) are the most common. TRC-20 generally has the lowest network fees, which matters if you're converting smaller amounts.`,
      `**Step 3: Confirm your rate and place the order.** A reputable exchange will lock your rate at the moment you confirm the order, not when funds arrive. Double-check the deposit address and network before sending — sending USDT on the wrong network is the single most common (and unrecoverable) mistake.`,
      `**Step 4: Receive INR.** Once your USDT transfer is confirmed on-chain, INR settlement to your UPI ID or bank account should follow within minutes, not days, on a well-run platform.`,
      `**A note on fees and spreads.** The advertised "rate" matters less than the *effective* rate you receive after fees. Always check whether the platform shows an all-in rate or layers in withdrawal charges and spread separately.`,
    ],
  },
  {
    slug: 'usdt-inr-tax-india',
    title: 'Tax on USDT-to-INR Conversions in India: What You Need to Know',
    description: 'An overview of how converting USDT to INR is treated under Indian tax law, including TDS on VDA transfers and reporting obligations.',
    date: '2026-04-02',
    readingMinutes: 5,
    tags: ['tax', 'compliance', 'india'],
    content: [
      `Virtual Digital Assets (VDAs), which include USDT and other cryptocurrencies, are subject to specific tax treatment under Indian law. This article summarizes the key points — it is general information, not personalized tax advice.`,
      `**Flat tax rate.** Gains from the transfer of VDAs are taxed at a flat rate under Section 115BBH of the Income-tax Act, with no deduction allowed except the cost of acquisition, and losses from one VDA cannot be set off against gains from another.`,
      `**TDS under Section 194S.** A percentage of tax is deducted at source on the transfer of VDAs above specified thresholds. Exchanges operating in India are generally required to deduct and deposit this TDS, and you should receive a corresponding credit reflected in your Form 26AS.`,
      `**Keep records.** Maintain a record of your acquisition cost, transaction dates, and platform statements — these are essential when filing your return and reconciling TDS credits.`,
      `**This is not tax advice.** Tax treatment can change and depends on your specific circumstances. Consult a qualified chartered accountant for advice tailored to your situation.`,
    ],
  },
  {
    slug: 'usdt-network-fees-explained',
    title: 'BEP-20 vs ERC-20 vs TRC-20: Which USDT Network Should You Use?',
    description: 'A practical comparison of the three most common USDT networks — fees, speed, and which one to pick for converting to INR.',
    date: '2026-03-18',
    readingMinutes: 4,
    tags: ['guides', 'usdt', 'networks'],
    content: [
      `USDT is issued on several blockchains, and choosing the right one before you send funds can save you both time and money.`,
      `**TRC-20 (Tron).** Typically the cheapest option, with network fees often well under a dollar's worth of TRX, and fast confirmation times. This is usually the best default for everyday conversions.`,
      `**BEP-20 (BNB Smart Chain).** Also low-cost and fast, widely supported by Indian exchanges and wallets. A solid alternative to TRC-20.`,
      `**ERC-20 (Ethereum).** The original USDT network, but typically the most expensive due to Ethereum gas fees, which can fluctuate significantly with network congestion. Best reserved for cases where the sending wallet only supports this network.`,
      `**The golden rule:** always match the network at both ends. Sending USDT on a network the receiving address doesn't support can result in permanently lost funds — there is no way to reverse a confirmed blockchain transaction.`,
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}
