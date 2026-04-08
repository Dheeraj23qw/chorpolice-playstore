import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, wp, rf } from "@/utils/responsive";
import { Text } from "@/components/Text";
import useRandomMessage from "@/hooks/useRandomMessage";
import { RootState } from "@/redux/store";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import ExitConfirmationModal from "@/modal/ExitModal";

export default function QuizResult() {
  const insets = useSafeAreaInsets();
  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);
  const { handleQuit, handleStats, handleEarn } = useQuizGameLogic();

  const [showCoins, setShowCoins] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const Message = useRandomMessage(isWinner ? "winner" : "loser");
  const { reward, message: coinsAwarded } = useQuizReward();
  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  useEffect(() => {
    AudioEngine.stop("timer");
  }, [isWinner]);

  useEffect(() => {
    if (reward) setShowCoins(true);
  }, [reward]);

  const accentColor = isWinner ? "#10b981" : "#ef4444";

  return (
    <View className="flex-1 bg-[#050505]">
      {/* Premium Ambient Background */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(5),
          paddingTop: insets.top + hp(2),
          paddingBottom: hp(5),
        }}
      >
        {/* Header Section */}
        <View className="items-center py-4">
          <Text
            className="font-main-bold text-[48px] tracking-tighter text-white"
            style={{
              textShadowColor: "rgba(255,255,255,0.1)",
              textShadowRadius: 20,
            }}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </Text>
        </View>

        {/* Main Result Card */}
        <View className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            accuracy={accuracy}
          />
        </View>

        {/* Action Section */}
        <View className="mt-12">
          <ActionButtons
            onStatsPress={handleStats}
            onEarnPress={handleEarn}
            onHomePress={() => handleQuit()}
          />
        </View>
      </ScrollView>

      <ExitConfirmationModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={handleQuit}
      />
    </View>
  );
}
