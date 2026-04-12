import React, { memo, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp, rf } from "@/utils/responsive";

// Components
import GameTable from "../../components/thinkAndCountScreen/GameTable";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import Timer from "../../components/thinkAndCountScreen/Timer";

import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

import { Text } from "@/components/Text";
import { MultiplayerLeaderboard } from "../../components/QuizScreen/MultiplayerLeaderboard";
import { QuizEngine } from "@/service/QuizEngine";
import { NUM_QUESTIONS } from "@/constants/quizConstants";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const QuizScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    countdown,
    isDynamicPopUp,
    mediaId,
    mediaType,
    remainingOptions,
    isFiftyFiftyActive,
    handleFiftyFifty,
    handleNextQuestion,
    handleAnswerSelection,
    isTableOpen,
    setIsTableOpen,
    questionIndex,
    table,
    question,
    playerMessage,

    handleQuitInMiddle,
    handleQuit,
    isLeaderboardVisible,
    leaderboardData,
    isMultiplayer,
    isWaitingForOthers,
    roundProgress,
    localPlayerId,
  } = useQuizGameLogic();

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit", "Are you sure you want to exit?", [
        {
          text: "No",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            handleQuit();
          },
        },
      ]);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [handleQuit]);

  const onOptionPress = useCallback(
    (value: string) => {
      handleAnswerSelection(value);
    },
    [handleAnswerSelection],
  );

  /**
   * BLOCKED STATE: When waiting for others OR leaderboard is visible,
   * the question content must NOT be rendered at all.
   * This prevents players from reading the next question early.
   */
  const isContentBlocked = isWaitingForOthers || isLeaderboardVisible;

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {/* ⏳ WAITING OVERLAY — Fully opaque, NO content visible behind */}
      {isWaitingForOthers && (
        <View className="absolute z-[70] h-full w-full items-center justify-center bg-black">
          <Image
            source={require("@/assets/images/bg/image.png")}
            className="absolute h-full w-full opacity-20"
            resizeMode="cover"
          />
          <View className="items-center rounded-3xl border border-white/10 bg-white/5 p-8">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20">
              <Ionicons name="people-outline" size={32} color="#818cf8" />
            </View>
            <Text className="font-main-bold text-lg text-white">
              Waiting for Friends
            </Text>
            <Text className="font-main-regular mt-2 text-center text-xs uppercase tracking-widest text-white/40">
              Other players are still{"\n"}answering the question...
            </Text>
            <View className="mt-6 h-1 w-20 rounded-full bg-indigo-500/50" />
          </View>
        </View>
      )}

      {isTableOpen ? (
        <View className="z-[60] flex-1">
          <GameTable
            isTableOpen={isTableOpen}
            setIsTableOpen={setIsTableOpen}
            table={table}
          />
        </View>
      ) : isDynamicPopUp ? (
        <View className="z-[60] flex-1 items-center justify-center">
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={3000}
            playerData={playerMessage}
          />
        </View>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              paddingTop: insets.top > 0 ? insets.top : hp(2),
              paddingBottom: insets.bottom,
            }}
          >
            <View
              style={{
                top: insets.top > 0 ? insets.top + hp(1) : hp(7),
                paddingHorizontal: wp(5),
                paddingVertical: hp(1),
              }}
              className="absolute z-50 self-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
            >
              <Text
                style={{ fontSize: rf(1.4) }}
                className="font-main-bold uppercase tracking-[3px] text-indigo-400"
              >
                {isLeaderboardVisible
                  ? `Round ${questionIndex + 1} Results`
                  : `Question ${questionIndex + 1}`}
              </Text>
            </View>

            <View style={{ marginTop: hp(8) }}>
              {!isContentBlocked && <Timer countdown={countdown} />}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: wp(6),
                paddingTop: hp(2),
                paddingBottom: hp(10),
                flexGrow: 1,
              }}
            >
              {isLeaderboardVisible ? (
                <MultiplayerLeaderboard
                  round={questionIndex + 1}
                  data={leaderboardData}
                  roundProgress={roundProgress}
                  timeLeft={countdown}
                  onNext={handleNextQuestion}
                  isHost={
                    QuizEngine.state.playerScores["host_id"] !== undefined
                  }
                  isLastRound={questionIndex + 1 >= NUM_QUESTIONS}
                  totalPot={QuizEngine.state.totalPot}
                  localPlayerId={localPlayerId}
                />
              ) : !isContentBlocked ? (
                /* Only render question content when NOT blocked */
                <View>
                  <QuestionSection question={question?.question} />

                  <View
                    style={{ marginTop: hp(1), marginBottom: hp(1) }}
                    className="items-center"
                  >
                    <View className="mb-4 h-[1px] w-20 bg-white/10" />
                    <Text
                      style={{ fontSize: rf(1.4) }}
                      className="text-center font-main-md uppercase tracking-widest text-white/40"
                    >
                      Consult the Quiz table to solve
                    </Text>
                  </View>

                  <View style={{ marginTop: hp(4) }}>
                    <OptionsSection
                        options={
                          isFiftyFiftyActive
                            ? remainingOptions
                            : question?.options
                        }
                        handleAnswerSelection={onOptionPress}
                      />
                  </View>

                  <View style={{ marginTop: hp(1) }}>
                    <QuizButton
                      showHint={false}
                      setIsTableOpen={setIsTableOpen}
                      handleNextQuestion={handleNextQuestion}
                      handleFiftyFifty={handleFiftyFifty}
                    />
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

export default memo(QuizScreen);
