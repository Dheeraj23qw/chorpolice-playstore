// walletTypes.ts

export type WalletSource =
  | "quiz_reward"
  | "quiz_penalty"       // ✅ New source for quitting mid-quiz or penalties
  | "spin_reward"
  | "game_reward"
  | "app_share"
  | "daily_bonus"
  | "chor_police"
  | "rewards_claim"
  | "other";

export interface FeatureLock {
  lastUsedTimestamp: number | null;
  countToday: number;
}

// Each transaction in the wallet
export interface Transaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;                 // Human-readable reason
  source?: WalletSource;           // Optional, defaults to "other"
  metadata?: Record<string, any>; // Extra info, e.g., level, segmentLabel, date
  timestamp: number;              // Exact timestamp of the event
}

// Wallet state
export interface WalletState {
  coins: number; // total current coins
  transactions: Transaction[]; // history of all credits/debits
  initialized: boolean; // flag for first-time initialization
  totalBySource: Record<WalletSource, number>; // cumulative coins per source
  locks: {
    spin: FeatureLock;
    daily_bonus: FeatureLock;
    rate_us: { hasRated: boolean; lastPrompted: number | null };
  };
}
