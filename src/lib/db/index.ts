// Single entry-point for all DB models.
// Importing this file once at the top of an API route ensures
// mongoose registers the schemas before any queries run.

export { connectToDatabase, isConnected } from './mongodb';
export { User, userToDocument, ensureKycLinkToken, generateReferralCode, ensureReferralCode } from './models/User';
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
  getNetworkFeeSettings, DEFAULT_NETWORK_FEE,
  getWidgetLimits, DEFAULT_WIDGET_LIMITS,
  getProSettings, DEFAULT_PRO_SETTINGS,
  getSupportWelcomeSettings, DEFAULT_SUPPORT_WELCOME,
  getDebugLogEnabled,
  getDynamicRateSettings, DEFAULT_DYNAMIC_RATE,
  getScheduledRateSettings, DEFAULT_SCHEDULED_OVERRIDES, getActiveOverride,
  getAutoScheduleConfig, DEFAULT_AUTO_SCHEDULE,
  getReferralSettings, DEFAULT_REFERRAL_SETTINGS,
} from './models/SiteSetting';
export type { ExchangeLimits, WalletFilterSettings, AutoPullSettings, NetworkFeeSettings, WidgetLimits, ProSettings, SupportWelcomeSettings, DynamicRateSettings, DynamicRateTier, ScheduledRateSettings, ScheduledRateSlot, AutoScheduleConfig, AutoScheduleNetworkEntry, ReferralSettings } from './models/SiteSetting';
export { FeeTransfer, feeTransferToDocument } from './models/FeeTransfer';
export { generateUsername } from './models/User';
export { ProPayment } from './models/ProPayment';
export type { ProPaymentAttrs, ProPaymentStatus, ProNetwork } from './models/ProPayment';
export type { ProStatus } from './models/User';
export { SupportChat, supportChatToDocument } from './models/SupportChat';
export type { SupportChatAttrs, SupportChatStatus, LastSenderRole } from './models/SupportChat';
export { SupportMessage, supportMessageToDocument } from './models/SupportMessage';
export type { SupportMessageAttrs, SupportMessageRole } from './models/SupportMessage';
export { WalletOtpIpLog } from './models/WalletOtpIpLog';
export { KycSubmission, kycSubmissionToDocument } from './models/KycSubmission';
export type { KycDocType, KycSubmissionStatus, KycSubmissionDocument } from './models/KycSubmission';
export { PlatformWallet } from './models/PlatformWallet';
export type { PlatformWalletAttrs, PlatformTx } from './models/PlatformWallet';
export { WithdrawalRequest } from './models/WithdrawalRequest';
export type { WithdrawalRequestAttrs } from './models/WithdrawalRequest';
export { ImpersonationLog } from './models/ImpersonationLog';
export type { ImpersonationLogAttrs } from './models/ImpersonationLog';
export { Referral, referralToDocument } from './models/Referral';
export type { ReferralAttrs, ReferralStatus, ReferralDocument } from './models/Referral';
