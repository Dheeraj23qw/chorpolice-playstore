import AsyncStorage from "@react-native-async-storage/async-storage";
import { WalletState } from "./walletTypes";

const STORAGE_KEY = "wallet_data_v1"; // versioned key for future migrations
const MAX_TRANSACTIONS = 100;

function sanitizeWallet(wallet: WalletState): WalletState {
  return {
    ...wallet,
    transactions: Array.isArray(wallet.transactions)
      ? wallet.transactions.slice(0, MAX_TRANSACTIONS)
      : [],
  };
}

export const saveWalletToStorage = async (
  wallet: WalletState
): Promise<void> => {
  try {
    const safeWallet = sanitizeWallet(wallet);

    const json = JSON.stringify(safeWallet);

    // Safety guard (prevent absurd growth)
    if (json.length > 500_000) {
      console.warn("Wallet too large, trimming further...");
      safeWallet.transactions = safeWallet.transactions.slice(0, 50);
    }

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(safeWallet)
    );
  } catch (error) {
    console.error("Wallet Save Error:", error);
  }
};

export const loadWalletFromStorage = async (): Promise<WalletState | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    try {
      const parsed: WalletState = JSON.parse(data);

      // Basic validation check
      if (
        typeof parsed.coins !== "number" ||
        typeof parsed.totalBySource !== "object" ||
        typeof parsed.locks !== "object"
      ) {
        console.warn("Wallet data corrupted. Resetting.");
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return sanitizeWallet(parsed);
    } catch (parseError) {
      console.warn("Wallet JSON parse failed. Resetting storage.");
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
  } catch (error) {
    console.error("Wallet Load Error:", error);
    return null;
  }
};

export const clearWalletStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY]);
  } catch (error) {
    console.error("Wallet Clear Error:", error);
  }
};
