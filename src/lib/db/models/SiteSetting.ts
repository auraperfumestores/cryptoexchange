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
