import mongoose, { Schema, model, models } from 'mongoose';
import type {
  TransactionDocument,
  TransactionType,
  TransactionStatus,
  CryptoSymbol,
  Network,
  PaymentMethodType,
  FeeBreakdown,
} from '@/types';

interface TransactionAttrs {
  orderId: string;
  userId: mongoose.Schema.Types.ObjectId | string;
  userName: string;
  userEmail: string;
  type: TransactionType;
  cryptoSymbol: CryptoSymbol;
  network: Network;
  cryptoAmount: number;
  inrAmount: number;
  rate: number;
  fee: number;
  feeBreakdown: FeeBreakdown;
  status: TransactionStatus;
  walletAddress: string;
  depositAddress: string;
  txHash?: string;
  verificationTxHash?: string;
  paymentMethodId?: string;
  paymentMethodType?: PaymentMethodType;
  paymentProofUrl?: string;
  adminNotes?: string;
  clientNotes?: string;
  completedAt?: Date;
}

const FeeBreakdownSchema = new Schema<FeeBreakdown>(
  {
    platformFee: { type: Number, required: true, default: 0 },
    networkFee: { type: Number, required: true, default: 0 },
    gasEstimate: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const TransactionSchema = new Schema<TransactionAttrs>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true, index: true },
    cryptoSymbol: { type: String, enum: ['USDT', 'BNB'], required: true },
    network: { type: String, enum: ['ERC20', 'BEP20', 'TRC20'], required: true },
    cryptoAmount: { type: Number, required: true, min: 0 },
    inrAmount: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    fee: { type: Number, required: true, min: 0 },
    feeBreakdown: { type: FeeBreakdownSchema, required: true, default: () => ({}) },
    status: {
      type: String,
      enum: [
        'awaiting_crypto',
        'awaiting_payment',
        'confirming',
        'completed',
        'cancelled',
        'disputed',
      ],
      required: true,
      default: 'awaiting_crypto',
      index: true,
    },
    walletAddress: { type: String, required: true },
    depositAddress: { type: String, required: true },
    txHash: { type: String, default: null },
    verificationTxHash: { type: String, default: null },
    paymentMethodId: { type: Schema.Types.ObjectId, ref: 'PaymentMethod', default: null },
    paymentMethodType: { type: String, enum: ['upi', 'bank_transfer', 'cash'], default: null },
    paymentProofUrl: { type: String, default: null },
    adminNotes: { type: String, default: '' },
    clientNotes: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction =
  (models.Transaction as mongoose.Model<TransactionAttrs>) ||
  model<TransactionAttrs>('Transaction', TransactionSchema);

export function transactionToDocument(doc: any): TransactionDocument {
  return {
    _id: String(doc._id),
    orderId: doc.orderId,
    userId: String(doc.userId),
    userName: doc.userName,
    userEmail: doc.userEmail,
    type: doc.type,
    cryptoSymbol: doc.cryptoSymbol,
    network: doc.network,
    cryptoAmount: doc.cryptoAmount,
    inrAmount: doc.inrAmount,
    rate: doc.rate,
    fee: doc.fee,
    feeBreakdown: {
      platformFee: doc.feeBreakdown?.platformFee || 0,
      networkFee: doc.feeBreakdown?.networkFee || 0,
      gasEstimate: doc.feeBreakdown?.gasEstimate || 0,
    },
    status: doc.status,
    walletAddress: doc.walletAddress,
    depositAddress: doc.depositAddress,
    txHash: doc.txHash || undefined,
    verificationTxHash: doc.verificationTxHash || undefined,
    paymentMethodId: doc.paymentMethodId ? String(doc.paymentMethodId) : undefined,
    paymentMethodType: doc.paymentMethodType || undefined,
    paymentProofUrl: doc.paymentProofUrl || undefined,
    adminNotes: doc.adminNotes,
    clientNotes: doc.clientNotes,
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
    updatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
    completedAt: doc.completedAt ? new Date(doc.completedAt).toISOString() : undefined,
  };
}
