import { create } from 'zustand';
import type { TradeFormState } from '@/types';

interface TradeStore {
  form: TradeFormState;
  setForm: (update: Partial<TradeFormState>) => void;
  resetForm: () => void;
}

const initialForm: TradeFormState = {
  type: 'sell',
  cryptoSymbol: 'USDT',
  network: 'ERC20',
  cryptoAmount: '',
};

export const useTradeStore = create<TradeStore>((set) => ({
  form: initialForm,
  setForm: (update) =>
    set((state) => ({
      form: { ...state.form, ...update },
    })),
  resetForm: () => set({ form: initialForm }),
}));