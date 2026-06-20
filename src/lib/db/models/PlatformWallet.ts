import mongoose, { Schema, model, models, type Model } from 'mongoose';

export interface PlatformTx {
  _id?: string;
  type: 'credit' | 'debit';
  amount: number;
  note: string;
  addedBy: 'admin' | 'system';
  createdAt: Date;
}

export interface PlatformWalletAttrs {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: PlatformTx[];
}

const TxSchema = new Schema<PlatformTx>({
  type:      { type: String, enum: ['credit', 'debit'], required: true },
  amount:    { type: Number, required: true, min: 0 },
  note:      { type: String, default: '' },
  addedBy:   { type: String, enum: ['admin', 'system'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const PlatformWalletSchema = new Schema<PlatformWalletAttrs>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  balance:      { type: Number, default: 0, min: 0 },
  transactions: { type: [TxSchema], default: [] },
}, { timestamps: true });

export const PlatformWallet: Model<PlatformWalletAttrs> =
  (models.PlatformWallet as Model<PlatformWalletAttrs>) ||
  model<PlatformWalletAttrs>('PlatformWallet', PlatformWalletSchema);
