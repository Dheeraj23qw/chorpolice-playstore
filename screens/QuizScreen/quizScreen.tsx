import React, { memo, useCallback } from "react";
import { View, StatusBar, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Import this
import { hp, wp, rf } from "@/utils/responsive";

// Components
import GameTable from "../../components/thinkAndCountScreen/GameTable";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import Timer from "../../components/thinkAndCountScreen/Timer";
import HintSection from "../../components/thinkAndCountScreen/HintSection";
import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import CustomModal from "@/modal/CustomModal";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";

const QuizScreen = () => {
  const insets = useSafeAreaInsets(); // 2. Hook to get Notch/Home bar sizes
  
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
    isQuestionOverlayVisible,
    handleQuit,
    isTableOpen,
    setIsTableOpen,
    questionIndex,
    table,
    question,
    isModalVisible,
    modalTitle,
    modalContent,
    modalButtons,
    closeModal,
    playerMessage,
  } = useQuizGameLogic();

  const onOptionPress = useCallback((value: string) => {
    handleAnswerSelection(value);
  }, [handleAnswerSelection]);

  if (isTableOpen) {
    return <GameTable isTableOpen={isTableOpen} setIsTableOpen={setIsTableOpen} table={table} />;
  }

  if (isDynamicPopUp) {
    return (
      <View className="flex-1 bg-[#050505] items-center justify-center">
        <StatusBar barStyle="light-content" />
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Decor (Stretches behind Notch) */}
      <View style={{ width: wp(120), height: wp(120), top: -hp(20), left: -wp(20) }} className="absolute bg-indigo-600/10 rounded-full blur-[100px]" />

      {/* --- Safe Content Container --- */}
      <View 
        style={{ 
          flex: 1, 
          paddingTop: insets.top > 0 ? insets.top : hp(2), // Avoid Notch
          paddingBottom: insets.bottom // Avoid Home Indicator
        }}
      >
        {/* --- Floating Question Indicator --- */}
        {isQuestionOverlayVisible && (
          <View
            style={{
              top: insets.top > 0 ? insets.top + hp(1) : hp(7), // Adjusts dynamically
              paddingHorizontal: wp(5),
              paddingVertical: hp(1),
            }}
            className="absolute self-center rounded-full bg-white/5 border border-white/10 z-50 backdrop-blur-md"
          >
            <Text style={{ fontSize: rf(1.4) }} className="text-indigo-400 font-bold tracking-[3px] uppercase">
              Question {questionIndex + 1}
            </Text>
          </View>
        )}

        {/* --- Timer Area (Pushed below Notch) --- */}
        <View style={{ marginTop: hp(8) }}>
          <Timer countdown={countdown} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: wp(6),
            paddingTop: hp(2),
            paddingBottom: hp(10), // Reduced because insets.bottom handles the rest
          }}
        >
          <QuestionSection question={question?.question} />

          <View style={{ marginTop: hp(4) }}>
            {showHint ? (
              <View className="animate-in fade-in slide-in-from-bottom-4">
                <HintSection hint={question?.hint} />
              </View>
            ) : (
              <View className="animate-in fade-in zoom-in-95">
                <OptionsSection
                  options={isFiftyFiftyActive ? remainingOptions : question?.options}
                  handleAnswerSelection={onOptionPress}
                />
              </View>
            )}
          </View>

          <View style={{ marginTop: hp(6) }}>
            <QuizButton
              showHint={showHint}
              setIsTableOpen={setIsTableOpen}
              handleNextQuestion={handleNextQuestion}
              handleFiftyFifty={handleFiftyFifty}
              handleQuit={handleQuit}
            />
          </View>

          <View style={{ marginTop: hp(4), marginBottom: hp(5) }} className="items-center">
            <View className="h-[1px] w-20 bg-white/10 mb-4" />
            <Text style={{ fontSize: rf(1.4) }} className="text-white/30 text-center tracking-widest uppercase">
              {showHint ? "Prepare for the next challenge" : "Consult the table to solve"}
            </Text>
          </View>
        </ScrollView>
      </View>

      <CustomModal
        visible={isModalVisible}
        onClose={closeModal}
        title={modalTitle}
        content={modalContent}
        buttons={modalButtons}
      />
    </View>
  );
};

export default memo(QuizScreen);