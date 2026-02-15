import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";

interface Props {
  xp: number;
  nextLevelXp: number;
}

export default function LevelProgressBar({ xp, nextLevelXp }: Props) {
  const progress = (xp / (nextLevelXp || 1)) * 100;

  return (
    <View className="px-6 mt-8">
      <View className="flex-row justify-between mb-2">
        <Text className="text-[10px] font-main-bold text-slate-400 uppercase tracking-widest">
          Season Progress
        </Text>
        <Text className="text-[10px] font-main-bold text-indigo-400">
          {xp} / {nextLevelXp} XP
        </Text>
      </View>
      <View className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-indigo-500 rounded-full"
        />
      </View>
    </View>
  );
}
