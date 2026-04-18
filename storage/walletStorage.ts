// ------------------ STORAGE HELPERS ------------------
import { WalletState } from "@/features/wallet/walletSlice";
import { storage } from "@/storage/mmkv";

const STORAGE_KEY = "WalletState";

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
