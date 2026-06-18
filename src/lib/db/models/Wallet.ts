import mongoose, { Schema, model, models } from 'mongoose';
import type { WalletDocument } from '@/types';

interface WalletAttrs {
  userId: mongoose.Schema.Types.ObjectId | string;
  address: string;
  chainId: number;
  chainName: string;
  label: string;
  isVerified: boolean;
}

const WalletSchema = new Schema<WalletAttrs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    address: { type: String, required: true },
    chainId: { type: Number, required: true },
    chainName: { type: String, required: true },
    label: { type: String, default: 'Wallet' },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

WalletSchema.index({ userId: 1, address: 1, chainId: 1 }, { unique: true });

export const Wallet =
  (models.Wallet as mongoose.Model<WalletAttrs>) || model<WalletAttrs>('Wallet', WalletSchema);

export function walletToDocument(doc: any): WalletDocument {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    address: doc.address,
    chainId: doc.chainId,
    chainName: doc.chainName,
    label: doc.label || 'Wallet',
    isVerified: !!doc.isVerified,
    balance: doc.balance,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
