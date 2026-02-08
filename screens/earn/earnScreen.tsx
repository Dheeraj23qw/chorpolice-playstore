import React, { useState, useCallback, useMemo } from "react";
import { Alert, ScrollView, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import ScreenWrapper from "@/components/screenwrapper";
import SpinToWinModal from "@/modal/SpinToWinModal";
import { WalletCard } from "@/components/EarnScreen/WalletCard";
import { MilestonesSection } from "@/components/EarnScreen/MilestonesSection";
import { SpinToWinCard } from "@/components/EarnScreen/SpinToWinCard";

import { RootState } from "@/redux/store";
import { applyTransaction } from "@/features/wallet/walletSlice";
import { REWARD_TIERS } from "@/constants/RewardsConst";
import { useSpinWheel } from "@/features/SpinWheel/useSpinWheel";

export default function EarnScreen() {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const { isLocked, formattedTime } = useSpinWheel();

  // State
  const [isSpinModalVisible, setIsSpinModalVisible] = useState(false);

  // Redux Selectors
  const coins = useSelector((state: RootState) => state.wallet.coins);

  // Derived Values
  const cardWidth = useMemo(() => Math.min(width * 0.78, 300), [width]);

  // Handlers
  const handleClaim = useCallback(
    (rewardName: string, cost: number) => {
      if (coins < cost) {
        Alert.alert(
          "Insufficient Balance",
          `You need ${(cost - coins).toLocaleString()} more coins to claim this reward.`
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
              try {
                // Apply transaction using your slice
                dispatch(
                  applyTransaction({
                    amount: -cost, // debit coins
                    reason: `Reward: ${rewardName}`,
                    source: "rewards_claim",
                    metadata: {
                      rewardName,
                      timestamp: new Date().toISOString(),
                    },
                  })
                );

                Alert.alert(
                  "Success! 🎉",
                  `Your ${rewardName} is on the way. Our team will contact you shortly.`,
                  [{ text: "Great!" }]
                );
              } catch (error) {
                console.error("Redemption Error:", error);
                Alert.alert("Error", "Something went wrong. Please try again.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [coins, dispatch]
  );

  const toggleSpinModal = useCallback(() => {
    setIsSpinModalVisible((prev) => !prev);
  }, []);

  return (
    <ScreenWrapper
      title="Rewards Hub"
      variant="dark"
      subtitle="Convert effort into prizes"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-slate-950"
        contentContainerClassName="pb-12 pt-4 px-5"
      >
        <WalletCard balance={coins} />

        <MilestonesSection
          tiers={REWARD_TIERS}
          coins={coins}
          cardWidth={cardWidth}
          onClaim={handleClaim}
        />

        <SpinToWinCard
          isLocked={isLocked}
          formattedTime={formattedTime}
          onPress={() => {
            if (!isLocked) toggleSpinModal();
          }}
        />

        <SpinToWinModal
          isVisible={isSpinModalVisible}
          onClose={toggleSpinModal}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
