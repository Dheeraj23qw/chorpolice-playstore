import React from "react";
import { View, Image } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { rf, wp } from "@/utils/responsive";
import { Text } from "../Text";

interface PlayerScore {
  playerId?: string;
  playerName: string;
  totalScore: number;
}

interface LeaderboardProps {
  sortedScores: PlayerScore[];
  playerNames: { id: string | number; name: string; avatarId?: number }[];
  selectedImages: number[];
}

const PlayerItem: React.FC<{
  player?: PlayerScore;
  playerAvatarId?: number;
  rank?: number;
}> = ({ player, playerAvatarId, rank }) => {
  const playerImages =
    useSelector((state: RootState) => state.playerImages?.images) ?? [];

  // 🛑 HARD SAFETY GUARDS
  if (!player || playerAvatarId == null || rank == null) {
    return null;
  }

  const playerImage = playerImages?.[playerAvatarId]?.src ?? null;
  const isTopRank = rank <= 3;

  return (
    <View
      className={`mb-4 flex-row items-center rounded-[24px] px-4 py-3 border 
        ${
          isTopRank
            ? "bg-white/[0.08] border-indigo-500/30"
            : "bg-white/[0.03] border-white/10"
        }`}
    >
      {/* Rank */}
      <View
        className={`w-10 h-10 items-center justify-center rounded-xl mr-4 
          ${
            rank === 1
              ? "bg-indigo-500 shadow-lg shadow-indigo-500/50"
              : "bg-white/5"
          }`}
      >
        <Text
          style={{ fontSize: rf(1.6) }}
          // 1. font-black -> font-main-bold
          className={`font-main-bold ${
            rank === 1 ? "text-white" : "text-white/40"
          }`}
        >
          {rank}
        </Text>
      </View>

      {/* Avatar */}
      <View className="relative">
        {playerImage && (
          <Image
            source={
              typeof playerImage === "string"
                ? { uri: playerImage }
                : playerImage
            }
            style={{ width: wp(12), height: wp(12) }}
            className="rounded-full border border-white/20"
            resizeMode="cover"
          />
        )}
      </View>

      {/* Name */}
      <View className="flex-1 ml-4">
        <Text
          style={{ fontSize: rf(1.8) }}
          // 2. font-bold -> font-main-bold
          className="text-white font-main-bold tracking-tight"
        >
          {player.playerName || "Unknown Player"}
        </Text>
        <Text
          style={{ fontSize: rf(0.9) }}
          // 3. font-black -> font-main-bold
          className="text-white/30 font-main-bold uppercase tracking-[2px]"
        >
          {rank === 1 ? "MVP Status" : "Operative"}
        </Text>
      </View>

      {/* Score */}
      <View className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-400/20">
        <Text
          style={{ fontSize: rf(1.8) }}
          // 4. font-black -> font-main-bold
          className="text-indigo-300 font-main-bold"
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
  if (
    !sortedScores?.length ||
    !playerNames?.length ||
    !selectedImages?.length
  ) {
    return null;
  }

  const playerIdToAvatarMap = new Map(
    playerNames
      .filter((player) => typeof player.id === "string")
      .map((player, index) => [
        player.id as string,
        player.avatarId ?? selectedImages[index],
      ]),
  );

  const playerNameToAvatarMap = new Map(
    playerNames.map((player, index) => [
      player.name,
      player.avatarId ?? selectedImages[index],
    ]),
  );

  return (
    <View className="w-full">
      {sortedScores.map((player, index) => {
        const rawPlayerAvatarId =
          (player.playerId && playerIdToAvatarMap.get(player.playerId)) ??
          playerNameToAvatarMap.get(player.playerName) ??
          0;
        const playerAvatarId =
          typeof rawPlayerAvatarId === "number" ? rawPlayerAvatarId : 0;

        return (
          <PlayerItem
            key={player.playerId ?? `${player.playerName}-${index}`}
            player={player}
            playerAvatarId={playerAvatarId}
            rank={index + 1}
          />
        );
      })}
    </View>
  );
};
