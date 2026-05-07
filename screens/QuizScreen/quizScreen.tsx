import React, { memo, useCallback, useEffect } from "react";
import { BackHandler, Image, ScrollView, View, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { QuizLeaderboard } from "@/components/MultiPlayerQuizLeaderboard/QuizLeaderboard";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import QuizExitModal from "@/modal/QuizExitModal";
import { NUM_QUESTIONS } from "@/constants/quizConstants";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import { QuizEngine } from "@/service/QuizEngine";
import { hp, rf, wp } from "@/utils/responsive";
import {
  buildLocalizedQuizOptions,
  translateToHindi,
} from "@/utils/QuestionTranslator";
import GameTable from "../../components/thinkAndCountScreen/GameTable";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import { PersonalSummary } from "../../components/thinkAndCountScreen/PersonalSummary";
import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import { QuizLanguageToggle } from "../../components/thinkAndCountScreen/QuizLanguageToggle";
import Timer from "../../components/thinkAndCountScreen/Timer";
import { WaitingState } from "@/components/MultiPlayerQuizLeaderboard/WaitingState";
import { RootState } from "@/redux/store";
import { toggleQuizNarration } from "@/redux/reducers/soundReducer";
import { useQuizNarration } from "@/hooks/useQuizNarration";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const QuizScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const quizNarrationEnabled = useSelector(
    (state: RootState) => state.sound.quizNarrationEnabled,
  );

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
    isHindi,
    toggleHindi,
    matchHistory,
    isPersonalSummaryVisible,
    handleOpenFinalLeaderboard,
    correctAnswer,
    activeQuestionId,
  } = useQuizGameLogic();

  const visibleOptions = isFiftyFiftyActive
    ? remainingOptions || []
    : question?.options || [];

  const { repeatNarration } = useQuizNarration({
    question: isHindi ? translateToHindi(question?.question) : question?.question,
    options: isHindi ? buildLocalizedQuizOptions(visibleOptions) : visibleOptions,
    isHindi,
    isQuizActive: !isWaitingForOthers && !isLeaderboardVisible && !isPersonalSummaryVisible,
    isRevealPhase: isDynamicPopUp,
    narrationEnabled: quizNarrationEnabled,
    questionId: activeQuestionId,
  });

  const handleToggleNarration = useCallback(() => {
    dispatch(toggleQuizNarration());
  }, [dispatch]);

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

  const isContentBlocked = isWaitingForOthers || isLeaderboardVisible;

  return (
    <View className="flex-1 bg-black">
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {isWaitingForOthers && (
        <View className="absolute z-[70] h-full w-full items-center justify-center bg-black">
          <Image
            source={require("@/assets/images/bg/image.webp")}
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
      ) : isPersonalSummaryVisible ? (
        <View className="z-[60] flex-1">
          <PersonalSummary
            matchHistory={matchHistory}
            correctAnswers={correctAnswer}
            totalQuestions={matchHistory.length}
            isHindi={isHindi}
            translateFn={translateToHindi}
            onViewTable={() => setIsTableOpen(true)}
            onContinue={handleOpenFinalLeaderboard}
          />
        </View>
      ) : (
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
                ? isHindi
                  ? `Round ${questionIndex + 1} Result`
                  : `Round ${questionIndex + 1} Results`
                : isHindi
                  ? `Question ${questionIndex + 1}`
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
              <View>
                <View className="mb-6 flex-row items-center gap-3">
                  <View className="flex-1">
                    <QuizLanguageToggle
                      isHindi={isHindi}
                      onToggle={toggleHindi}
                    />
                  </View>

                  {/* Glassmorphism Narration Controls */}
                  <View className="flex-row items-center gap-2">
                    {/* Replay Button (Only visible if enabled) */}
                    {quizNarrationEnabled && (
                      <Pressable
                        onPress={repeatNarration}
                        className="h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 active:scale-90"
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={22}
                          color="#818cf8"
                        />
                      </Pressable>
                    )}

                    {/* Toggle Button */}
                    <Pressable
                      onPress={handleToggleNarration}
                      className="overflow-hidden rounded-2xl active:scale-95"
                    >
                      <BlurView
                        intensity={30}
                        tint="light"
                        className="h-[68px] px-5 flex-row items-center justify-center border border-white/20 bg-white/10"
                      >
                        <Ionicons
                          name={
                            quizNarrationEnabled
                              ? "volume-high-outline"
                              : "volume-mute-outline"
                          }
                          size={28}
                          color={quizNarrationEnabled ? "#818cf8" : "#94a3b8"}
                        />
                        <View className="ml-3">
                          <Text
                            style={{ fontSize: rf(1.1) }}
                            className="font-main-bold text-white uppercase"
                          >
                            {quizNarrationEnabled ? "Narration On" : "Narration Off"}
                          </Text>
                        </View>
                      </BlurView>
                    </Pressable>
                  </View>
                </View>

                <QuestionSection
                  question={
                    isHindi
                      ? translateToHindi(question?.question)
                      : question?.question
                  }
                />

                <View
                  style={{ marginTop: hp(1), marginBottom: hp(1) }}
                  className="items-center"
                >
                  <View className="mb-4 h-[1px] w-20 bg-white/10" />
                  <Text
                    style={{ fontSize: rf(1.4) }}
                    className="text-center font-main-md uppercase tracking-widest text-white/40"
                  >
                    {isHindi
                      ? "Answer ke liye Quiz Table dekho"
                      : "Consult the Quiz table to solve"}
                  </Text>
                </View>

                <View style={{ marginTop: hp(4) }}>
                  <OptionsSection
                    options={
                      isHindi
                        ? buildLocalizedQuizOptions(visibleOptions)
                        : visibleOptions
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
      )}

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
