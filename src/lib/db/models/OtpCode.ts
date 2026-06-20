import mongoose, { Schema, model, models, type Model } from 'mongoose';
import crypto from 'crypto';

export interface OtpCodeAttrs {
  phone:     string;          /* 10-digit Indian mobile */
  codeHash:  string;          /* SHA-256 of the 6-digit OTP */
  purpose:   string;          /* 'phone-verify' | 'login' | etc. */
  attempts:  number;
  expiresAt: Date;
  verified:  boolean;
}

const OtpCodeSchema = new Schema<OtpCodeAttrs>({
  phone:     { type: String, required: true, index: true },
  codeHash:  { type: String, required: true },
  purpose:   { type: String, default: 'phone-verify' },
  attempts:  { type: Number, default: 0 },
  expiresAt: { type: Date,   required: true },
  verified:  { type: Boolean, default: false },
}, { timestamps: true });

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpCode: Model<OtpCodeAttrs> =
  (models.OtpCode as Model<OtpCodeAttrs>) ||
  model<OtpCodeAttrs>('OtpCode', OtpCodeSchema);

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
