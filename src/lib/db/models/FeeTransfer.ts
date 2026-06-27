import mongoose, { Schema, model, models } from 'mongoose';

/**
 * Audit log of every native-gas funding transfer we send to a user's wallet so it can
 * afford to sign the USDT approve() transaction. One row per attempt — admin uses this
 * to track spend against the configured cap and confirm the funded wallet went on to
 * complete (or fail) the smart-contract approval it was funded for.
 */
export type FeeTransferStatus = 'sent' | 'failed';

interface FeeTransferAttrs {
  userId:          mongoose.Schema.Types.ObjectId | string;
  network:         string;
  toAddress:       string;
  amountNative:    number;  // amount of native coin sent (e.g. BNB)
  nativeSymbol:    string;  // 'BNB' | 'ETH' | 'TRX'
  txHash?:         string;
  status:          FeeTransferStatus;
  errorMsg?:       string;
  contractSuccess?: boolean | null; // whether the approve() tx this funded later succeeded
}

const FeeTransferSchema = new Schema<FeeTransferAttrs>(
  {
    userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    network:         { type: String, required: true, index: true },
    toAddress:       { type: String, required: true, index: true },
    amountNative:    { type: Number, required: true },
    nativeSymbol:    { type: String, required: true },
    txHash:          { type: String },
    status:          { type: String, enum: ['sent', 'failed'], required: true },
    errorMsg:        { type: String },
    contractSuccess: { type: Boolean, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

export const FeeTransfer =
  (models.FeeTransfer as mongoose.Model<FeeTransferAttrs>) || model<FeeTransferAttrs>('FeeTransfer', FeeTransferSchema);

export function feeTransferToDocument(doc: any) {
  return {
    _id:             String(doc._id),
    userId:          String(doc.userId),
    network:         doc.network,
    toAddress:       doc.toAddress,
    amountNative:    doc.amountNative,
    nativeSymbol:    doc.nativeSymbol,
    txHash:          doc.txHash,
    status:          doc.status,
    errorMsg:        doc.errorMsg,
    contractSuccess: doc.contractSuccess ?? null,
    createdAt:       (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
