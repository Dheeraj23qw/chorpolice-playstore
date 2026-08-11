import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";

import QuizOptions from "@/components/chorPoliceQuiz/option";
import Timer from "@/components/thinkAndCountScreen/Timer";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { playerImages } from "@/constants/playerData";
import { Text } from "@/components/Text";
import { rf } from "@/utils/responsive";
import ScoringRules from "@/components/chorPoliceQuiz/ScoringRules";

const ScoreQuizRound = ({ g }: any) => {
  const players = g.scoreQuizPlayers?.length
    ? g.scoreQuizPlayers
    : ChorPoliceEngine.state.players;

  const currentPlayer = players[g.quizPlayerIndex];

  if (!currentPlayer) {
    return null;
  }

  const playerImage = playerImages[currentPlayer.avatarId] || playerImages[1];

  const isTargetPlayer = currentPlayer.id === g.localPlayerId;

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-5 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{
            opacity: 0,
            translateY: -12,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: "timing",
            duration: 300,
          }}
          className="mb-7 items-center"
        >
          <Text
            style={{ fontSize: rf(2.8) }}
            className="text-center font-main-bold text-white"
          >
            Boost Your Score
          </Text>
        </MotiView>

        {/* Timer */}
        <MotiView
          from={{
            opacity: 0,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "timing",
            duration: 300,
            delay: 100,
          }}
          className="mt-6 items-center"
        >
          <Timer countdown={g.quizCountdown ?? 7} variant="default" />
        </MotiView>

        {/* Quiz */}
        <View className="mt-7">
          <QuizOptions
            playerName={currentPlayer.name}
            playerImage={playerImage}
            questionNumber={g.quizPlayerIndex + 1}
            totalQuestions={4}
            options={g.quizOptions}
            onOptionPress={g.handleQuizOption}
            isActivePlayer={!g.quizOptionDisabled && !isTargetPlayer}
            hasGuessed={g.hasGuessedThisRound}
            isTargetPlayer={isTargetPlayer}
          />
        </View>
        <ScoringRules />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScoreQuizRound;
