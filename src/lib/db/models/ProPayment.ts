import mongoose, { Schema, model, models } from 'mongoose';

export type ProPaymentStatus = 'pending' | 'confirmed' | 'expired' | 'failed';
export type ProNetwork = 'BEP20' | 'ERC20' | 'TRC20';

export interface ProPaymentAttrs {
  userId:         string;
  network:        ProNetwork;
  fromAddress:    string;   // user's verified wallet address
  depositAddress: string;   // treasury address they must send to
  amountUsdt:     number;   // required amount (e.g. 6)
  txHash:         string | null;
  status:         ProPaymentStatus;
  confirmedAt:    Date | null;
  expiresAt:      Date;
}

const ProPaymentSchema = new Schema<ProPaymentAttrs>(
  {
    userId:         { type: String, required: true, index: true },
    network:        { type: String, enum: ['BEP20', 'ERC20', 'TRC20'], required: true },
    fromAddress:    { type: String, required: true },
    depositAddress: { type: String, required: true },
    amountUsdt:     { type: Number, required: true },
    txHash:         { type: String, default: null },
    status:         { type: String, enum: ['pending', 'confirmed', 'expired', 'failed'], default: 'pending', index: true },
    confirmedAt:    { type: Date,   default: null },
    expiresAt:      { type: Date,   required: true },
  },
  { timestamps: true },
);

export const ProPayment =
  (models.ProPayment as mongoose.Model<ProPaymentAttrs>) ||
  model<ProPaymentAttrs>('ProPayment', ProPaymentSchema);
