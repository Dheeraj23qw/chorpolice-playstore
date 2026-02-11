import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { loadWallet, saveWallet, setWallet } from "@/features/wallet/walletSlice";

export const useWalletPersistence = () => {
  const dispatch = useDispatch();
  const wallet = useSelector((state: RootState) => state.wallet);
  const hydrated = useRef(false); // ✅ track hydration

  // Hydrate once on app start
  useEffect(() => {
    const hydrate = async () => {
      const loadedWallet = await loadWallet();
      if (loadedWallet) {
        dispatch(setWallet(loadedWallet));
        console.log("🟢 [Wallet] Hydrated from storage:", loadedWallet);
      }
      hydrated.current = true; // mark hydration done
    };
    hydrate();
  }, [dispatch]);

  // Auto-save whenever wallet changes, but only after hydration
  useEffect(() => {
    if (!hydrated.current) return; // ✅ skip save until hydrated
    saveWallet(wallet);
    console.log("💾 [Wallet] Saved successfully", wallet);
  }, [wallet]);
};
