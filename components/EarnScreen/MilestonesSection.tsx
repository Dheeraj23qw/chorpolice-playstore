import React from "react";
import { ScrollView, View } from "react-native";
import { Gift } from "lucide-react-native";
import { Text } from "@/components/Text";
import { MilestoneCard } from "./MilestoneCard";

interface MilestonesSectionProps {
  tiers: any[];
  coins: number;
  cardWidth: number;
  onClaim: (reward: string, cost: number) => void;
}

export const MilestonesSection = ({ tiers, coins, cardWidth,onClaim }: MilestonesSectionProps) => {
  return (
    <View className="mb-10">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5 px-1">
        <Text className="text-xl font-main-bold text-white tracking-tight">Milestones</Text>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-slate-800">
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
          />
        ))}
      </ScrollView>
    </View>
  );
};