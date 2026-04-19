import React, { memo, useCallback, useEffect } from "react";
import { View, ScrollView, Image, BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp, rf } from "@/utils/responsive";

// Components
import GameTable from "../../components/thinkAndCountScreen/GameTable";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import Timer from "../../components/thinkAndCountScreen/Timer";

import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import QuizExitModal from "@/modal/QuizExitModal";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

import { Text } from "@/components/Text";
import { QuizEngine } from "@/service/QuizEngine";
import { NUM_QUESTIONS } from "@/constants/quizConstants";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { QuizLeaderboard } from "@/components/MultiPlayerQuizLeaderboard/QuizLeaderboard";
import { WaitingState } from "@/components/MultiPlayerQuizLeaderboard/WaitingState";

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
    isExitModalVisible,
    handleConfirmExit,
    handleCancelExit,
    isHost,
  } = useQuizGameLogic();

  useEffect(() => {
    const backAction = () => {
      handleQuitInMiddle();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, [handleQuitInMiddle]);

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
          <WaitingState />
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
                <QuizLeaderboard
                  round={questionIndex + 1}
                  data={leaderboardData}
                  roundProgress={roundProgress}
                  timeLeft={countdown}
                  onNext={handleNextQuestion}
                  isHost={isHost}
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

      {/* 🚪 EXIT MODAL */}
      <QuizExitModal
        visible={isExitModalVisible}
        onCancel={handleCancelExit}
        onConfirm={handleConfirmExit}
        isHost={isHost}
        isMultiplayer={isMultiplayer}
        currentRound={questionIndex + 1}
        totalRounds={NUM_QUESTIONS}
      />
    </View>
  );
};

export default memo(QuizScreen);
