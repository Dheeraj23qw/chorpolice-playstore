import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

/* ---------------------- Base Selector ---------------------- */

// Select the entire wallet state
export const selectWalletState = (state: RootState) => state.wallet;

/* ---------------------- Basic Info ---------------------- */

// Select total coins in wallet
export const selectCoins = createSelector(
  [selectWalletState],
  (wallet) => wallet.coins
);

// Select all transactions
export const selectTransactions = createSelector(
  [selectWalletState],
  (wallet) => wallet.transactions
);

// Select recent transactions (default 5)
export const selectRecentTransactions = createSelector(
  [selectTransactions],
  (transactions) => transactions.slice(0, 5)
);

/* ---------------------- Totals ---------------------- */

// Total credits (sum of all CREDIT transactions)
export const selectTotalCredits = createSelector(
  [selectTransactions],
  (transactions) =>
    transactions
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0)
);

// Total debits (sum of all DEBIT transactions)
export const selectTotalDebits = createSelector(
  [selectTransactions],
  (transactions) =>
    transactions
      .filter((t) => t.type === "DEBIT")
      .reduce((sum, t) => sum + t.amount, 0)
);

/* ---------------------- Totals by Source ---------------------- */

// Total coins grouped by source
export const selectTotalBySource = createSelector(
  [selectWalletState],
  (wallet) => wallet.totalBySource
);

/* ---------------------- Transactions by Source ---------------------- */

// Get all transactions for a specific source
export const selectTransactionsBySource = (source: string) =>
  createSelector([selectTransactions], (transactions) =>
    transactions.filter((t) => t.source === source)
  );

// Get recent transactions for a specific source (default 5)
export const selectRecentTransactionsBySource = (source: string, limit = 5) =>
  createSelector([selectTransactionsBySource(source)], (transactions) =>
    transactions.slice(0, limit)
  );

/* ---------------------- Counts ---------------------- */

// Number of credit transactions
export const selectCreditCount = createSelector(
  [selectTransactions],
  (transactions) => transactions.filter((t) => t.type === "CREDIT").length
);

// Number of debit transactions
export const selectDebitCount = createSelector(
  [selectTransactions],
  (transactions) => transactions.filter((t) => t.type === "DEBIT").length
);



/* ---------------------- Usage Example ----------------------

// Import useSelector in a component:
import { useSelector } from "react-redux";
import { selectCoins, selectRecentTransactions, selectTotalBySource } from "@/redux/wallet/walletSelectors";

// Example inside a component:
const coins = useSelector(selectCoins); // total coins
const recent = useSelector(selectRecentTransactions); // last 5 transactions
const totalBySource = useSelector(selectTotalBySource); // { quiz_reward: 200, spin_reward: 500, ... }

*/
