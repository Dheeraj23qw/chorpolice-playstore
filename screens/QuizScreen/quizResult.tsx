import React, { useEffect, useState, useCallback } from "react";
import { View, StatusBar, BackHandler, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import useRandomMessage from "@/hooks/useRandomMessage";
import { RootState } from "@/redux/store";

import { ResultInfo } from "./components/reseltInfo";
import { AudioEngine } from "@/audio/audioEngine";
import { useQuizReward } from "@/hooks/useQuizRewards";
import { ActionButtons } from "./components/renderButtons";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
  } = useSelector((state: RootState) => state.difficulty);

  const { handleQuit, handleStats, handleEarn } = useQuizGameLogic();

  const Message = useRandomMessage(isWinner ? "winner" : "loser");
  /* ------------------ STOP AUDIO ------------------ */
  useEffect(() => {
    AudioEngine.stop("timer");
  }, []);

  /* ------------------ BACK HANDLER ------------------ */
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Hold on!",
        "Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: handleQuit },
        ],
        { cancelable: true },
      );
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [handleQuit]);

  /* ------------------ BUTTON HANDLERS ------------------ */
  const handleHome = useCallback(() => {
    handleQuit();
  }, [handleQuit]);

  const toggleModal = useCallback(() => {
    setModalVisible((prev) => !prev);
  }, []);

  const { reward, message: coinsAwarded } = useQuizReward();
  const accuracy = Total > 0 ? Math.round((Correct / Total) * 100) : 0;

  /* ------------------ RENDER ------------------ */
  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

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
            accuracy={accuracy} // 👈 add this
          />
        </View>

        <ActionButtons
          onStatsPress={handleStats}
          onEarnPress={handleEarn}
          onHomePress={handleHome}
        />
      </View>
    </View>
  );
}
