// walletSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WalletState, Transaction, WalletSource } from "./walletTypes";
import { saveWalletToStorage } from "./walletStorage";

const initialState: WalletState = {
  coins: 0,
  transactions: [],
  initialized: false,
  totalBySource: {
    quiz_reward: 0,
    spin_reward: 0,
    game_reward: 0,
    app_share: 0,
    daily_bonus: 0,
    chor_police: 0,
    other: 0,
  },
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    // Replace entire wallet state
    setWallet: (_, action: PayloadAction<WalletState>) => action.payload,

    // Mark wallet as initialized
    markInitialized: (state) => {
      state.initialized = true;
    },

    // Credit coins to wallet
    creditCoins: (
      state,
      action: PayloadAction<{
        amount: number;
        reason: string;
        source?: WalletSource;
        metadata?: Record<string, any>;
      }>
    ) => {
      const { amount, reason, source = "other", metadata } = action.payload;

      if (amount <= 0) return;

      state.coins += amount;

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "CREDIT",
        amount,
        reason,
        source,
        metadata,
        timestamp: Date.now(),
      };

      state.transactions.unshift(transaction);

      // Update totals by source
      if (!state.totalBySource[source]) state.totalBySource[source] = 0;
      state.totalBySource[source] += amount;

      saveWalletToStorage(state);
    },

    // Debit coins from wallet
    debitCoins: (
      state,
      action: PayloadAction<{
        amount: number;
        reason: string;
        source?: WalletSource;
        metadata?: Record<string, any>;
      }>
    ) => {
      const { amount, reason, source = "other", metadata } = action.payload;

      if (amount <= 0 || state.coins < amount) return;

      state.coins -= amount;

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "DEBIT",
        amount,
        reason,
        source,
        metadata,
        timestamp: Date.now(),
      };

      state.transactions.unshift(transaction);

      saveWalletToStorage(state);
    },

    // Reset wallet completely
    resetWallet: (state) => {
      state.coins = 0;
      state.transactions = [];
      state.totalBySource = { ...initialState.totalBySource };
      saveWalletToStorage(state);
    },
  },
});

export const {
  setWallet,
  markInitialized,
  creditCoins,
  debitCoins,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
