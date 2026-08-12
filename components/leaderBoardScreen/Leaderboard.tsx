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
  coinChanges?: Record<string, number>;
}

interface PlayerItemProps {
  player?: PlayerScore;
  playerAvatarId?: number;
  rank?: number;
  coinChange?: number;
}

/**
 * Responsive leaderboard columns.
 *
 * Fixed columns remain compact.
 * Player column automatically takes remaining space.
 */
const COL = {
  rank: wp(9),
  avatar: wp(13),
  earning: wp(16),
  score: wp(16),
};

const AVATAR_SIZE = wp(10);

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  playerAvatarId,
  rank,
  coinChange,
}) => {
  const playerImages =
    useSelector((state: RootState) => state.playerImages?.images) ?? [];

  if (!player || playerAvatarId == null || rank == null) {
    return null;
  }

  const playerImage = playerImages[playerAvatarId]?.src ?? null;

  const isWinner = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;
  const isTopRank = rank <= 3;

  const scoreEntry = player.playerId
    ? ChorPoliceEngine.state.scores[player.playerId]
    : null;

  const l2Bonus = scoreEntry?.level2Bonus ?? 0;

  const l1Score = scoreEntry
    ? scoreEntry.totalScore - l2Bonus
    : (player.totalScore ?? 0);

  const formattedL2Bonus =
    l2Bonus >= 0 ? `+${l2Bonus.toLocaleString()}` : l2Bonus.toLocaleString();

  const hasCoinChange = typeof coinChange === "number";
  const isCoinGain = hasCoinChange && coinChange >= 0;

  return (
    <View
      className={`mb-2.5 overflow-hidden rounded-2xl border ${
        isWinner
          ? "border-amber-300/30 bg-amber-400/[0.08]"
          : isSecond
            ? "border-slate-300/20 bg-white/[0.055]"
            : isThird
              ? "border-orange-300/20 bg-orange-400/[0.045]"
              : "border-white/[0.08] bg-white/[0.025]"
      }`}
    >
      <View className="min-h-[74px] flex-row items-center px-3 py-2.5">
        {/* RANK */}
        <View
          style={{ width: COL.rank }}
          className="shrink-0 items-center justify-center"
        >
          <View
            className={`h-8 w-8 items-center justify-center rounded-xl ${
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
              <Ionicons name="trophy" size={rf(1.55)} color="#FACC15" />
            ) : (
              <Text
                style={{ fontSize: rf(1.2) }}
                className={`font-main-bold ${
                  isTopRank ? "text-white" : "text-white/45"
                }`}
              >
                {rank}
              </Text>
            )}
          </View>
        </View>

        {/* AVATAR */}
        <View
          style={{ width: COL.avatar }}
          className={`mr-2 shrink-0 items-center justify-center rounded-full p-[2px] ${
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
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                }}
                className="items-center justify-center"
              >
                <Ionicons name="person" size={rf(2)} color="#ffffff50" />
              </View>
            )}
          </View>
        </View>

        {/* PLAYER */}
        <View className="min-w-0 flex-1 pr-2">
          <View className="flex-row items-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: rf(1.5) }}
              className={`min-w-0 flex-1 font-main-bold ${
                isWinner ? "text-amber-100" : "text-white"
              }`}
            >
              {player.playerName || "Unknown Player"}
            </Text>

            {isWinner && (
              <View className="ml-1.5 shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5">
                <Text
                  style={{ fontSize: rf(0.7) }}
                  className="font-main-bold tracking-wider text-amber-300"
                >
                  #1
                </Text>
              </View>
            )}
          </View>

          {/* L1 / L2 */}
          <View className="mt-1.5 flex-row items-center">
            <View className="flex-row items-center">
              <Text
                style={{ fontSize: rf(0.8) }}
                className="font-main-bold text-white/35"
              >
                L1
              </Text>

              <Text
                style={{ fontSize: rf(0.88) }}
                className="ml-0.5 font-main-bold text-white/65"
              >
                {l1Score.toLocaleString()}
              </Text>
            </View>

            <View className="mx-2 h-3 w-px bg-white/10" />

            <View className="flex-row items-center">
              <Text
                style={{ fontSize: rf(0.8) }}
                className="font-main-bold text-indigo-300/50"
              >
                L2
              </Text>

              <Text
                style={{ fontSize: rf(0.88) }}
                className={`ml-0.5 font-main-bold ${
                  l2Bonus > 0 ? "text-indigo-300" : "text-white/45"
                }`}
              >
                {formattedL2Bonus}
              </Text>
            </View>
          </View>
        </View>

        {/* EARNING */}
        <View
          style={{ width: COL.earning }}
          className={`ml-1 shrink-0 items-end rounded-xl border px-1.5 py-1.5 ${
            isCoinGain
              ? "border-emerald-300/20 bg-emerald-400/10"
              : "border-white/[0.06] bg-white/[0.03]"
          }`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{ fontSize: rf(1.3) }}
            className={`font-main-bold ${
              isCoinGain ? "text-emerald-300" : "text-white/30"
            }`}
          >
            {hasCoinChange
              ? `${coinChange >= 0 ? "+" : ""}${coinChange.toLocaleString()}`
              : "0"}
          </Text>

          <Text
            style={{ fontSize: rf(0.62) }}
            className={`mt-0.5 font-main-bold tracking-[0.7px] ${
              isCoinGain ? "text-emerald-300/50" : "text-white/25"
            }`}
          >
            {hasCoinChange && coinChange < 0 ? "LOST" : "EARN"}
          </Text>
        </View>

        {/* SCORE */}
        <View
          style={{ width: COL.score }}
          className={`ml-1.5 shrink-0 items-end rounded-xl border px-1.5 py-1.5 ${
            isWinner
              ? "border-amber-300/20 bg-amber-400/10"
              : "border-indigo-400/15 bg-indigo-500/[0.08]"
          }`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={{ fontSize: rf(1.4) }}
            className={`font-main-bold ${
              isWinner ? "text-amber-300" : "text-indigo-200"
            }`}
          >
            {(player.totalScore ?? 0).toLocaleString()}
          </Text>

          <Text
            style={{ fontSize: rf(0.62) }}
            className={`mt-0.5 font-main-bold tracking-[0.7px] ${
              isWinner ? "text-amber-300/50" : "text-indigo-300/40"
            }`}
          >
            FINAL
          </Text>
        </View>
      </View>

      {/* WINNER ACCENT */}
      {isWinner && <View className="h-[2px] w-full bg-amber-300/30" />}
    </View>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  sortedScores,
  playerNames,
  selectedImages,
  coinChanges,
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
      {/* HEADER */}
      <View className="mb-2 flex-row items-center px-3">
        <View style={{ width: COL.rank }} className="shrink-0">
          <Text
            style={{ fontSize: rf(0.78) }}
            className="font-main-bold tracking-[1.5px] text-white/30"
          >
            RANK
          </Text>
        </View>

        <View style={{ width: COL.avatar }} className="mr-2 shrink-0" />

        <View className="min-w-0 flex-1 pr-2">
          <Text
            style={{ fontSize: rf(0.78) }}
            className="font-main-bold tracking-[1.5px] text-white/30"
          >
            PLAYER
          </Text>
        </View>

        <Text
          style={{
            width: COL.earning,
            fontSize: rf(0.78),
          }}
          className="shrink-0 text-right font-main-bold tracking-[1.5px] text-white/30"
        >
          EARNING
        </Text>

        <Text
          style={{
            width: COL.score,
            fontSize: rf(0.78),
          }}
          className="ml-1.5 shrink-0 text-right font-main-bold tracking-[1.5px] text-white/30"
        >
          SCORE
        </Text>
      </View>

      {/* ROWS */}
      {sortedScores.map((player, index) => {
        const rawPlayerAvatarId =
          (player.playerId && playerIdToAvatarMap.get(player.playerId)) ??
          playerNameToAvatarMap.get(player.playerName) ??
          0;

        const playerAvatarId =
          typeof rawPlayerAvatarId === "number" ? rawPlayerAvatarId : 0;

        const playerKey = player.playerId ?? player.playerName ?? `${index}`;

        const change = coinChanges?.[playerKey];

        return (
          <PlayerItem
            key={player.playerId ?? `${player.playerName}-${index}`}
            player={player}
            playerAvatarId={playerAvatarId}
            rank={index + 1}
            coinChange={change}
          />
        );
      })}
    </View>
  );
};
