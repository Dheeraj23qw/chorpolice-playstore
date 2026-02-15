// components/EarnScreen/EarnContent.tsx
import React from "react";
import { ScrollView } from "react-native";
import { WalletCard } from "@/components/EarnScreen/WalletCard";
import { MilestonesSection } from "@/components/EarnScreen/MilestonesSection";
import { SpinToWinCard } from "@/components/EarnScreen/SpinToWinCard";
import SpinToWinModal from "@/modal/SpinToWinModal";
import { REWARD_TIERS } from "@/constants/RewardsConst";

interface Props {
  coins: number;
  cardWidth: number;
  isLocked: boolean;
  formattedTime: string;
  isSpinModalVisible: boolean;
  toggleSpinModal: () => void;
  handleClaim: (rewardName: string, cost: number) => void;
}

export const EarnContent = ({
  coins,
  cardWidth,
  isLocked,
  formattedTime,
  isSpinModalVisible,
  toggleSpinModal,
  handleClaim,
}: Props) => {
  return (
    <>
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
      </ScrollView>

      <SpinToWinModal
        isVisible={isSpinModalVisible}
        onClose={toggleSpinModal}
      />
    </>
  );
};
