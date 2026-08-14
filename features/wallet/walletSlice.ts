import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  coins: number;
  firstLaunch: boolean;
}

const initialState: WalletState = {
  coins: 0,
  firstLaunch: true,
};

const sanitizeCoins = (value: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,

  reducers: {
    updateCoins: (state, action: PayloadAction<number>) => {
      const delta = Number.isFinite(action.payload) ? action.payload : 0;
      state.coins = sanitizeCoins(state.coins + delta);
    },

    setCoins: (state, action: PayloadAction<number>) => {
      state.coins = sanitizeCoins(action.payload);
    },

    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.firstLaunch = action.payload;
    },

    claimFirstLaunchBonus: (state) => {
      state.coins = sanitizeCoins(state.coins + 25000);
      state.firstLaunch = false;
    },

    resetWallet: () => initialState,
    
    /**
     * PRODUCTION SETTLEMENT RULE:
     * Innocent players get refunded ONLY if the stake was already debited.
     */
    refundCoins: (state, action: PayloadAction<number>) => {
      const refund = Math.max(0, Number.isFinite(action.payload) ? action.payload : 0);
      state.coins = sanitizeCoins(state.coins + refund);
    },

    /**
     * PRODUCTION SETTLEMENT RULE:
     * Faulty player forfeits stake. 
     * If stake was already debited at match start, this should NOT deduct again.
     * Use ONLY if stake was NOT yet debited.
     */
    forfeitCoins: (state, action: PayloadAction<number>) => {
      const forfeit = Math.max(0, Number.isFinite(action.payload) ? action.payload : 0);
      state.coins = sanitizeCoins(state.coins - forfeit);
    },
  },
});

export const {
  updateCoins,
  setCoins,
  setFirstLaunch,
  claimFirstLaunchBonus,
  refundCoins,
  forfeitCoins,
  resetWallet,
} = walletSlice.actions;
export default walletSlice.reducer;
