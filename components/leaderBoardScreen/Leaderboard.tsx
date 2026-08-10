import React from "react";
import { View, Image } from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

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
  playerNames: {
    id: string | number;
    name: string;
    avatarId?: number;
  }[];
  selectedImages: number[];
}

interface PlayerItemProps {
  player?: PlayerScore;
  playerAvatarId?: number;
  rank?: number;
}

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  playerAvatarId,
  rank,
}) => {
  const playerImages =
    useSelector((state: RootState) => state.playerImages?.images) ?? [];

  // Safety guards
  if (!player || playerAvatarId == null || rank == null) {
    return null;
  }

  const playerImage = playerImages?.[playerAvatarId]?.src ?? null;

  const isWinner = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const isTopRank = rank <= 3;

  // Score breakdown from engine
  const scoreEntry = player.playerId
    ? ChorPoliceEngine.state.scores[player.playerId]
    : null;

  const l2Bonus = scoreEntry?.level2Bonus ?? 0;

  const l1Score = scoreEntry
    ? scoreEntry.totalScore - l2Bonus
    : (player.totalScore ?? 0);

  const formattedL2Bonus =
    l2Bonus >= 0 ? `+${l2Bonus.toLocaleString()}` : l2Bonus.toLocaleString();

  return (
    <View
      className={`mb-3 overflow-hidden rounded-[24px] border ${
        isWinner
          ? "border-amber-300/30 bg-amber-400/[0.08]"
          : isSecond
            ? "border-slate-300/20 bg-white/[0.055]"
            : isThird
              ? "border-orange-300/20 bg-orange-400/[0.045]"
              : "border-white/[0.08] bg-white/[0.025]"
      }`}
    >
      <View className="flex-row items-center px-4 py-3.5">
        {/* Rank */}
        <View className="mr-3 w-9 items-center">
          <View
            className={`h-9 w-9 items-center justify-center rounded-xl ${
              isWinner
                ? "bg-amber-400/20"
                : isSecond
                  ? "bg-slate-300/15"
                  : isThird
                    ? "bg-orange-400/15"
                    : "bg-white/[0.06]"
            }`}
          >
            {isWinner ? (
              <Ionicons name="trophy" size={rf(1.65)} color="#FACC15" />
            ) : (
              <Text
                style={{ fontSize: rf(1.3) }}
                className={`font-main-bold ${
                  isTopRank ? "text-white" : "text-white/45"
                }`}
              >
                {rank}
              </Text>
            )}
          </View>
        </View>

        {/* Avatar */}
        <View
          className={`mr-3 rounded-full p-[2px] ${
            isWinner
              ? "bg-amber-300/40"
              : isTopRank
                ? "bg-indigo-400/30"
                : "bg-white/10"
          }`}
        >
          <View className="overflow-hidden rounded-full bg-white/[0.06]">
            {playerImage ? (
              <Image
                source={
                  typeof playerImage === "string"
                    ? { uri: playerImage }
                    : playerImage
                }
                style={{
                  width: wp(11),
                  height: wp(11),
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: wp(11),
                  height: wp(11),
                }}
                className="items-center justify-center"
              >
                <Ionicons name="person" size={rf(2.2)} color="#ffffff50" />
              </View>
            )}
          </View>
        </View>

        {/* Player information */}
        <View className="min-w-0 flex-1 pr-2">
          <View className="flex-row items-center">
            <Text
              numberOfLines={1}
              style={{ fontSize: rf(1.65) }}
              className={`flex-1 font-main-bold ${
                isWinner ? "text-amber-100" : "text-white"
              }`}
            >
              {player.playerName || "Unknown Player"}
            </Text>

            {isWinner && (
              <View className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5">
                <Text
                  style={{ fontSize: rf(0.72) }}
                  className="font-main-bold tracking-wider text-amber-300"
                >
                  #1
                </Text>
              </View>
            )}
          </View>

          {/* Score breakdown */}
          <View className="mt-1.5 flex-row items-center">
            <View className="mr-2 flex-row items-center">
              <Text
                style={{ fontSize: rf(0.82) }}
                className="font-main-bold text-white/35"
              >
                L1
              </Text>

              <Text
                style={{ fontSize: rf(0.9) }}
                className="ml-1 font-main-bold text-white/65"
              >
                {l1Score.toLocaleString()}
              </Text>
            </View>

            <View className="h-3 w-px bg-white/10" />

            <View className="ml-2 flex-row items-center">
              <Text
                style={{ fontSize: rf(0.82) }}
                className="font-main-bold text-indigo-300/50"
              >
                L2
              </Text>

              <Text
                style={{ fontSize: rf(0.9) }}
                className={`ml-1 font-main-bold ${
                  l2Bonus > 0 ? "text-indigo-300" : "text-white/45"
                }`}
              >
                {formattedL2Bonus}
              </Text>
            </View>
          </View>
        </View>

        {/* Final Score */}
        <View
          className={`min-w-[68px] items-end rounded-2xl border px-3 py-2 ${
            isWinner
              ? "border-amber-300/20 bg-amber-400/10"
              : "border-indigo-400/15 bg-indigo-500/[0.08]"
          }`}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: rf(1.55) }}
            className={`font-main-bold ${
              isWinner ? "text-amber-300" : "text-indigo-200"
            }`}
          >
            {(player.totalScore ?? 0).toLocaleString()}
          </Text>

          <Text
            style={{ fontSize: rf(0.68) }}
            className={`mt-0.5 font-main-bold tracking-[1px] ${
              isWinner ? "text-amber-300/50" : "text-indigo-300/40"
            }`}
          >
            FINAL
          </Text>
        </View>
      </View>

      {/* Winner accent */}
      {isWinner && <View className="h-[2px] w-full bg-amber-300/30" />}
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

  const playerIdToAvatarMap = new Map<string, number>(
    playerNames
      .filter((player) => typeof player.id === "string")
      .map((player, index) => [
        player.id as string,
        player.avatarId ?? selectedImages[index],
      ]),
  );

  const playerNameToAvatarMap = new Map<string, number>(
    playerNames.map((player, index) => [
      player.name,
      player.avatarId ?? selectedImages[index],
    ]),
  );

  return (
    <View className="w-full">
      {/* Table Header */}
      <View className="mb-3 flex-row items-center px-4">
        <Text
          style={{ fontSize: rf(0.82) }}
          className="w-12 font-main-bold tracking-[1.5px] text-white/30"
        >
          RANK
        </Text>

        <Text
          style={{ fontSize: rf(0.82) }}
          className="flex-1 font-main-bold tracking-[1.5px] text-white/30"
        >
          PLAYER
        </Text>

        <Text
          style={{ fontSize: rf(0.82) }}
          className="font-main-bold tracking-[1.5px] text-white/30"
        >
          SCORE
        </Text>
      </View>

      {/* Players */}
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
