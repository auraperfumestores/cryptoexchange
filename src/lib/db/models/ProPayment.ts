import mongoose, { Schema, model, models } from 'mongoose';

export type ProPaymentStatus = 'pending' | 'awaiting_phone' | 'confirmed' | 'expired' | 'failed';
export type ProNetwork = 'BEP20' | 'ERC20' | 'TRC20';

export interface ProPaymentAttrs {
  userId:         string;
  network:        ProNetwork;
  fromAddress:    string;   // sender address — unknown until the matching transfer is detected on-chain
  depositAddress: string;   // treasury address they must send to
  amountUsdt:     number;   // unique decorated amount (e.g. 6.037) used to identify this payment on a shared treasury address
  txHash:         string | null;
  status:         ProPaymentStatus;
  confirmedAt:    Date | null;
  expiresAt:      Date;
}

const ProPaymentSchema = new Schema<ProPaymentAttrs>(
  {
    userId:         { type: String, required: true, index: true },
    network:        { type: String, enum: ['BEP20', 'ERC20', 'TRC20'], required: true },
    fromAddress:    { type: String, default: '' },
    depositAddress: { type: String, required: true },
    amountUsdt:     { type: Number, required: true },
    txHash:         { type: String, default: null },
    status:         { type: String, enum: ['pending', 'awaiting_phone', 'confirmed', 'expired', 'failed'], default: 'pending', index: true },
    confirmedAt:    { type: Date,   default: null },
    expiresAt:      { type: Date,   required: true },
  },
  { timestamps: true },
);

export const ProPayment =
  (models.ProPayment as mongoose.Model<ProPaymentAttrs>) ||
  model<ProPaymentAttrs>('ProPayment', ProPaymentSchema);
