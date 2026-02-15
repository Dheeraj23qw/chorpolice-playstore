import React, { memo, useCallback, useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp, rf } from "@/utils/responsive";

// Components
import GameTable from "../../components/thinkAndCountScreen/GameTable";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import Timer from "../../components/thinkAndCountScreen/Timer";
import HintSection from "../../components/thinkAndCountScreen/HintSection";
import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import { Lightbulb } from "lucide-react-native";
import { BackHandler } from "react-native";
import { Text } from "@/components/Text";
import QuitQuizModal from "@/modal/ExitConfirmationModal";

const QuizScreen = () => {
  const insets = useSafeAreaInsets();

  const {
    countdown,
    isDynamicPopUp,
    mediaId,
    mediaType,
    remainingOptions,
    isFiftyFiftyActive,
    showHint,
    handleFiftyFifty,
    handleNextQuestion,
    handleAnswerSelection,
    handleQuit,
    isTableOpen,
    setIsTableOpen,
    questionIndex,
    table,
    question,
    playerMessage,
    setShowHint,
    isHintButtonVisible,
    setIsHintButtonVisible,
    handleQuitInMiddle,
  } = useQuizGameLogic();

  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setShowQuitModal(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => subscription.remove();
  }, []);

  const onOptionPress = useCallback(
    (value: string) => {
      handleAnswerSelection(value);
    },
    [handleAnswerSelection],
  );

  if (isTableOpen) {
    return (
      <View className="flex-1 bg-[#050505]">
        <GameTable
          isTableOpen={isTableOpen}
          setIsTableOpen={setIsTableOpen}
          table={table}
        />
      </View>
    );
  }

  if (isDynamicPopUp) {
    return (
      <View className="flex-1 bg-[#050505] items-center justify-center">
        <DynamicOverlayPopUp
          isPopUp={isDynamicPopUp}
          mediaId={mediaId}
          mediaType={mediaType}
          closeVisibleDelay={3000}
          playerData={playerMessage}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#09090b]">
      <HintSection
        isVisible={showHint}
        hint={question?.hint}
        onClose={() => {
          setShowHint(false);
          setIsHintButtonVisible(true);
        }}
        onNext={() => {
          setIsHintButtonVisible(false);
          handleNextQuestion();
        }}
      />

      <View
        style={{ width: wp(120), height: wp(120), top: -hp(20), left: -wp(20) }}
        className="absolute bg-indigo-600/10 rounded-full blur-[100px]"
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top > 0 ? insets.top : hp(2),
          paddingBottom: insets.bottom,
        }}
      >
        {/* Floating Question Indicator */}
        <View
          style={{
            top: insets.top > 0 ? insets.top + hp(1) : hp(7),
            paddingHorizontal: wp(5),
            paddingVertical: hp(1),
          }}
          className="absolute self-center rounded-full bg-white/5 border border-white/10 z-50 backdrop-blur-md"
        >
          <Text
            style={{ fontSize: rf(1.4) }}
            // Swapped font-bold for font-main-bold
            className="text-indigo-400 font-main-bold tracking-[3px] uppercase"
          >
            Question {questionIndex + 1}
          </Text>
        </View>

        <View style={{ marginTop: hp(8) }}>
          <Timer countdown={countdown} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: wp(6),
            paddingTop: hp(2),
            paddingBottom: hp(10),
          }}
        >
          <QuestionSection question={question?.question} />

          {/* Divider */}
          <View
            style={{ marginTop: hp(1), marginBottom: hp(1) }}
            className="items-center"
          >
            <View className="h-[1px] w-20 bg-white/10 mb-4" />
            <Text
              style={{ fontSize: rf(1.4) }}
              // Swapped for font-main-md
              className="text-white/30 text-center font-main-md tracking-widest uppercase"
            >
              Consult the Quiz table to solve
            </Text>
          </View>

          {!isHintButtonVisible && (
            <View style={{ marginTop: hp(4) }}>
              <OptionsSection
                options={
                  isFiftyFiftyActive ? remainingOptions : question?.options
                }
                handleAnswerSelection={onOptionPress}
              />
            </View>
          )}

          {isHintButtonVisible && (
            <TouchableOpacity
              onPress={() => setShowHint(true)}
              activeOpacity={0.8}
              className="mt-8 flex-row items-center justify-center bg-indigo-500/10 border border-indigo-500/30 py-4 rounded-2xl"
            >
              <Lightbulb size={20} color="#818cf8" strokeWidth={2} />
              <Text
                // Swapped font-bold for font-main-bold
                className="ml-3 text-indigo-400 font-main-bold uppercase tracking-[2px] text-[12px]"
              >
                View Solution Hint
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: hp(1) }}>
            <QuizButton
              showHint={isHintButtonVisible}
              setIsTableOpen={setIsTableOpen}
              handleNextQuestion={handleNextQuestion}
              handleFiftyFifty={handleFiftyFifty}
            />
          </View>
        </ScrollView>
        <QuitQuizModal
          visible={showQuitModal}
          penalty={500}
          onCancel={() => setShowQuitModal(false)}
          onConfirm={() => {
            setShowQuitModal(false);
            handleQuitInMiddle();
          }}
        />
      </View>
    </View>
  );
};

export default memo(QuizScreen);
