import React from "react";
import { View, Image, Text } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { rf, wp, hp } from "@/utils/responsive";

interface PlayerScore {
  playerName: string;
  totalScore: number;
}

interface LeaderboardProps {
  sortedScores: PlayerScore[];
  playerNames: { name: string }[];
  selectedImages: number[];
}

const PlayerItem: React.FC<{
  player: PlayerScore;
  playerIndex: number;
  rank: number;
}> = ({ player, playerIndex, rank }) => {
  const playerImages = useSelector((state: RootState) => state.playerImages.images);
  const playerImage = playerImages[playerIndex].src;

  const isTopRank = rank <= 3;

  return (
    <View 
      className={`mb-4 flex-row items-center rounded-[24px] px-4 py-3 border 
        ${isTopRank ? 'bg-white/[0.08] border-indigo-500/30' : 'bg-white/[0.03] border-white/10'}`}
    >
      {/* 1. Rank Indicator with Glow */}
      <View 
        className={`w-10 h-10 items-center justify-center rounded-xl mr-4 
          ${rank === 1 ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : 'bg-white/5'}`}
      >
        <Text 
          style={{ fontSize: rf(1.6) }} 
          className={`font-black ${rank === 1 ? 'text-white' : 'text-white/40'}`}
        >
          {rank}
        </Text>
      </View>

      {/* 2. Avatar with Micro-Glass Frame */}
      <View className="relative">
        <Image
          source={typeof playerImage === "string" ? { uri: playerImage } : playerImage}
          style={{ width: wp(12), height: wp(12) }}
          className="rounded-full border border-white/20"
          resizeMode="cover"
        />
        {isTopRank && (
          <View className="absolute -bottom-1 -right-1 bg-indigo-500 h-3 w-3 rounded-full border-2 border-[#09090b]" />
        )}
      </View>

      {/* 3. Player Identity */}
      <View className="flex-1 ml-4">
        <Text 
          style={{ fontSize: rf(1.8) }} 
          className="text-white font-bold tracking-tight"
        >
          {player.playerName || "Unknown Player"}
        </Text>
        <Text 
          style={{ fontSize: rf(0.9) }} 
          className="text-white/30 font-black uppercase tracking-[2px]"
        >
          {rank === 1 ? "MVP Status" : "Operative"}
        </Text>
      </View>

      {/* 4. Score Tag */}
      <View className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-400/20">
        <Text 
          style={{ fontSize: rf(1.8) }} 
          className="text-indigo-300 font-black italic"
        >
          {player.totalScore ?? 0}
        </Text>
      </View>
    </View>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  sortedScores,
  playerNames,
  selectedImages,
}) => {
  const playerNameToIndexMap = new Map(
    playerNames.map((p, index) => [p.name, selectedImages[index]])
  );

  return (
    <View className="w-full">
      {sortedScores.map((player, index) => {
        const playerIndex = playerNameToIndexMap.get(player.playerName) ?? 0;

        return (
          <PlayerItem
            key={player.playerName}
            player={player}
            playerIndex={playerIndex}
            rank={index + 1}
          />
        );
      })}
    </View>
  );
};