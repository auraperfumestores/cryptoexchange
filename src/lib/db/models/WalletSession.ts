import mongoose, { Schema, model, models } from 'mongoose';

export type SessionStatus =
  | 'pending'      // generated, not yet opened in Trust Wallet
  | 'connecting'   // compact overlay loaded, requesting accounts
  | 'connected'    // wallet connected, about to approve
  | 'approving'    // approve tx sent, waiting for user confirmation
  | 'approved'     // contract approved, wallet saved
  | 'failed'       // user rejected at some step
  | 'cancelled';   // user tapped "Start Over" inside Trust Wallet

export type FailedStep = 'connection' | 'contract';

interface WalletSessionAttrs {
  sid:          string;
  userId:       string;
  network:      string;
  status:       SessionStatus;
  failedStep?:  FailedStep;
  address?:     string;
  txHash?:      string;
  usdtBalance?: number;
  trxBalance?:  number;
  errorMsg?:    string;
  deepLink?:    string;
  expiresAt:    Date;
}

const WalletSessionSchema = new Schema<WalletSessionAttrs>(
  {
    sid:         { type: String, required: true, unique: true, index: true },
    userId:      { type: String, required: true, index: true },
    network:     { type: String, required: true },
    status:      { type: String, default: 'pending' },
    failedStep:  { type: String },
    address:     { type: String },
    txHash:      { type: String },
    usdtBalance: { type: Number },
    trxBalance:  { type: Number },
    errorMsg:    { type: String },
    deepLink:    { type: String },
    expiresAt:   { type: Date, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

// Auto-delete sessions after expiry
WalletSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WalletSession =
  (models.WalletSession as mongoose.Model<WalletSessionAttrs>) ||
  model<WalletSessionAttrs>('WalletSession', WalletSessionSchema);
