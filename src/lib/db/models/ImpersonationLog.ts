import mongoose, { Schema, model, models, type Model } from 'mongoose';

/**
 * Immutable audit trail of every admin impersonation session. Impersonation grants
 * an admin full sight of a customer's account — including KYC data, wallets, and
 * order history — so each start/stop is recorded for accountability and to satisfy
 * the "reasonable security safeguards" expectation under the DPDP Act, 2023.
 */
export interface ImpersonationLogAttrs {
  adminId:     mongoose.Types.ObjectId;
  adminName:   string;
  adminEmail:  string;
  targetId:    mongoose.Types.ObjectId;
  targetName:  string;
  targetEmail: string;
  action:      'start' | 'stop';
  ip?:         string;
  userAgent?:  string;
}

const ImpersonationLogSchema = new Schema<ImpersonationLogAttrs>(
  {
    adminId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminName:   { type: String, required: true },
    adminEmail:  { type: String, required: true },
    targetId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetName:  { type: String, required: true },
    targetEmail: { type: String, required: true },
    action:      { type: String, enum: ['start', 'stop'], required: true },
    ip:          { type: String },
    userAgent:   { type: String },
  },
  { timestamps: true },
);

export const ImpersonationLog: Model<ImpersonationLogAttrs> =
  (models.ImpersonationLog as Model<ImpersonationLogAttrs>) ||
  model<ImpersonationLogAttrs>('ImpersonationLog', ImpersonationLogSchema);
