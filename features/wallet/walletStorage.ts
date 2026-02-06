import * as SecureStore from "expo-secure-store";
import { WalletState } from "./walletTypes";

const STORAGE_KEY = "wallet_data";

export const saveWalletToStorage = async (wallet: WalletState) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(wallet));
  } catch (error) {
    console.error("Wallet Save Error:", error);
  }
};

export const loadWalletFromStorage = async (): Promise<WalletState | null> => {
  try {
    const data = await SecureStore.getItemAsync(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Wallet Load Error:", error);
    return null;
  }
};
