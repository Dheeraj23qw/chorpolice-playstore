import React, { useEffect, useState, useCallback } from "react";
import { View, BackHandler } from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hp, wp } from "@/utils/responsive";
import useRandomMessage from "@/hooks/useRandomMessage";
import { RootState } from "@/redux/store";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import CoinsRewardModal from "@/modal/CoinPopup";
import ExitConfirmationModal from "@/modal/ExitModal";
import InfoTooltip from "@/components/InfoTooltip";

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

  /* ---------------- STOP AUDIO ---------------- */
  useEffect(() => {
    AudioEngine.stop("timer");
  }, []);

  /* ---------------- SHOW COINS MODAL ---------------- */
  useEffect(() => {
    if (reward !== undefined && reward !== null) {
      setShowCoins(true);
    }
  }, [reward]);

  /* ---------------- BACK HANDLER ---------------- */
  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [handleQuit]);

  const handleHome = useCallback(() => {
    handleQuit();
  }, [handleQuit]);

  return (
    <View className="flex-1 bg-[#09090b] relative">
      {/* 🔥 Top Right Info Button */}
      <View
        style={{
          top: insets.top + hp(2.5), // responsive top spacing
          right: wp(14), // responsive right spacing
        }}
        className="absolute z-50"
      >
        <InfoTooltip text="To win any quiz match, you must answer all 7 questions correctly." />
      </View>

      {/* Background Glows */}
      <View
        style={{ width: wp(120), height: wp(120), top: -hp(15), left: -wp(30) }}
        className={`absolute rounded-full opacity-20 blur-[100px] ${
          isWinner ? "bg-emerald-500" : "bg-indigo-600"
        }`}
      />

      <View
        style={{
          width: wp(100),
          height: wp(100),
          bottom: -hp(10),
          right: -wp(20),
        }}
        className={`absolute rounded-full opacity-10 blur-[100px] ${
          isWinner ? "bg-emerald-600" : "bg-purple-600"
        }`}
      />

      {/* Main Content */}
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: wp(4) }}
      >
        <View style={{ marginBottom: hp(2) }}>
          <ResultInfo
            Correct={Correct}
            Total={Total}
            Message={Message}
            coinsMessage={coinsAwarded}
            isWinner={isWinner}
            accuracy={accuracy}
          />
        </View>

        <ActionButtons
          onStatsPress={handleStats}
          onEarnPress={handleEarn}
          onHomePress={handleHome}
        />

        <CoinsRewardModal
          visible={showCoins}
          amount={reward}
          onClaim={() => setShowCoins(false)}
        />
      </View>

      <ExitConfirmationModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          handleQuit();
        }}
      />
    </View>
  );
}
