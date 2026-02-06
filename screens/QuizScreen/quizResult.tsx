import React, { useEffect, useState, useCallback } from "react";
import { View, StatusBar, BackHandler, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";

import { hp, wp } from "@/utils/responsive";
import useRandomMessage from "@/hooks/useRandomMessage";
import CustomRatingModal from "@/modal/RatingModal";
import { RootState } from "@/redux/store";
import { resetDifficulty } from "@/redux/reducers/quiz";

import { ResultInfo } from "./components/reseltInfo";
import { RenderButtons } from "./components/renderButtons";
import { handleShare } from "@/utils/share";
import { AudioEngine } from "@/audio/audioEngine";
import { creditCoins } from "@/features/wallet/walletSlice";

export default function QuizResult() {
  const [modalVisible, setModalVisible] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    correctQuestions: Correct,
    totalQuestions: Total,
    isWinner,
    level,
  } = useSelector((state: RootState) => state.difficulty);

  const Message = useRandomMessage("a", isWinner ? "winner" : "loser");

  /* ------------------ COIN REWARD ------------------ */

 useEffect(() => {
  if (!level) return;

  const coinValues = {
    easy: isWinner ? 250 : 40,
    medium: isWinner ? 800 : 100,
    hard: isWinner ? 2000 : 200,
  } as const;

  const reward = coinValues[level];

  // ✅ Credit to wallet instead of old coins store
  dispatch(
    creditCoins({
      amount: reward,
      reason: isWinner ? "Quiz Win" : "Quiz Participation",
      source: "quiz_reward",
      metadata: {
        level,               // easy/medium/hard
        isWinner,            // true/false
        correctQuestions: Correct,
        totalQuestions: Total,
      },
    })
  );

  setCoinsAwarded(
    isWinner
      ? `You won ${reward} coins!`
      : `Participation Reward: ${reward} coins`,
  );
}, [level, isWinner, Correct, Total, dispatch]);


  useEffect(() => {
    AudioEngine.stop("timer");
  }, []);

  /* ------------------ QUIT HANDLER ------------------ */

  const handleQuit = useCallback(() => {
    dispatch(resetDifficulty());
    router.replace("/modeselect");
  }, [dispatch, router]);

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
          />
        </View>

        <RenderButtons
          handleShare={handleShare}
          handleHome={handleHome}
          toggleModal={toggleModal}
        />
      </View>

      <CustomRatingModal
        visible={modalVisible}
        onClose={toggleModal}
        title="Enjoying the Journey?"
      />
    </View>
  );
}
