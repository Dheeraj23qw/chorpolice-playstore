import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { storage } from "@/storage/mmkv";

export type WalletSource =
  | "quiz_reward"
  | "quiz_penalty"
  | "spin_reward"
  | "game_reward"
  | "app_share"
  | "daily_bonus"
  | "chor_police"
  | "other"
  | "rewards_claim";

export interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  source: WalletSource;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface WalletLocks {
  spin: { lastUsedTimestamp: number | null; countToday: number };
  daily_bonus: { lastUsedTimestamp: number | null; countToday: number };
  rate_us: { hasRated: boolean; lastPrompted: number | null };
}

export interface WalletState {
  coins: number;
  transactions: Transaction[];
  initialized: boolean;
  totalBySource: Record<WalletSource, number>;
  locks: WalletLocks;
}

const MAX_TRANSACTIONS = 100;
const STORAGE_KEY = "WalletState";

const initialState: WalletState = {
  coins: 0,
  transactions: [],
  initialized: false,
  totalBySource: {
    quiz_reward: 0,
    quiz_penalty: 0,
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

// ------------------ STORAGE HELPERS ------------------


export const loadWallet = (): WalletState | undefined => {
  try {
    const json = storage.getString(STORAGE_KEY);
    return json ? JSON.parse(json) : undefined; 
  } catch (e) {
    console.error("❌ [Wallet] Load failed", e);
    return undefined;
  }
};

export const saveWallet = (wallet: WalletState) => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(wallet));
    if (__DEV__) console.log("💾 [Wallet] Saved successfully");
  } catch (e) {
    console.error("❌ [Wallet] Save failed", e);
  }
};

// ------------------ SLICE ------------------

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setWallet: (_, action: PayloadAction<WalletState>) => {
      return action.payload;
    },

    markInitialized: (state) => {
      state.initialized = true;
    },

    applyTransaction: (state, action: PayloadAction<CoinPayload>) => {
      const { amount, reason, source = "other", metadata } = action.payload;
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
      if (state.transactions.length > MAX_TRANSACTIONS)
        state.transactions.pop();

      if (!state.totalBySource[source]) state.totalBySource[source] = 0;
      state.totalBySource[source] += amount;
    },

    claimSpinReward: (
      state,
      action: PayloadAction<{ amount: number; reason: string }>,
    ) => {
      const { amount, reason } = action.payload;
      if (amount === 0) return;

      const timestamp = Date.now();
      state.coins += amount;

      state.transactions.unshift({
        id: timestamp.toString(),
        type: "CREDIT",
        amount,
        reason,
        source: "spin_reward",
        timestamp,
      });

      if (state.transactions.length > MAX_TRANSACTIONS)
        state.transactions.pop();

      state.totalBySource.spin_reward += amount;
      state.locks.spin.lastUsedTimestamp = timestamp;
    },

    resetWallet: () => {
      // ✅ Corrected to .remove() as per V4 Nitro Docs
      storage.remove(STORAGE_KEY);
      return initialState;
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