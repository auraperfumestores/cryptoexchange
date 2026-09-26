import mongoose, { Schema, model, models, type Model } from 'mongoose';

/** One row per spin — an audit trail of every outcome and whether it was credited. */
export interface SpinResultAttrs {
  userId:       mongoose.Types.ObjectId;
  prizeUsdt:    number;   // 0 = nothing
  segmentIndex: number;   // index into SPIN_PRIZES the wheel landed on
  credited:     boolean;  // true once the platform-wallet credit has been applied
}

const SpinResultSchema = new Schema<SpinResultAttrs>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prizeUsdt:    { type: Number, required: true, min: 0 },
    segmentIndex: { type: Number, required: true, min: 0 },
    credited:     { type: Boolean, default: false },
  },
  { timestamps: true },
);
SpinResultSchema.index({ userId: 1, createdAt: -1 });

export const SpinResult: Model<SpinResultAttrs> =
  (models.SpinResult as Model<SpinResultAttrs>) || model<SpinResultAttrs>('SpinResult', SpinResultSchema);
