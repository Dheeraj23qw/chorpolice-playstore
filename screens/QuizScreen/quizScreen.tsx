import React, { useMemo, useEffect, useRef, useCallback } from "react";
import {
  View,
  StatusBar,
  ImageBackground,
  ScrollView,
  Text,
  Animated,
  BackHandler,
} from "react-native";

import GameTable from "../../components/thinkAndCountScreen/GameTable";
import { QuizButton } from "../../components/thinkAndCountScreen/QuizButtons";
import Timer from "../../components/thinkAndCountScreen/Timer";
import HintSection from "../../components/thinkAndCountScreen/HintSection";
import QuestionSection from "../../components/thinkAndCountScreen/QuestionSection";
import OptionsSection from "../../components/thinkAndCountScreen/OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";
import { useQuizGameLogic } from "@/hooks/questionhook/gamelogic";
import CustomModal from "@/modal/CustomModal";
import { animateComponent, createAnimation } from "./animation.";
import { useFocusEffect } from "expo-router";


export default function QuizScreen() {
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

  // Animation values
  const questionAnimation = useRef(new Animated.Value(0)).current;
  const optionsAnimation = useRef(new Animated.Value(0)).current;
  const buttonsAnimation = useRef(new Animated.Value(0)).current;
  const textAnimation = useRef(new Animated.Value(0)).current;

  useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      handleQuit();
      return true; // ⛔ block default back behavior
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [])
);

  useEffect(() => {
    // Delay the start of animations
    const timer = setTimeout(() => {
      questionAnimation.setValue(0);
      optionsAnimation.setValue(0);
      buttonsAnimation.setValue(0);
      textAnimation.setValue(0);
      animateComponent(questionAnimation).start(); // Animate question
    }, 2000); // 2-second delay

    return () => clearTimeout(timer);
  }, [question]);

  useEffect(() => {
    // Trigger options animation after the question has animated in
    const timer = setTimeout(() => {
      animateComponent(optionsAnimation).start();
    }, 4000); // Delay to sync with question animation

    return () => clearTimeout(timer);
  }, [question]);

  useEffect(() => {
    // Trigger buttons and text animation after a delay
    const timer = setTimeout(() => {
      animateComponent(buttonsAnimation).start();
      animateComponent(textAnimation).start();
    }, 4000); // Same delay as options animation

    return () => clearTimeout(timer);
  }, [question]);

  // Memoized render components
  const renderQuestionSection = useMemo(() => (
    <Animated.View style={createAnimation(questionAnimation)}>
      <QuestionSection question={question?.question} />
    </Animated.View>
  ), [question, questionAnimation]);

  const renderOptionsSection = useMemo(() => (
    !showHint && question?.options && (
      <Animated.View style={createAnimation(optionsAnimation)}>
        <OptionsSection
          options={isFiftyFiftyActive ? remainingOptions : question?.options}
          handleAnswerSelection={handleAnswerSelection}
        />
      </Animated.View>
    )
  ), [showHint, question, remainingOptions, isFiftyFiftyActive, optionsAnimation]);

  const renderHintSection = useMemo(() => (
    showHint && <HintSection hint={question?.hint} />
  ), [showHint, question]);

  const renderInstructionText = useMemo(() => (
    <Animated.View style={createAnimation(textAnimation)}>
      <View style={styles.instructionContainer}>
        <StatusBar backgroundColor={"transparent"} />
        <Text style={styles.instructionText}>
          {showHint
            ? "Tap on the Next to move to the next question."
            : "Tap on the Quiz Table to solve the question."}
        </Text>
      </View>
    </Animated.View>
  ), [showHint, textAnimation]);

  const renderButtonSection = useMemo(() => (
    <Animated.View style={createAnimation(buttonsAnimation)}>
      <QuizButton
        showHint={showHint}
        setIsTableOpen={setIsTableOpen}
        handleNextQuestion={handleNextQuestion}
        handleFiftyFifty={handleFiftyFifty}
        handleQuit={handleQuit}
      />
    </Animated.View>
  ), [
    showHint,
    setIsTableOpen,
    handleNextQuestion,
    handleFiftyFifty,
    handleQuit,
    buttonsAnimation,
  ]);

  return (
    <>
      {isQuestionOverlayVisible && (
        <View style={styles.overlayContainer}>
          <Text style={styles.overlayText}>Question {questionIndex + 1}</Text>
        </View>
      )}

      {isTableOpen ? (
        <GameTable
          isTableOpen={isTableOpen}
          setIsTableOpen={setIsTableOpen}
          table={table}
        />
      ) : isDynamicPopUp ? (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <StatusBar backgroundColor="#000000CC" />
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={3000}
            playerData={playerMessage}
          />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          {/* Timer Countdown */}
          <Timer countdown={countdown} />

          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Question Section */}
            {renderQuestionSection}

            {/* Hint Section */}
            {renderHintSection}

            {/* Options Section */}
            {renderOptionsSection}

            {/* Quiz Buttons */}
            {renderButtonSection}

            {/* Instruction Text */}
            {renderInstructionText}

            {/* Custom Modal */}
            <CustomModal
              visible={isModalVisible}
              onClose={closeModal}
              title={modalTitle}
              content={modalContent}
              buttons={modalButtons}
            />
          </ScrollView>
        </ImageBackground>
      )}
    </>
  );
}
