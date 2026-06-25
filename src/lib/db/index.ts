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
export {
  SiteSetting,
  getExchangeLimits, DEFAULT_EXCHANGE_LIMITS,
  getWalletFilterSettings, DEFAULT_WALLET_FILTER,
  getAutoPullSettings, DEFAULT_AUTO_PULL,
  getWidgetLimits, DEFAULT_WIDGET_LIMITS,
  getProSettings, DEFAULT_PRO_SETTINGS,
} from './models/SiteSetting';
export type { ExchangeLimits, WalletFilterSettings, AutoPullSettings, WidgetLimits, ProSettings } from './models/SiteSetting';
export { generateUsername } from './models/User';
export { ProPayment } from './models/ProPayment';
export type { ProPaymentAttrs, ProPaymentStatus, ProNetwork } from './models/ProPayment';
export type { ProStatus } from './models/User';
export { SupportChat, supportChatToDocument } from './models/SupportChat';
export type { SupportChatAttrs, SupportChatStatus, LastSenderRole } from './models/SupportChat';
export { SupportMessage, supportMessageToDocument } from './models/SupportMessage';
export type { SupportMessageAttrs, SupportMessageRole } from './models/SupportMessage';
