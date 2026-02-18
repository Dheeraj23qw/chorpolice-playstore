import React, { memo } from "react";
import { View } from "react-native";
import { Crown, Coins } from "lucide-react-native";
import { Text } from "@/components/Text";

type Player = {
  id: string;
  name: string;
  coins: number;
};

interface Props {
  topPlayers: Player[];
  getTier: (coins: number) => string;
}

/* ---------------------------------------------------
    ✅ Named Sub-component + NativeWind Migration
--------------------------------------------------- */
const TopPlayerCard = memo(function TopPlayerCard({ 
  player, 
  isFirst, 
  getTier 
}: { 
  player: Player; 
  isFirst: boolean; 
  getTier: (coins: number) => string 
}) {
  return (
    <View className={`items-center ${isFirst ? "w-[36%]" : "w-[30%]"}`}>
      {/* Avatar Container */}
      <View 
        className={`mb-3 items-center justify-center rounded-full border ${
          isFirst 
            ? "h-20 w-20 bg-indigo-600 border-indigo-400 border-2" 
            : "h-16 w-16 bg-slate-800 border-white/10 border"
        }`}
      >
        {isFirst ? (
          <Crown size={30} color="white" />
        ) : (
          <Text className="text-[20px]">🏆</Text>
        )}
      </View>

      <Text numberOfLines={1} className="text-white text-[12px] font-main-bold">
        {player.name}
      </Text>

      {/* Coins Row */}
      <View className="flex-row items-center mt-1">
        <Coins size={12} color="#facc15" />
        <Text className="ml-1 text-[10px] font-main-bold text-yellow-400">
          {player.coins.toLocaleString()}
        </Text>
      </View>

      <Text className="mt-1 text-[10px] text-slate-400">
        {getTier(player.coins)}
      </Text>
    </View>
  );
});

TopPlayerCard.displayName = "TopPlayerCard";

/* ---------------------------------------------------
    ✅ Main Export Component
--------------------------------------------------- */
const LeaderboardTop3 = memo(function LeaderboardTop3({ topPlayers, getTier }: Props) {
  return (
    <View className="flex-row justify-between items-end mt-8 mb-10">
      {topPlayers.map((player, index) => (
        <TopPlayerCard 
          key={player.id} 
          player={player} 
          isFirst={index === 0} 
          getTier={getTier} 
        />
      ))}
    </View>
  );
});

LeaderboardTop3.displayName = "LeaderboardTop3";

export default LeaderboardTop3;