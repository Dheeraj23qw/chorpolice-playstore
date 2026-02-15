import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import * as LucideIcons from "lucide-react-native";

export default function EliteRewardsCard() {
  return (
    <View className="mx-5 mt-4 rounded-[32px] bg-indigo-600 p-8 flex-row items-center justify-between overflow-hidden shadow-2xl shadow-indigo-500/40">
      <View className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full" />
      <View className="flex-1 pr-4">
        <Text className="text-white font-main-bold text-xl">Elite Rewards</Text>
        <Text className="text-indigo-100/80 text-xs font-main-md mt-2">
          Unlock all awards to claim the Grandmaster Badge.
        </Text>
      </View>
      <LucideIcons.Star size={40} color="white" />
    </View>
  );
}
