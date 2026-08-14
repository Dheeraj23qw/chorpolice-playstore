import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  coins: number;
  firstLaunch: boolean;
}

const initialState: WalletState = {
  coins: 0,
  firstLaunch: true,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,

  reducers: {
    updateCoins: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
    },

    setCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload;
    },

    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.firstLaunch = action.payload;
    },

    claimFirstLaunchBonus: (state) => {
      state.coins += 25000;
      state.firstLaunch = false;
    },

    resetWallet: () => initialState,
    
    /**
     * PRODUCTION SETTLEMENT RULE:
     * Innocent players get refunded ONLY if the stake was already debited.
     */
    refundCoins: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
    },

    /**
     * PRODUCTION SETTLEMENT RULE:
     * Faulty player forfeits stake. 
     * If stake was already debited at match start, this should NOT deduct again.
     * Use ONLY if stake was NOT yet debited.
     */
    forfeitCoins: (state, action: PayloadAction<number>) => {
      state.coins -= action.payload;
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
