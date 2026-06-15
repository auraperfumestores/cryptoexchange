// ============================================================
// Centralised type definitions
// ============================================================
// The file is split into two layers:
//   1. Domain types — canonical shapes used in business logic.
//   2. Display types — the shapes the client UI consumes (snake_case
//      `_id` for Mongo, ISO date strings, optional fields normalised).
// Keep both in sync; the API layer is the only place that maps
// one to the other.
// ============================================================

import type { Types } from 'mongoose';

// --- Domain (server) -------------------------------------------------

export type UserRole = 'client' | 'admin';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type CryptoSymbol = 'USDT' | 'BNB';
export type Network = 'ERC20' | 'BEP20' | 'TRC20';
export type ChainId = 1 | 56;
export type TransactionType = 'buy' | 'sell';

export type TransactionStatus =
  | 'awaiting_crypto'
  | 'awaiting_payment'
  | 'confirming'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentMethodType = 'upi' | 'bank_transfer' | 'cash';

export type SpreadType = 'fixed' | 'percentage';

// --- Mongoose document shapes ---------------------------------------

export interface UserDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  kycStatus: KycStatus;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RateChange {
  previousBuy: number;
  previousSell: number;
  newBuy: number;
  newSell: number;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  reason?: string;
}

export interface RateDocument {
  _id: string;
  symbol: CryptoSymbol;
  network: Network;
  buyRate: number;
  sellRate: number;
  spread: number;
  spreadType: SpreadType;
  useCoinGecko: boolean;
  coinGeckoId?: string;
  basePrice?: number;
  baseSpread?: number;
  depositAddress: string;
  isActive: boolean;
  changeLog: RateChange[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface UpiDetails {
  upiId: string;
  qrImageUrl?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
  branch?: string;
}

export interface CashDetails {
  location: string;
  meetingInstructions: string;
  contactNumber?: string;
}

export interface PaymentMethodDocument {
  _id: string;
  type: PaymentMethodType;
  label: string;
  isActive: boolean;
  displayOrder: number;
  details?: UpiDetails | BankDetails | CashDetails;
  // Flattened for convenience (populated by paymentMethodToDocument)
  upiId?: string;
  upiQrImageUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  branch?: string;
  location?: string;
  meetingInstructions?: string;
  contactNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeBreakdown {
  platformFee: number;
  networkFee: number;
  gasEstimate: number;
}

export interface TransactionDocument {
  _id: string;
  orderId: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WalletDocument {
  _id: string;
  userId: string;
  address: string;
  chainId: number;
  chainName: string;
  label: string;
  isVerified: boolean;
  balance?: string;
  createdAt: string;
}

// --- API response helpers -------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

// --- Client-facing display types ------------------------------------
// (re-exported for components; keep these aligned with the toDocument
// helpers in each model file.)

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface RateDisplay {
  _id: string;
  symbol: CryptoSymbol;
  network: Network;
  buyRate: number;
  sellRate: number;
  spread: number;
  spreadType: SpreadType;
  isActive: boolean;
  useCoinGecko: boolean;
  coinGeckoId?: string;
  basePrice?: number;
  baseSpread?: number;
  depositAddress: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface TransactionDisplay {
  _id: string;
  orderId: string;
  userId: string;
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
  paymentMethodId?: string;
  paymentMethodType?: PaymentMethodType;
  paymentProofUrl?: string;
  adminNotes?: string;
  clientNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WalletDisplay {
  _id: string;
  address: string;
  chainId: number;
  chainName: string;
  label?: string;
  isVerified: boolean;
  balance?: string;
}

export interface PaymentMethodDisplay {
  _id: string;
  type: PaymentMethodType;
  label: string;
  isActive: boolean;
  displayOrder: number;
  // UPI
  upiId?: string;
  upiQrImageUrl?: string;
  // Bank
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  branch?: string;
  // Cash
  location?: string;
  meetingInstructions?: string;
  contactNumber?: string;
}

export interface TradeFormState {
  type: TransactionType;
  cryptoSymbol: CryptoSymbol;
  network: Network;
  cryptoAmount: string;
  selectedWalletId?: string;
  selectedPaymentMethodId?: string;
  clientNotes?: string;
}

export interface CoinGeckoPrice {
  symbol: string;
  inr: number;
  lastUpdated: string;
}
