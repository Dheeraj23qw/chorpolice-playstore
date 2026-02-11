import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";

const WELCOME_KEY = "welcome_bonus_v1";
const BONUS_AMOUNT = 1000;

export const useWelcomeBonus = () => {
  const dispatch: AppDispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // ✅ Check once on app start if bonus was claimed
  useEffect(() => {
    const checkWelcome = async () => {
      try {
        const claimed = await SecureStore.getItemAsync(WELCOME_KEY);
        if (claimed !== "claimed") setShowModal(true);
      } catch (err) {
        console.warn("Failed to check welcome bonus:", err);
      }
    };
    checkWelcome();
  }, []);

  // ✅ Claim bonus
  const claimBonus = useCallback(async () => {
    if (claiming) return;
    setClaiming(true);

    try {
      // Apply bonus to wallet
      dispatch(
        applyTransaction({
          amount: BONUS_AMOUNT,
          reason: "Welcome Bonus Reward",
          source: "rewards_claim", // or "welcome_bonus" if you want a separate source
          metadata: {
            rewardType: "welcome_bonus",
            version: "v1",
            triggeredFrom: "first_launch",
          },
        })
      );

      // Mark permanently claimed
      await SecureStore.setItemAsync(WELCOME_KEY, "claimed");

      // Hide modal
      setShowModal(false);

      // ✅ Redirect to /earn automatically
      router.push("/earn");
    } catch (err) {
      console.warn("Welcome bonus claim failed:", err);
    } finally {
      setClaiming(false);
    }
  }, [claiming, dispatch]);

  return { showModal, claimBonus };
};
