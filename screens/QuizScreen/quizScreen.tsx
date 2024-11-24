import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  StatusBar,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import {
  playSound,
  stopQuizSound,
  stopTimerSound,
} from "@/redux/reducers/soundReducer";
import { useDispatch, useSelector } from "react-redux";
import GameTable from "./GameTable";
import { QuizButton } from "./QuizButtons";
import Timer from "./Timer";
import HintSection from "./HintSection";
import QuestionSection from "./QuestionSection";
import OptionsSection from "./OptionsSection";
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";
import { styles } from "@/screens/QuizScreen/_styles/quizScreenstyles";
import { RootState } from "@/redux/store";

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;
const TIMER_UP_GIF = 8; // GIF for time's up popup

interface PlayerData {
  image?: string | null;
  message?: string | null;
  imageType?: string | null;
}

export default function QuizScreen() {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch();

  const [countdown, setCountdown] = useState(0);
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
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [wrongAnswer,setWrongAnswer] = useState(0);
  const [notanswer, setNotAnswer] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  // Timer Logic - Adjust timer based on difficulty
  useEffect(() => {
    dispatch(stopQuizSound());
    dispatch(playSound("timer")); // Play quiz sound

    let initialTime = 0;

    // Set timer based on difficulty (in seconds)
    if (difficulty === "easy") {
      initialTime = 20; // 90 seconds for easy
    } else if (difficulty === "medium") {
      initialTime = 30; // 120 seconds for medium
    } else if (difficulty === "hard") {
      initialTime = 50; // 150 seconds for hard
    }

    setCountdown(initialTime);

    // Timer countdown logic
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) return prevCountdown - 1;
        dispatch(stopTimerSound());

        clearInterval(timerRef.current!);
        setIsDynamicPopUp(true); // Show "Time's up" pop-up
        setMediaType("gif");
        setMediaId(TIMER_UP_GIF);
        setNotAnswer((prev) => prev + 1)
        // After popup duration, hide it and show the solution
        setTimeout(() => {
          setIsDynamicPopUp(false);
          setShowHint(true); // Show the hint/solution
        }, 4000); // Adjust timing to match popup duration

        return 0;
      });
    }, 1000);

    // Clear timer on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, questionIndex]); // Re-run timer when difficulty or question changes

  const handleAnswerSelection = (answer: string) => {
    dispatch(stopTimerSound());

    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    // Stop the timer when the answer is selected
    if (timerRef.current) clearInterval(timerRef.current);

    if (answer === question?.correctAnswer) {
      setCorrectAnswer((prev) => prev + 1);
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
      dispatch(playSound("win"));
    } else {
      setWrongAnswer((prev) => prev + 1);
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
      dispatch(playSound("lose"));
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true);
    }, 3000);
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
