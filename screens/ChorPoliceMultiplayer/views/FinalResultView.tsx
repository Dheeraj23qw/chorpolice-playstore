import React, { useMemo, memo } from "react";
import { View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { RootState } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { WinnerSection } from "@/components/leaderBoardScreen/WinnerSection";
import { Leaderboard } from "@/components/leaderBoardScreen/Leaderboard";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { getSessionContext } from "@/service/lanGameService";
import { ActionButtons } from "@/screens/QuizScreen/components/renderButtons";

const MemoizedLeaderboard = memo(Leaderboard);
const MemoizedWinnerSection = memo(WinnerSection);

const FinalResultView = ({ onExit }: any) => {
  const playerScoresRedux = useSelector(
    (state: RootState) => state.player.playerScores,
  );
  const selectedImages = useSelector(
    (state: RootState) => state.player.selectedImages,
  );
  const playerNamesList = useSelector(
    (state: RootState) => state.player.playerNames,
  );

  const sortedScores = useMemo(() => {
    if (!playerScoresRedux?.length) return [];
    return [...playerScoresRedux].sort(
      (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0),
    );
  }, [playerScoresRedux]);

  const winner = sortedScores[0];

  const winnerMeta = playerNamesList.find((player) =>
    winner?.playerId
      ? player.id === winner.playerId
      : player.name === winner?.playerName,
  );

  const winnerIdx = playerNamesList.findIndex((player) =>
    winner?.playerId
      ? player.id === winner.playerId
      : player.name === winner?.playerName,
  );

  const winnerAvatarId =
    winnerMeta?.avatarId ?? (winnerIdx >= 0 ? selectedImages[winnerIdx] : 1);

  const winnerImage = playerImages[winnerAvatarId]?.src ?? playerImages[1]?.src;

  const totalPot =
    ChorPoliceEngine.state.totalPot || ChorPoliceEngine.state.stake * 4;

  const { localPlayerId } = getSessionContext();
  const isLocalWinner = winner?.playerId === localPlayerId;

  return (
    <View className="flex-1 bg-black">
      {/* 🔥 Background Image */}
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {/* Content */}
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Winner */}
        {winner && (
          <View className="pt-4">
            <MemoizedWinnerSection
              winnerName={winner.playerName}
              winnerImage={winnerImage}
              winner={winner}
            />
          </View>
        )}

        {/* Pot */}
        {totalPot > 0 && (
          <View className="mb-3 items-center">
            <View className="w-[92%] flex-row items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-950/40 py-3">
              <Text className="text-base font-medium text-indigo-100">
                {isLocalWinner ? "You won" : "Winner takes"}
              </Text>
              <Text className="mx-2 text-base font-bold text-white">
                + {Number(totalPot || 0).toLocaleString()} coins
              </Text>
              <Text className="text-base">💰⚡</Text>
            </View>
          </View>
        )}

        {/* List */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-2">
            <MemoizedLeaderboard
              sortedScores={sortedScores}
              playerNames={playerNamesList}
              selectedImages={selectedImages}
            />
          </View>

          {/* Buttons */}
          <View className="mt-2 px-4">
            <ActionButtons
              onStatsPress={() => onExit("stats")}
              onEarnPress={() => onExit("earn")}
              onHomePress={() => onExit("home")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default memo(FinalResultView);
