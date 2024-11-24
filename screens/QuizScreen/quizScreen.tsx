import React from "react";
import {
  View,
  Alert,
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

interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
}

export default function QuizScreen() {
  const {
    countdown,
    selectedAnswer,
    isCorrect,
    isDynamicPopUp,
    mediaId,
    mediaType,
    remainingOptions,
    isFiftyFiftyActive,
    isFiftyFiftyUsed,
    showHint,
    correctAnswer,
    wrongAnswer,
    notanswer,
    handleFiftyFifty,
    handleNextQuestion,
    handleAnswerSelection,
    resetGame,
    isQuestionOverlayVisible,
    isOverlayRemoved,
    handleQuit,
    isTableOpen,
    setIsTableOpen,
    questionIndex,
    table,
    question,
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
          </ScrollView>
        </ImageBackground>
      )}
    </>
  );
}
