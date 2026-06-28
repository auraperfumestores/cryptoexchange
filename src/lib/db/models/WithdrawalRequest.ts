import mongoose, { Schema, model, models, type Model } from 'mongoose';

export interface WithdrawalRequestAttrs {
  userId: mongoose.Types.ObjectId;
  amount: number;
  network: 'ERC20' | 'BEP20' | 'TRC20';
  chainId: number;
  toAddress: string;
  networkFee: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  txHash?: string;
  explorerUrl?: string;
  adminNotes?: string;
  rejectionReason?: string;
  refunded?: boolean;
  processedBy?: mongoose.Types.ObjectId;
  processedByName?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const WithdrawalRequestSchema = new Schema<WithdrawalRequestAttrs>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount:          { type: Number, required: true, min: 0 },
    network:         { type: String, enum: ['ERC20', 'BEP20', 'TRC20'], required: true },
    chainId:         { type: Number, required: true },
    toAddress:       { type: String, required: true },
    networkFee:      { type: Number, required: true, default: 0 },
    status:          { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending', index: true },
    txHash:          { type: String },
    explorerUrl:     { type: String },
    adminNotes:      { type: String, default: '' },
    rejectionReason: { type: String },
    refunded:         { type: Boolean },
    processedBy:      { type: Schema.Types.ObjectId, ref: 'User' },
    processedByName:  { type: String },
    processedAt:      { type: Date },
  },
  { timestamps: true },
);

export const WithdrawalRequest: Model<WithdrawalRequestAttrs> =
  (models.WithdrawalRequest as Model<WithdrawalRequestAttrs>) ||
  model<WithdrawalRequestAttrs>('WithdrawalRequest', WithdrawalRequestSchema);
