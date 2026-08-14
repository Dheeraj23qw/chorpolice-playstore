import { storage } from "@/storage/mmkv";
import { resetWallet } from "@/features/wallet/walletSlice";
import { clearSession } from "@/redux/reducers/sessionSlice";
import { resetDifficulty } from "@/redux/reducers/quiz";
import { resetLocks } from "@/features/locks/lockSlice";
import store from "@/redux/store";

export const resetAllAppData = () => {
  storage.clearAll();

  store.dispatch(resetWallet());
  store.dispatch(clearSession());
  store.dispatch(resetDifficulty());
  store.dispatch(resetLocks());
};
