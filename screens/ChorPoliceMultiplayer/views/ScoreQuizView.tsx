import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import QuizOptions from "@/components/chorPoliceQuiz/option";
import Timer from "@/components/thinkAndCountScreen/Timer";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";

const ScoreQuizView = ({ g }: any) => {
  const players = g.scoreQuizPlayers?.length
    ? g.scoreQuizPlayers
    : ChorPoliceEngine.state.players;
  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) return null;

  const playerImage = playerImages[currentPlayer.avatarId] || playerImages[1];
  const isTargetPlayer = currentPlayer.id === g.localPlayerId;

  if (g.isDynamicPopUp && g.mediaId != null && g.mediaType != null) {
    return (
      <DynamicOverlayPopUp
        isPopUp={g.isDynamicPopUp}
        mediaId={g.mediaId}
        mediaType={g.mediaType}
        closeVisibleDelay={3000}
        playerData={g.playerData}
      />
    );
  }

  if (g.showQuizLeaderboard) {
    const leaderboard = ChorPoliceEngine.getLeaderboard();

    return (
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 justify-center px-5">
          <MotiView
            from={{ opacity: 0, translateY: 18 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 320 }}
          >
            <View className="mb-5 flex-row items-center justify-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15">
                <Ionicons name="trophy" size={rf(2.4)} color="#FACC15" />
              </View>
              <View>
                <Text
                  style={{ fontSize: rf(1.05) }}
                  className="font-main-bold tracking-[2px] text-amber-300"
                >
                  ROUND COMPLETE
                </Text>
                <Text
                  style={{ fontSize: rf(2.55) }}
                  className="font-main-bold text-white"
                >
                  Live rankings
                </Text>
              </View>
            </View>

            <View className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111329] px-4">
              {leaderboard.map((entry, index) => (
                <MotiView
                  key={entry.id || index}
                  from={{ opacity: 0, translateX: -12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "timing", duration: 260, delay: 80 + index * 70 }}
                  className={`min-h-[68px] flex-row items-center ${
                    index < leaderboard.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <View
                    className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${
                      index === 0
                        ? "bg-amber-400/20"
                        : index === 1
                          ? "bg-slate-300/15"
                          : "bg-indigo-400/15"
                    }`}
                  >
                    <Text
                      style={{ fontSize: rf(1.4) }}
                      className="font-main-bold text-white"
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: rf(1.75) }}
                    className="mr-3 flex-1 font-main-bold text-white"
                  >
                    {entry.name}
                  </Text>
                  <Text
                    style={{ fontSize: rf(1.7) }}
                    className="font-main-bold text-indigo-200"
                  >
                    {entry.totalScore.toLocaleString()}
                  </Text>
                </MotiView>
              ))}
            </View>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-5 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 280 }}
          className="mb-2 flex-row items-center justify-between"
        >
          <View>
            <Text
              style={{ fontSize: rf(1) }}
              className="font-main-bold tracking-[2px] text-indigo-300"
            >
              LEVEL 2 • SCORE BOOST
            </Text>
            <Text
              style={{ fontSize: rf(2.35) }}
              className="mt-0.5 font-main-bold text-white"
            >
              Read the room
            </Text>
          </View>
          <Timer countdown={g.quizCountdown ?? 7} variant="compact" />
        </MotiView>

        <QuizOptions
          playerName={currentPlayer.name}
          playerImage={playerImage}
          questionNumber={g.quizPlayerIndex + 1}
          totalQuestions={players.length}
          options={g.quizOptions}
          onOptionPress={g.handleQuizOption}
          isActivePlayer={!g.quizOptionDisabled}
          hasGuessed={g.hasGuessedThisRound}
          isTargetPlayer={isTargetPlayer}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScoreQuizView;
