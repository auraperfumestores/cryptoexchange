import mongoose, { Schema, model, models } from 'mongoose';
import type { RateDocument, RateChange, CryptoSymbol, Network, SpreadType } from '@/types';

interface RateAttrs {
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
}

const RateChangeSchema = new Schema<RateChange>(
  {
    previousBuy: { type: Number, required: true },
    previousSell: { type: Number, required: true },
    newBuy: { type: Number, required: true },
    newSell: { type: Number, required: true },
    changedBy: { type: String, required: true },
    changedByName: { type: String, required: true },
    changedAt: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false },
);

const RateSchema = new Schema<RateAttrs>(
  {
    symbol: { type: String, enum: ['USDT', 'BNB'], required: true },
    network: { type: String, enum: ['ERC20', 'BEP20', 'TRC20'], required: true },
    buyRate: { type: Number, required: true, min: 0 },
    sellRate: { type: Number, required: true, min: 0 },
    spread: { type: Number, required: true, default: 0 },
    spreadType: { type: String, enum: ['fixed', 'percentage'], default: 'percentage' },
    useCoinGecko: { type: Boolean, default: false },
    coinGeckoId: { type: String, default: null },
    basePrice: { type: Number, default: null },
    baseSpread: { type: Number, default: 0 },
    depositAddress: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    changeLog: { type: [RateChangeSchema], default: [] },
    lastUpdatedBy: { type: String, required: true },
  },
  { timestamps: true },
);

RateSchema.index({ symbol: 1, network: 1 }, { unique: true });

export const Rate =
  (models.Rate as mongoose.Model<RateAttrs>) || model<RateAttrs>('Rate', RateSchema);

export function rateToDocument(doc: any): RateDocument {
  return {
    _id: String(doc._id),
    symbol: doc.symbol,
    network: doc.network,
    buyRate: doc.buyRate,
    sellRate: doc.sellRate,
    spread: doc.spread,
    spreadType: doc.spreadType || 'percentage',
    useCoinGecko: !!doc.useCoinGecko,
    coinGeckoId: doc.coinGeckoId,
    basePrice: doc.basePrice,
    baseSpread: doc.baseSpread,
    depositAddress: doc.depositAddress,
    isActive: !!doc.isActive,
    changeLog: (doc.changeLog || []).map((c: any) => ({
      previousBuy: c.previousBuy,
      previousSell: c.previousSell,
      newBuy: c.newBuy,
      newSell: c.newSell,
      changedBy: c.changedBy,
      changedByName: c.changedByName,
      changedAt: c.changedAt,
      reason: c.reason,
    })),
    lastUpdatedBy: String(doc.lastUpdatedBy),
    lastUpdatedAt: (doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt)).toISOString(),
    createdAt: (doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt)).toISOString(),
  };
}
