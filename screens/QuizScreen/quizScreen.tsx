import React, { memo, useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
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
import { Text } from "@/components/Text";
import QuitQuizModal from "@/modal/ExitConfirmationModal";

const QuizScreen = () => {
  const insets = useSafeAreaInsets();
  const [showQuitModal, setShowQuitModal] = useState(false);

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

  return (
    <View className="flex-1 bg-black">
      {/* 🌌 UNIFIED BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.png")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute h-full w-full bg-black/70" />

      {/* --- CONDITIONAL VIEWS (TABLE & POPUP) --- */}
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
        /* --- MAIN QUIZ UI --- */
        <>
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
              className="absolute z-50 self-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
            >
              <Text
                style={{ fontSize: rf(1.4) }}
                className="font-main-bold uppercase tracking-[3px] text-indigo-400"
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
                <View className="mb-4 h-[1px] w-20 bg-white/10" />
                <Text
                  style={{ fontSize: rf(1.4) }}
                  className="text-center font-main-md uppercase tracking-widest text-white/40"
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
                  className="mt-8 flex-row items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-5 backdrop-blur-md"
                >
                  <Lightbulb size={20} color="#818cf8" strokeWidth={2} />
                  <Text className="ml-3 font-main-bold text-[12px] uppercase tracking-[2px] text-indigo-400">
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
          </View>
        </>
      )}

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
  );
};

export default memo(QuizScreen);
