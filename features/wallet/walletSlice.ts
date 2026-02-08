// walletSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WalletState, Transaction, WalletSource } from "./walletTypes";

const MAX_TRANSACTIONS = 100;

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

type CoinPayload = {
  amount: number;
  reason: string;
  source?: WalletSource;
  metadata?: Record<string, any>;
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWallet: (_, action: PayloadAction<WalletState>) => action.payload,

    markInitialized: (state) => {
      state.initialized = true;
    },

    applyTransaction: (state, action: PayloadAction<CoinPayload>) => {
      const { amount, reason, source = "other", metadata } =
        action.payload;

      if (amount === 0) return;

      const timestamp = Date.now();

      state.coins += amount;

      const transaction: Transaction = {
        id: timestamp.toString(),
        type: amount >= 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(amount),
        reason,
        source,
        metadata,
        timestamp,
      };

      state.transactions.unshift(transaction);

      if (state.transactions.length > MAX_TRANSACTIONS) {
        state.transactions.pop();
      }

      if (!state.totalBySource[source]) {
        state.totalBySource[source] = 0;
      }

      state.totalBySource[source] += amount;
    },

    claimSpinReward: (
      state,
      action: PayloadAction<{ amount: number; reason: string }>
    ) => {
      const { amount, reason } = action.payload;

      if (amount === 0) return;

      const timestamp = Date.now();

      state.coins += amount;

      state.transactions.unshift({
        id: timestamp.toString(),
        type: amount >= 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(amount),
        reason,
        source: "spin_reward",
        timestamp,
      });

      if (state.transactions.length > MAX_TRANSACTIONS) {
        state.transactions.pop();
      }

      state.totalBySource.spin_reward += amount;

      state.locks.spin.lastUsedTimestamp = timestamp;
    },

    resetWallet: () => {
      return { ...initialState };
    },
  },
});

export const {
  setWallet,
  markInitialized,
  applyTransaction,
  claimSpinReward,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
