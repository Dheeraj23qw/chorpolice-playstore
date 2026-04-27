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
      state.coins += 100000;
      state.firstLaunch = false;
    },

    resetWallet: () => initialState,
  },
});

export const {
  updateCoins,
  setCoins,
  setFirstLaunch,
  claimFirstLaunchBonus,
  resetWallet,
} = walletSlice.actions;
export default walletSlice.reducer;
