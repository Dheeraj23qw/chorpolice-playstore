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
    rewards_claim: 0,
  },
  locks: {
    spin: { lastUsedTimestamp: null, countToday: 0 },
    daily_bonus: { lastUsedTimestamp: null, countToday: 0 },
    rate_us: { hasRated: false, lastPrompted: null },
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
      }>,
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
      }>,
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

  claimSpinReward: (
  state,
  action: PayloadAction<{ amount: number; reason: string }>
) => {
  const { amount, reason } = action.payload;
  const timestamp = Date.now();

  if (amount === 0) return;

  // Allow negative balance
  state.coins += amount;

  state.transactions.unshift({
    id: timestamp.toString(),
    type: amount >= 0 ? "CREDIT" : "DEBIT",
    amount: Math.abs(amount),
    reason,
    source: "spin_reward",
    timestamp,
  });

  // Track net spin earnings (can go negative)
  state.totalBySource.spin_reward += amount;

  // Lock spin cooldown
  state.locks.spin.lastUsedTimestamp = timestamp;

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
  claimSpinReward
} = walletSlice.actions;

export default walletSlice.reducer;
