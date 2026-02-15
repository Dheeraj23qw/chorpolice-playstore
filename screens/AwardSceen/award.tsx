import React from "react";
import { ScrollView, View, ActivityIndicator, useWindowDimensions } from "react-native";

import ScreenWrapper from "@/components/screenwrapper";
import { useAwards } from "@/hooks/useAwards";
import GlobalProgressCard from "@/components/AwardScreen/GlobalProgressCard";
import AwardsSection from "@/components/AwardScreen/AwardsSection";
import EliteRewardsCard from "@/components/AwardScreen/EliteRewardsCard";

export default function AwardsScreen() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.78, 300);

  const { collections, totalUnlocked, getRarityStyles, isReady } = useAwards();

  if (!isReady) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <ScreenWrapper title="Trophy Room" variant="dark" subtitle="Elite Achievements">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-4 bg-slate-950">
        <GlobalProgressCard totalUnlocked={totalUnlocked} totalAwards={collections.flatMap(c => c.data).length} />
        <AwardsSection collections={collections} cardWidth={CARD_WIDTH} getRarityStyles={getRarityStyles} />
        <EliteRewardsCard />
      </ScrollView>
    </ScreenWrapper>
  );
}
