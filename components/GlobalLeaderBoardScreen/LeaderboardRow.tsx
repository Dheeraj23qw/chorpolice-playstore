import React, { memo } from "react";
import { View } from "react-native";
import { Coins, TrendingUp, TrendingDown, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/Text";

interface Player {
  id: string;
  name: string;
  coins: number;
}

interface Props {
  rank: number;
  player: Player;
  movement: number;
  isCurrentUser?: boolean;
}

/* ---------------------------------------------------
    ✅ Named Sub-component + NativeWind Migration
--------------------------------------------------- */
const MovementIndicator = memo(function MovementIndicator({ movement }: { movement: number }) {
  if (movement > 0) {
    return (
      <View className="flex-row items-center mt-1">
        <TrendingUp size={10} color="#22c55e" />
        <Text className="text-[10px] ml-1 font-main-bold text-green-500">+{movement}</Text>
      </View>
    );
  } else if (movement < 0) {
    return (
      <View className="flex-row items-center mt-1">
        <TrendingDown size={10} color="#ef4444" />
        <Text className="text-[10px] ml-1 font-main-bold text-red-500">{movement}</Text>
      </View>
    );
  } else {
    return <Text className="text-slate-400 text-[10px] mt-1">No change</Text>;
  }
});

MovementIndicator.displayName = "MovementIndicator";

/* ---------------------------------------------------
    ✅ Main Component Refactored to Tailwind
--------------------------------------------------- */
const LeaderboardRow = memo(function LeaderboardRow({ 
  rank, 
  player, 
  movement, 
  isCurrentUser 
}: Props) {
  return (
    <View 
      className={`flex-row items-center rounded-3xl p-4 mb-3 border ${
        isCurrentUser 
          ? "bg-indigo-600/10 border-indigo-500/30" 
          : "bg-slate-900/60 border-white/5"
      }`}
    >
      {/* Rank */}
      <View className="w-10 items-center">
        <Text className="text-slate-400 font-main-bold text-[14px]">#{rank}</Text>
      </View>

      {/* Player Info */}
      <View className="flex-1 ml-2">
        <Text className="text-white font-main-bold text-[14px]">{player.name}</Text>
        <MovementIndicator movement={movement} />
      </View>

      {/* Coins */}
      <View className="items-end mr-3">
        <View className="flex-row items-center">
          <Coins size={12} color="#facc15" />
          <Text className="ml-1 font-main-bold text-[14px] text-white">
            {player.coins.toLocaleString()}
          </Text>
        </View>
        <Text className="text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5">
          COINS
        </Text>
      </View>

      <ChevronRight size={14} color="#334155" />
    </View>
  );
});

LeaderboardRow.displayName = "LeaderboardRow";

export default LeaderboardRow;