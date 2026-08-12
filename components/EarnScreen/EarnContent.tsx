// components/EarnScreen/EarnContent.tsx
import React from "react";
import { ScrollView } from "react-native";
import { MilestonesSection } from "@/components/EarnScreen/MilestonesSection";
import { ReferralStatsCard } from "@/components/EarnScreen/ReferralStatsCard";
import { REWARD_TIERS, RewardTier } from "@/constants/RewardsConst";

interface Props {
  coins: number;
  cardWidth: number;
  handleClaim: (tier: RewardTier) => void;
}

export const EarnContent = ({
  coins,
  cardWidth,
  handleClaim,
}: Props) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-slate-950"
      contentContainerClassName="pb-12 pt-4 px-5"
    >
      <MilestonesSection
        tiers={REWARD_TIERS}
        coins={coins}
        cardWidth={cardWidth}
        onClaim={handleClaim}
      />
      <ReferralStatsCard />
    </ScrollView>
  );
};
