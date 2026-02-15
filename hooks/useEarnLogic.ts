// hooks/useEarnLogic.ts
import { useState, useCallback, useMemo } from "react";
import { Alert, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";

export const useEarnLogic = () => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch<AppDispatch>();
  const { isLocked, formattedTime } = useSpinWheel();

  const coins = useSelector((state: RootState) => state.wallet.coins);
  const [isSpinModalVisible, setIsSpinModalVisible] = useState(false);

  const cardWidth = useMemo(() => {
    return Math.min(width * 0.78, 300);
  }, [width]);

  const toggleSpinModal = useCallback(() => {
    setIsSpinModalVisible((prev) => !prev);
  }, []);

  const handleClaim = useCallback(
    (rewardName: string, cost: number) => {
      if (coins < cost) {
        Alert.alert(
          "Insufficient Balance",
          `You need ${(cost - coins).toLocaleString()} more coins.`
        );
        return;
      }

      Alert.alert(
        "Confirm Redemption",
        `Spend ${cost.toLocaleString()} 🪙 for ${rewardName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Redeem",
            onPress: () => {
              dispatch(
                applyTransaction({
                  amount: -cost,
                  reason: `Reward: ${rewardName}`,
                  source: "rewards_claim",
                  metadata: {
                    rewardName,
                    timestamp: new Date().toISOString(),
                  },
                })
              );

              Alert.alert(
                "Success 🎉",
                `${rewardName} redemption successful.`
              );
            },
          },
        ],
        { cancelable: true }
      );
    },
    [coins, dispatch]
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
