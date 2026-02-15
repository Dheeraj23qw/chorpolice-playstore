import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";

interface Props {
  rank: number;
  coins: number;
  getTier: (coins: number) => string;
  totalPlayers: number;
}

export default function UserSummaryCard({ rank, coins, getTier, totalPlayers }: Props) {
  return (
    <View className="mt-10 rounded-[32px] bg-slate-900 p-6 border border-white/5">
      <Text className="text-slate-400 text-xs uppercase tracking-widest">Your Current Standing</Text>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-white font-main-bold text-lg">Rank #{rank}</Text>
        <Text className="text-indigo-400 font-main-bold text-sm">{getTier(coins)} Tier</Text>
      </View>

      <Text className="text-slate-500 text-xs mt-2">
        Competing against {totalPlayers.toLocaleString()} global players
      </Text>
    </View>
  );
}
