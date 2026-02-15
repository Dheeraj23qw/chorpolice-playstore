import React from "react";
import { ScrollView, View, ActivityIndicator, useWindowDimensions } from "react-native";
import * as LucideIcons from "lucide-react-native";

import ScreenWrapper from "@/components/screenwrapper";
import { Text } from "@/components/Text";
import { AwardRow } from "@/components/AwardScreen/AwardRow";
import { useAwards } from "@/hooks/useAwards";

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
        
        <View className="mx-5 mb-8 p-6 rounded-[32px] bg-slate-900 border border-white/5 flex-row items-center justify-between">
          <View>
            <Text className="text-white font-main-bold text-3xl">{totalUnlocked}/{collections.flatMap(c => c.data).length}</Text>
            <Text className="text-slate-500 text-[10px] font-main-bold uppercase tracking-widest">Global Progress</Text>
          </View>
          <View className="h-14 w-14 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20">
            <LucideIcons.Trophy size={28} color="#6366f1" />
          </View>
        </View>

        {collections.map(section => (
          <AwardRow
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            data={section.data}
            cardWidth={CARD_WIDTH}
            getRarityStyles={getRarityStyles}
          />
        ))}

        <View className="mx-5 mt-4 rounded-[32px] bg-indigo-600 p-8 flex-row items-center justify-between overflow-hidden shadow-2xl shadow-indigo-500/40">
          <View className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full" />
          <View className="flex-1 pr-4">
            <Text className="text-white font-main-bold text-xl">Elite Rewards</Text>
            <Text className="text-indigo-100/80 text-xs font-main-md mt-2">Unlock all awards to claim the Grandmaster Badge.</Text>
          </View>
          <LucideIcons.Star size={40} color="white" />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}
