import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { storage } from "@/storage/mmkv"; // 👈 Using your MMKV instance

const WELCOME_KEY = "welcome_bonus_v1";
const BONUS_AMOUNT = 1000;

export const useWelcomeBonus = () => {
  const dispatch: AppDispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // ✅ Check synchronously on mount (No more async/await flicker)
  useEffect(() => {
    const claimed = storage.getString(WELCOME_KEY);
    if (claimed !== "claimed") {
      setShowModal(true);
    }
  }, []);

  // ✅ Claim bonus
  const claimBonus = useCallback(() => {
    if (claiming) return;
    setClaiming(true);

    try {
      // 1. Apply bonus to Redux wallet
      dispatch(
        applyTransaction({
          amount: BONUS_AMOUNT,
          reason: "Welcome Bonus Reward",
          source: "rewards_claim",
          metadata: {
            rewardType: "welcome_bonus",
            version: "v1",
            triggeredFrom: "first_launch",
          },
        })
      );

      // 2. Mark permanently claimed in MMKV (Synchronous)
      storage.set(WELCOME_KEY, "claimed");

      // 3. UI Updates
      setShowModal(false);

      // 4. Redirect
      router.push("/earn");
    } catch (err) {
      console.warn("Welcome bonus claim failed:", err);
    } finally {
      setClaiming(false);
    }
  }, [claiming, dispatch]);

  return { showModal, claimBonus };
};