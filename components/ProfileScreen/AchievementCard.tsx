import React from "react";
import { View } from "react-native";
import * as LucideIcons from "lucide-react-native";
import { Text } from "@/components/Text";
import { Achievement } from "@/constants/achievements";

interface Props {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: Props) {
  const Icon = (LucideIcons as any)[achievement.iconName] || LucideIcons.Award;

  const rarityColors: Record<Achievement["rarity"], string> = {
    Legendary: "#fbbf24",
    Epic: "#a78bfa",
    Rare: "#60a5fa",
    Common: "#94a3b8",
  };
  const rarityColor = rarityColors[achievement.rarity];

  return (
    <View className="mr-4 items-center">
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-indigo-900/30 border border-white/20 shadow-md backdrop-blur-sm">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Icon size={28} color={rarityColor} strokeWidth={2.5} />
        </View>
      </View>
      <Text className="text-[8px] font-main-bold text-slate-500 mt-2 uppercase text-center w-20">
        {achievement.title}
      </Text>
    </View>
  );
}
