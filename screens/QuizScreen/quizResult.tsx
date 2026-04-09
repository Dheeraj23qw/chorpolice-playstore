import React, { useEffect } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, wp } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { RootState } from "@/redux/store";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
// Removed ExitConfirmationModal import

export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  const { handleQuit, handleStats, handleEarn } = useQuizGameLogic();

  const Message = useRandomMessage(isWinner ? "winner" : "loser");
  const { reward, message: coinsAwarded } = useQuizReward();
  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  useEffect(() => {
    AudioEngine.stop("timer");
  }, [isWinner]);

  const statusColor = isWinner ? "#10b981" : "#ef4444";

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/80" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingTop: insets.top + hp(2),
          paddingBottom: hp(5),
        }}
      >
        <View className="items-center py-4">
          <Text
            className="font-main-bold text-[48px] tracking-tighter"
            style={{
              color: "white",
              textShadowColor: statusColor,
              textShadowRadius: 15,
              textShadowOffset: { width: 0, height: 0 },
            }}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Text>
          <View
            className="mt-[-4px] h-1 w-12 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
        </View>

        <View className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-2xl">
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            accuracy={accuracy}
          />
        </View>

        <View className="mt-12 px-2">
          <ActionButtons
            onStatsPress={handleStats}
            onEarnPress={handleEarn}
            onHomePress={() => handleQuit()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
