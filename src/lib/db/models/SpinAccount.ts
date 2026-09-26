import mongoose, { Schema, model, models, type Model } from 'mongoose';

/**
 * Spin & Win account — deliberately separate from PlatformWallet.
 *
 * `balance` is USDT won on the wheel. It never mixes with the platform wallet;
 * it can only leave via the dedicated spin-withdrawal flow.
 * `spins` is the number of spins the user has left to play.
 */
export interface SpinTx {
  _id?:      string;
  type:      'credit' | 'debit';
  amount:    number;
  note:      string;
  createdAt: Date;
}

export interface SpinAccountAttrs {
  userId:       mongoose.Types.ObjectId;
  balance:      number;
  spins:        number;
  transactions: SpinTx[];
  /** True once any qualifying deposit has earned spins — moves the user to the deposit tier. */
  hasDeposited:       boolean;
  /** Running total of qualifying deposits, for admin visibility. */
  depositedUsdt:      number;
  /** Signup spins are granted exactly once, at KYC approval. */
  signupSpinsGranted: boolean;
}

const SpinTxSchema = new Schema<SpinTx>(
  {
    type:      { type: String, enum: ['credit', 'debit'], required: true },
    amount:    { type: Number, required: true, min: 0 },
    note:      { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const SpinAccountSchema = new Schema<SpinAccountAttrs>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance:      { type: Number, default: 0, min: 0 },
    spins:        { type: Number, default: 0, min: 0 },
    transactions: { type: [SpinTxSchema], default: [] },
    hasDeposited:       { type: Boolean, default: false },
    depositedUsdt:      { type: Number,  default: 0, min: 0 },
    signupSpinsGranted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SpinAccount: Model<SpinAccountAttrs> =
  (models.SpinAccount as Model<SpinAccountAttrs>) || model<SpinAccountAttrs>('SpinAccount', SpinAccountSchema);
