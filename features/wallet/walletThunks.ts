import { loadWalletFromStorage, saveWalletToStorage } from "./walletStorage";
import { WalletState, Transaction } from "./walletTypes";
import { AppDispatch } from "@/redux/store";
import { markInitialized, setWallet } from "./walletSlice";

export const initializeWallet = () => async (dispatch: AppDispatch) => {
  const storedWallet = await loadWalletFromStorage();

  if (!storedWallet) {
    const welcomeBonus = 1000;

    const welcomeTransaction: Transaction = {
      id: Date.now().toString(),
      type: "CREDIT",
      amount: welcomeBonus,
      reason: "Welcome Bonus",
      source: "daily_bonus",
      metadata: { event: "first_launch" },
      timestamp: Date.now(),
    };
    const newWallet: WalletState = {
      coins: welcomeBonus,
      transactions: [welcomeTransaction],
      initialized: true,
      totalBySource: {
        quiz_reward: 0,
        spin_reward: 0,
        game_reward: 0,
        app_share: 0,
        daily_bonus: welcomeBonus,
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

    await saveWalletToStorage(newWallet);
    dispatch(setWallet(newWallet));
  } else {
    const walletWithTotals: WalletState = {
      ...storedWallet,
      initialized: true,
      totalBySource: {
        quiz_reward: storedWallet.totalBySource?.quiz_reward || 0,
        spin_reward: storedWallet.totalBySource?.spin_reward || 0,
        game_reward: storedWallet.totalBySource?.game_reward || 0,
        app_share: storedWallet.totalBySource?.app_share || 0,
        daily_bonus: storedWallet.totalBySource?.daily_bonus || 0,
        chor_police: storedWallet.totalBySource?.chor_police || 0,
        other: storedWallet.totalBySource?.other || 0,
        rewards_claim: storedWallet.totalBySource?.rewards_claim || 0,
      },
      locks: storedWallet.locks ?? {
        spin: { lastUsedTimestamp: null, countToday: 0 },
        daily_bonus: { lastUsedTimestamp: null, countToday: 0 },
        rate_us: { hasRated: false, lastPrompted: null },
      },
    };

    dispatch(setWallet(walletWithTotals));
  }

  dispatch(markInitialized());
};
