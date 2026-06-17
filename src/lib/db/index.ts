// Single entry-point for all DB models.
// Importing this file once at the top of an API route ensures
// mongoose registers the schemas before any queries run.

export { connectToDatabase, isConnected } from './mongodb';
export { User, userToDocument } from './models/User';
export { Wallet, walletToDocument } from './models/Wallet';
export { Rate, rateToDocument } from './models/Rate';
export { Transaction, transactionToDocument } from './models/Transaction';
export { PaymentMethod, paymentMethodToDocument } from './models/PaymentMethod';
export { WalletSession } from './models/WalletSession';
export type { SessionStatus, FailedStep } from './models/WalletSession';
