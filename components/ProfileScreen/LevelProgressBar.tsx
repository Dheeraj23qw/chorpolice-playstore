import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

interface Props {
  xp: number;
  nextLevelXp: number;
}

export default function LevelProgressBar({ xp, nextLevelXp }: Props) {
  const progress = (xp / (nextLevelXp || 1)) * 100;

  return (
    <View className="px-6 mt-10">
      <View className="flex-row items-end justify-between mb-3 px-1">
        <View>
          <Text className="text-[10px] font-main-bold text-slate-500 uppercase tracking-[3px]">
            Experience
          </Text>
          <Text className="text-xl font-main-bold text-white mt-0.5">God Status</Text>
        </View>
        <Text className="text-[11px] font-main-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
        </Text>
      </View>
      
      <View className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
        >
           {/* Specular Shine */}
           <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-full" />
        </View>
      </View>
    </View>
  );
}
