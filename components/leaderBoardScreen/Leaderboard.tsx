import React from "react";
import { View, Image } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { rf, wp } from "@/utils/responsive";
import { Text } from "../Text";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";

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

  // L1 score and L2 bonus breakdown from engine if available
  const scoreEntry = player.playerId ? ChorPoliceEngine.state.scores[player.playerId] : null;
  const l2Bonus = scoreEntry?.level2Bonus ?? 0;
  const l1Score = scoreEntry ? (scoreEntry.totalScore - l2Bonus) : (player.totalScore ?? 0);
  const formattedL2Bonus = l2Bonus >= 0 ? `+${l2Bonus.toLocaleString()}` : l2Bonus.toLocaleString();

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
        className={`w-10 h-10 items-center justify-center rounded-xl mr-3 
          ${
            rank === 1
              ? "bg-indigo-500 shadow-lg shadow-indigo-500/50"
              : "bg-white/5"
          }`}
      >
        <Text
          style={{ fontSize: rf(1.6) }}
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
            style={{ width: wp(11), height: wp(11) }}
            className="rounded-full border border-white/20"
            resizeMode="cover"
          />
        )}
      </View>

      {/* Name + Score breakdown */}
      <View className="flex-1 ml-3">
        <Text
          style={{ fontSize: rf(1.7) }}
          className="text-white font-main-bold tracking-tight"
        >
          {player.playerName || "Unknown Player"}
        </Text>
        <Text
          style={{ fontSize: rf(0.9) }}
          className="text-indigo-300/60 font-main-bold uppercase tracking-[1px]"
        >
          L1: {l1Score.toLocaleString()}  |  L2: {formattedL2Bonus}
        </Text>
      </View>

      {/* Final Score */}
      <View className="bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-400/20 items-end">
        <Text
          style={{ fontSize: rf(1.8) }}
          className="text-indigo-300 font-main-bold"
        >
          {(player.totalScore ?? 0).toLocaleString()}
        </Text>
        <Text
          style={{ fontSize: rf(0.7) }}
          className="text-indigo-400/50 font-main-bold uppercase tracking-[1px]"
        >
          Final
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
