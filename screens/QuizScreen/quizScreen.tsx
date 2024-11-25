import React from "react";
import {
  View,
  Alert,
  StatusBar,
  ImageBackground,
  ScrollView,
  Text,
  StyleSheet,
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
  } = useQuizGameLogic();

  return (
    <>
      {isQuestionOverlayVisible && (
        <View style={styles.overlayContainer}>
          <View>
            <Text style={styles.overlayText}>Question {questionIndex + 1}</Text>
          </View>
        </View>
      )}

      {isTableOpen && (
        <GameTable
          isTableOpen={isTableOpen}
          setIsTableOpen={setIsTableOpen}
          table={table}
        />
      )}

      {isDynamicPopUp ? (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <StatusBar backgroundColor={"#000000CC"} />
          <DynamicOverlayPopUp
            isPopUp={isDynamicPopUp}
            mediaId={mediaId}
            mediaType={mediaType}
            closeVisibleDelay={3000}
          />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={require("../../assets/images/bg/quizbg2.png")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Timer Countdown */}
            <Timer countdown={countdown} />

            {/* Question Section */}
            {<QuestionSection question={question?.question} />}

            {/* Hint Section */}
            {showHint && <HintSection hint={question?.hint} />}

            {/* Options Section */}
            {!showHint && question?.options && (
              <OptionsSection
                options={
                  isFiftyFiftyActive ? remainingOptions : question?.options
                } // Conditionally pass options
                handleAnswerSelection={handleAnswerSelection}
              />
            )}

            <QuizButton
              showHint={showHint}
              setIsTableOpen={setIsTableOpen}
              handleNextQuestion={handleNextQuestion}
              handleFiftyFifty={handleFiftyFifty}
              handleQuit={handleQuit}
            />
            {!showHint && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Tap on the Quiz Table to solve the question.
                </Text>
              </View>
            )}
            {showHint && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Tap on the Next to move to the next question.
                </Text>
              </View>
            )}

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
