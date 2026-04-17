import React from "react";
import { ScrollView, View } from "react-native";
import { Gift } from "lucide-react-native";
import { Text } from "@/components/Text";
import { MilestoneCard } from "./MilestoneCard";
import { RewardTier } from "@/constants/RewardsConst";
import { getClaimedRewards } from "@/storage/rewardStorage";
import { getInstallTime } from "@/storage/installStorage";

interface MilestonesSectionProps {
  tiers: RewardTier[];
  coins: number;
  cardWidth: number;
  onClaim: (tier: RewardTier) => void;
}

export const MilestonesSection = ({
  tiers,
  coins,
  cardWidth,
  onClaim,
}: MilestonesSectionProps) => {
  const installTime = getInstallTime();
  const claimedRewards = getClaimedRewards();

  return (
    <View className="mb-10">
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between px-1">
        <Text className="font-main-bold text-xl tracking-tight text-white">
          Milestones
        </Text>
        <View className="h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
          <Gift size={16} color="#818cf8" />
        </View>
      </View>

      {/* Scroller */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerClassName="px-5"
        snapToInterval={cardWidth + 20}
        decelerationRate="fast"
      >
        {tiers.map((tier) => (
          <MilestoneCard
            key={tier.id}
            tier={tier}
            currentCoins={coins}
            cardWidth={cardWidth}
            onClaim={onClaim}
            installTime={installTime}
            isClaimed={claimedRewards.includes(tier.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
