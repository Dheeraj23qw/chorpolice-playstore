import React, { useMemo } from "react";
import {
  View,
  StatusBar,
  ImageBackground,
  ScrollView,
  Text,
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
    playerMessage
  } = useQuizGameLogic();

  // Memoize parts of the UI to prevent unnecessary re-renders
  const renderQuestionSection = useMemo(() => {
    return <QuestionSection question={question?.question} />;
  }, [question]);

  const renderOptionsSection = useMemo(() => {
    return (
      !showHint && question?.options && (
        <OptionsSection
          options={isFiftyFiftyActive ? remainingOptions : question?.options}
          handleAnswerSelection={handleAnswerSelection}
        />
      )
    );
  }, [showHint, question, remainingOptions, isFiftyFiftyActive]);

  const renderHintSection = useMemo(() => {
    return showHint && <HintSection hint={question?.hint} />;
  }, [showHint, question]);

  const renderInstructionText = useMemo(() => {
    return (
      <View style={styles.instructionContainer}>
        <StatusBar backgroundColor={"transparent"}/>

        <Text style={styles.instructionText}>
          {showHint
            ? "Tap on the Next to move to the next question."
            : "Tap on the Quiz Table to solve the question."}
        </Text>
      </View>
    );
  }, [showHint]);

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
            <QuizButton
              showHint={showHint}
              setIsTableOpen={setIsTableOpen}
              handleNextQuestion={handleNextQuestion}
              handleFiftyFifty={handleFiftyFifty}
              handleQuit={handleQuit}
            />

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
