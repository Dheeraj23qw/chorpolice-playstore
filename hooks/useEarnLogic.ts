// hooks/useEarnLogic.ts

import { useState, useCallback, useMemo, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";

import { RewardTier } from "@/constants/RewardsConst";
import { markRewardClaimed, getClaimedRewards } from "@/storage/rewardStorage";
import { Alerts } from "@/utils/alert";
import { updateCoins } from "@/features/wallet/walletSlice";

export const useEarnLogic = () => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const { isLocked, formattedTime } = useSpinWheel();

  const coins = useSelector((state: RootState) => state.wallet.coins);
  const [isSpinModalVisible, setIsSpinModalVisible] = useState(false);

  // 🔒 Prevent double-tap / spam
  const isProcessingRef = useRef(false);

  // 📏 Card width
  const cardWidth = useMemo(() => {
    return Math.min(width * 0.78, 300);
  }, [width]);

  // 🎡 Spin modal toggle
  const toggleSpinModal = useCallback(() => {
    setIsSpinModalVisible((prev) => !prev);
  }, []);

  /**
   * 🎯 ROBUST CLAIM HANDLER
   */
  const handleClaim = useCallback(
    (tier: RewardTier) => {
      // 🚫 prevent spam taps
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const claimedRewards = getClaimedRewards();

        // ❌ Already claimed
        if (claimedRewards.includes(tier.id)) {
          Alerts.error("Already Claimed", "You already redeemed this reward.");
          return;
        }

        // ❌ Invalid data safety
        if (!tier?.coinsRequired || tier.coinsRequired <= 0) {
          Alerts.error("Error", "Invalid reward configuration.");
          return;
        }

        // ❌ Not enough coins
        if (coins < tier.coinsRequired) {
          const remaining = tier.coinsRequired - coins;

          Alerts.error(
            "Insufficient Coins",
            `You need ${remaining.toLocaleString()} more coins`,
          );
          return;
        }

        // ✅ ADD Coins as reward (Milestone logic)
        dispatch(updateCoins(tier.rewardCoins));

        // ✅ Mark as claimed (atomic behavior)
        markRewardClaimed(tier.id);

        // 🎉 Success
        Alerts.success(
          "Milestone Reached! 🎉",
          `Congratulations! You've received ${tier.rewardCoins.toLocaleString()} bonus coins.`
        );
      } catch (err) {
        console.error("Claim failed:", err);

        Alerts.error("Something went wrong", "Please try again.");
      } finally {
        // 🔓 unlock after small delay (prevents spam)
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500);
      }
    },
    [coins, dispatch],
  );

  return {
    coins,
    cardWidth,
    isLocked,
    formattedTime,
    isSpinModalVisible,
    toggleSpinModal,
    handleClaim,
  };
};
