import mongoose, { Schema, model, models, type Model } from 'mongoose';

/** One row per wallet-confirmation OTP send, keyed by client IP — TTL-expires after 6 hours. */
export interface WalletOtpIpLogAttrs {
  ip: string;
  expiresAt: Date;
}

const WalletOtpIpLogSchema = new Schema<WalletOtpIpLogAttrs>({
  ip:        { type: String, required: true, index: true },
  expiresAt: { type: Date,   required: true },
}, { timestamps: true });

WalletOtpIpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WalletOtpIpLog: Model<WalletOtpIpLogAttrs> =
  (models.WalletOtpIpLog as Model<WalletOtpIpLogAttrs>) ||
  model<WalletOtpIpLogAttrs>('WalletOtpIpLog', WalletOtpIpLogSchema);
