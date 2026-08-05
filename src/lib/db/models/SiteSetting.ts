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

/* ── Dynamic Rate Tiers ── */
export interface DynamicRateTier {
  minAmount: number; // minimum USDT trade size to activate this tier
  bonus:     number; // INR added per USDT for sell; INR subtracted per USDT for buy
}

export interface DynamicRateSettings {
  sellEnabled: boolean;
  buyEnabled:  boolean;
  sellTiers:   DynamicRateTier[];
  buyTiers:    DynamicRateTier[];
}

export const DEFAULT_DYNAMIC_RATE: DynamicRateSettings = {
  sellEnabled: false,
  buyEnabled:  false,
  sellTiers: [
    { minAmount: 0,    bonus: 0   },
    { minAmount: 100,  bonus: 0.5 },
    { minAmount: 250,  bonus: 1.0 },
    { minAmount: 500,  bonus: 1.5 },
    { minAmount: 1000, bonus: 2.0 },
  ],
  buyTiers: [
    { minAmount: 0,    bonus: 0   },
    { minAmount: 100,  bonus: 0.5 },
    { minAmount: 250,  bonus: 1.0 },
    { minAmount: 500,  bonus: 1.5 },
    { minAmount: 1000, bonus: 2.0 },
  ],
};

export async function getDynamicRateSettings(): Promise<DynamicRateSettings> {
  const doc = await SiteSetting.findOne({ key: 'dynamicRates' }).lean();
  const saved = doc?.value as Partial<DynamicRateSettings> | undefined;
  // Merge saved toggles with default tiers so missing keys never throw
  return {
    sellEnabled: saved?.sellEnabled ?? false,
    buyEnabled:  saved?.buyEnabled  ?? false,
    sellTiers:   saved?.sellTiers   ?? DEFAULT_DYNAMIC_RATE.sellTiers,
    buyTiers:    saved?.buyTiers    ?? DEFAULT_DYNAMIC_RATE.buyTiers,
  };
}

/* ── Developer / Debug Settings ── */
export async function getDebugLogEnabled(): Promise<boolean> {
  const doc = await SiteSetting.findOne({ key: 'debugLogEnabled' }).lean();
  return (doc?.value as boolean) ?? false;
}

/* ── Support Welcome Message ── */
export interface SupportWelcomeSettings {
  enabled: boolean;
  message: string;
}
export const DEFAULT_SUPPORT_WELCOME: SupportWelcomeSettings = {
  enabled: false,
  message: "Hi there! 👋 Thanks for reaching out to SwappINR Support. An agent will join shortly — please describe your issue and we'll help as soon as possible.",
};
export async function getSupportWelcomeSettings(): Promise<SupportWelcomeSettings> {
  const doc = await SiteSetting.findOne({ key: 'supportWelcome' }).lean();
  return (doc?.value as SupportWelcomeSettings) ?? DEFAULT_SUPPORT_WELCOME;
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

/* ── Scheduled Rate Overrides ── */
export interface ScheduledRateSlot {
  id: string;
  network: 'BEP20' | 'ERC20' | 'TRC20';
  type: 'buy' | 'sell';
  rate: number;           // exact INR rate during the window
  startAt: string;        // ISO UTC datetime
  durationMinutes: number;
  auto?: boolean;         // true = created by the auto-schedule system
}

export interface ScheduledRateSettings {
  enabled: boolean;
  slots: ScheduledRateSlot[];
}

export const DEFAULT_SCHEDULED_OVERRIDES: ScheduledRateSettings = {
  enabled: false,
  slots: [],
};

export async function getScheduledRateSettings(): Promise<ScheduledRateSettings> {
  const doc = await SiteSetting.findOne({ key: 'scheduledRateOverrides' }).lean();
  return (doc?.value as ScheduledRateSettings) ?? DEFAULT_SCHEDULED_OVERRIDES;
}

export function getActiveOverride(
  settings: ScheduledRateSettings,
  network: string,
  type: 'buy' | 'sell',
): ScheduledRateSlot | null {
  if (!settings.enabled) return null;
  const now = Date.now();
  for (const slot of settings.slots) {
    if (slot.network !== network || slot.type !== type) continue;
    const start = new Date(slot.startAt).getTime();
    const end   = start + slot.durationMinutes * 60_000;
    if (now >= start && now < end) return slot;
  }
  return null;
}

/* ── Auto Schedule Config ── */
export interface AutoScheduleNetworkEntry {
  enabled: boolean;
  includeBuy: boolean;
  includeSell: boolean;
}

export interface AutoScheduleConfig {
  enabled: boolean;
  minSlotsPerDay: number;    // random count is drawn from [minSlotsPerDay, maxSlotsPerDay]
  maxSlotsPerDay: number;
  windowStartHour: number;   // 0-23, local server time; cross-midnight supported (end < start)
  windowEndHour: number;     // 0-23, local server time
  minRate: number;
  maxRate: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  networks: {
    BEP20: AutoScheduleNetworkEntry;
    ERC20: AutoScheduleNetworkEntry;
    TRC20: AutoScheduleNetworkEntry;
  };
  lastGeneratedDate: string | null; // 'YYYY-MM-DD' of last run
}

export const DEFAULT_AUTO_SCHEDULE: AutoScheduleConfig = {
  enabled: false,
  minSlotsPerDay: 3,
  maxSlotsPerDay: 7,
  windowStartHour: 10,
  windowEndHour: 22,
  minRate: 110,
  maxRate: 115,
  minDurationMinutes: 5,
  maxDurationMinutes: 15,
  networks: {
    BEP20: { enabled: true,  includeBuy: false, includeSell: true },
    ERC20: { enabled: false, includeBuy: false, includeSell: true },
    TRC20: { enabled: false, includeBuy: false, includeSell: true },
  },
  lastGeneratedDate: null,
};

export async function getAutoScheduleConfig(): Promise<AutoScheduleConfig> {
  const doc = await SiteSetting.findOne({ key: 'autoScheduleConfig' }).lean();
  // Cast with legacy slotsPerDay for graceful migration
  const saved = (doc?.value ?? {}) as Partial<AutoScheduleConfig> & { slotsPerDay?: number };
  // Migrate old single slotsPerDay field to min/max range
  const legacyCount = saved.slotsPerDay;
  return {
    ...DEFAULT_AUTO_SCHEDULE,
    ...saved,
    minSlotsPerDay: saved.minSlotsPerDay ?? legacyCount ?? DEFAULT_AUTO_SCHEDULE.minSlotsPerDay,
    maxSlotsPerDay: saved.maxSlotsPerDay ?? legacyCount ?? DEFAULT_AUTO_SCHEDULE.maxSlotsPerDay,
    networks: {
      BEP20: { ...DEFAULT_AUTO_SCHEDULE.networks.BEP20, ...(saved.networks?.BEP20 ?? {}) },
      ERC20: { ...DEFAULT_AUTO_SCHEDULE.networks.ERC20, ...(saved.networks?.ERC20 ?? {}) },
      TRC20: { ...DEFAULT_AUTO_SCHEDULE.networks.TRC20, ...(saved.networks?.TRC20 ?? {}) },
    },
  };
}
