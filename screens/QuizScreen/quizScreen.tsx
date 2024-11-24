// QuizScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  StatusBar,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { playSound } from "@/redux/reducers/soundReducer";
import { useDispatch } from "react-redux";
import GameTable from "./GameTable";
import { QuizButton } from "./QuizButtons";
import Timer from "./Timer";
import HintSection from "./HintSection";
import QuestionSection from "./QuestionSection";
import OptionsSection from "./OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;

interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
}

export default function QuizScreen() {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch();

  const [countdown, setCountdown] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">(
    "image"
  );
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);
  const [showHint, setShowHint] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) =>
        prevCountdown > 0 ? prevCountdown - 1 : 0
      );
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    if (answer === question?.correctAnswer) {
      dispatch(playSound("win"));
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
    } else {
      dispatch(playSound("lose"));
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true); // Show hint after popup disappears
    }, 4000);
  };

  const handleNextQuestion = () => {
    setShowHint(false);
    if (questionIndex + 1 === NUM_QUESTIONS) {
      Alert.alert("Game Over!", "You've answered all questions.");
      resetGame();
    } else {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestion(getRandomQuestion());
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const resetGame = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(getRandomQuestion());
  };

  return (
    <>
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
                options={question?.options}
                handleAnswerSelection={handleAnswerSelection}
              />
            )}

            <QuizButton
              showHint={showHint}
              setIsTableOpen={setIsTableOpen}
              handleNextQuestion={handleNextQuestion}
            />
          </ScrollView>
        </ImageBackground>
      )}
    </>
  );
}
