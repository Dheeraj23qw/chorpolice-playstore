import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WalletState {
  coins: number;
}

const initialState: WalletState = {
  coins: 0,
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

    resetWallet: () => initialState,
  },
});

export const { updateCoins, setCoins, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
