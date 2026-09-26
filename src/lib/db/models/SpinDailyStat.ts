import { Schema, model, models, type Model } from 'mongoose';

/**
 * One row per IST calendar day — how many spins ran and how much prize value
 * was WON (a liability the moment it is won, whether or not it is claimed yet).
 * The prize engine reads this to pace payouts against the daily budget.
 */
export interface SpinDailyStatAttrs {
  dateKey:  string;   // 'YYYY-MM-DD' in IST
  spins:    number;
  paidUsdt: number;
}

const SpinDailyStatSchema = new Schema<SpinDailyStatAttrs>(
  {
    dateKey:  { type: String, required: true, unique: true, index: true },
    spins:    { type: Number, default: 0, min: 0 },
    paidUsdt: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const SpinDailyStat: Model<SpinDailyStatAttrs> =
  (models.SpinDailyStat as Model<SpinDailyStatAttrs>) || model<SpinDailyStatAttrs>('SpinDailyStat', SpinDailyStatSchema);
