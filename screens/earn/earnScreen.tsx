import React, { useState } from "react";
import { Alert, ScrollView, useWindowDimensions } from "react-native";
import ScreenWrapper from "@/components/screenwrapper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import SpinToWinModal from "@/modal/SpinToWinModal";
import { WalletCard } from "@/components/EarnScreen/WalletCard";
import { MilestonesSection } from "@/components/EarnScreen/MilestonesSection";
import { SpinToWinCard } from "@/components/EarnScreen/SpinToWinCard";
import { debitCoins } from "@/features/wallet/walletSlice";

// ✅ NEW WALLET IMPORT

type RewardTier = {
  id: number;
  coinsRequired: number;
  reward: string;
  emoji: string;
};

const REWARD_TIERS: RewardTier[] = [
  { id: 1, coinsRequired: 25000, reward: "Badminton Pro", emoji: "🏸" },
  { id: 2, coinsRequired: 6000, reward: "Cricket Elite Kit", emoji: "🏏" },
  { id: 3, coinsRequired: 10, reward: "₹1,000 Cash", emoji: "💰" },
];

export default function EarnScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.78, 300);

  const [isSpinModalVisible, setIsSpinModalVisible] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  const dispatch = useDispatch();

  // ✅ NEW WALLET SELECTOR
  const coins = useSelector((state: RootState) => state.wallet.coins);

const handleClaim = (rewardName: string, cost: number) => {
  if (coins < cost) {
    Alert.alert("Not Enough Coins", "You don't have enough coins.");
    return;
  }

  Alert.alert(
    "Confirm Claim",
    `Are you sure you want to spend ${cost.toLocaleString()} 🪙 for ${rewardName}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Claim Now",
        onPress: () => {
          // ✅ Use walletSlice debitCoins instead of old coinsReducer
          dispatch(
            debitCoins({
              amount: cost,
              reason: `Claimed reward: ${rewardName}`,
              source: "game_reward", // categorize the spending
              metadata: { rewardName }, // optional metadata
            })
          );

          Alert.alert(
            "Congratulations! 🎉",
            `You have successfully claimed: ${rewardName}. Our team will contact you shortly regarding delivery!`,
            [{ text: "Awesome!" }],
          );
        },
      },
    ],
  );
};


  return (
    <ScreenWrapper
      title="Rewards Hub"
      variant="dark"
      subtitle="Convert effort into prizes"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-12 pt-4 px-5 bg-slate-950"
      >
        <WalletCard balance={coins} />

        <MilestonesSection
          tiers={REWARD_TIERS}
          coins={coins}
          cardWidth={CARD_WIDTH}
          onClaim={handleClaim}
        />

        <SpinToWinCard
          isEnabled={!hasSpunToday}
          onPress={() => setIsSpinModalVisible(true)}
        />

        <SpinToWinModal
          isVisible={isSpinModalVisible}
          onClose={() => setIsSpinModalVisible(false)}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
