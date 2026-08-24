import mongoose, { Schema, model, models, type Model } from 'mongoose';

export type ReferralStatus = 'pending' | 'rewarded' | 'void';

export interface ReferralAttrs {
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  referralCode: string;
  status: ReferralStatus;
  rewardedAt?: Date;
  referrerRewardUsdt?: number;
  refereeRewardUsdt?: number;
  voidReason?: string;
  /** Independent per side — each party dismisses their own reward banner. */
  referrerBannerSeen: boolean;
  refereeBannerSeen: boolean;
}

const ReferralSchema = new Schema<ReferralAttrs>(
  {
    referrerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // A user can only ever be referred once — enforced at the DB level.
    refereeId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    referralCode: { type: String, required: true },
    status:       { type: String, enum: ['pending', 'rewarded', 'void'], default: 'pending', index: true },
    rewardedAt:   { type: Date },
    referrerRewardUsdt: { type: Number },
    refereeRewardUsdt:  { type: Number },
    voidReason:   { type: String },
    referrerBannerSeen: { type: Boolean, default: false },
    refereeBannerSeen:  { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Referral: Model<ReferralAttrs> =
  (models.Referral as Model<ReferralAttrs>) || model<ReferralAttrs>('Referral', ReferralSchema);

export interface ReferralDocument {
  _id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: ReferralStatus;
  rewardedAt?: string;
  referrerRewardUsdt?: number;
  refereeRewardUsdt?: number;
  voidReason?: string;
  createdAt: string;
}

export function referralToDocument(doc: any): ReferralDocument {
  return {
    _id: String(doc._id),
    referrerId: String(doc.referrerId),
    refereeId: String(doc.refereeId),
    referralCode: doc.referralCode,
    status: doc.status,
    rewardedAt: doc.rewardedAt ? new Date(doc.rewardedAt).toISOString() : undefined,
    referrerRewardUsdt: doc.referrerRewardUsdt,
    refereeRewardUsdt: doc.refereeRewardUsdt,
    voidReason: doc.voidReason,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
