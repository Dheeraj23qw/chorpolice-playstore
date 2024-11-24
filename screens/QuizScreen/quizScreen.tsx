import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Alert,
  StatusBar,
  ImageBackground,
  ScrollView,
  Text,
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
import OverlayPopUp from "@/modal/overlaypop";

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
  const [wrongAnswer, setWrongAnswer] = useState(0);
  const [notanswer, setNotAnswer] = useState(0);
  const [isQuestionOverlayVisible, setIsQuestionOverlayVisible] =
    useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isOverlayRemoved, setIsOverlayRemoved] = useState(false); // New state

  const [remainingOptions, setRemainingOptions] = useState<string[] | null>(
    null
  );
  const [isFiftyFiftyActive, setIsFiftyFiftyActive] = useState(false);
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState(false);

  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  useEffect(() => {
    setIsQuestionOverlayVisible(true);

    const overlayTimeout = setTimeout(() => {
      setIsQuestionOverlayVisible(false);
      setIsOverlayRemoved(true); // Set overlay removed to true
    }, 2500); // Show overlay for 2 seconds

    return () => clearTimeout(overlayTimeout);
  }, [questionIndex]);

  // Timer Logic - Adjust timer based on difficulty
  useEffect(() => {
    if (!isOverlayRemoved) return;
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
        setNotAnswer((prev) => prev + 1);
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
  }, [difficulty, questionIndex, isOverlayRemoved]);

  // Function to handle the 50-50 lifeline
  const handleFiftyFifty = () => {
    if (isFiftyFiftyUsed) {
      Alert.alert("Lifeline Used", "You have already used the 50-50 lifeline.");
      return;
    }

    if (!question) return; // Ensure the question exists

    // Check if it's a true/false question
    if (question.boolean) {
      Alert.alert(
        "Not Applicable",
        "50-50 is not applicable for true/false questions."
      );
      return;
    }

    // Check if it's a multiple-choice question with exactly 4 options
    if (question.options && question.options.length === 4) {
      // Filter out correct and 2 random incorrect options
      const incorrectOptions = question.options.filter(
        (option) => option !== question.correctAnswer
      );

      // Ensure there are at least 2 incorrect options to pick from
      if (incorrectOptions.length >= 2) {
        const randomIncorrectOption =
          incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];

        // Keep the correct answer and one random incorrect answer
        const optionsToKeep = [question.correctAnswer, randomIncorrectOption];

        setRemainingOptions(optionsToKeep); // Update state with filtered options
        setIsFiftyFiftyActive(true); // Mark 50-50 as active
        setIsFiftyFiftyUsed(true); // Mark lifeline as used
      } else {
        Alert.alert(
          "Insufficient Options",
          "There are not enough incorrect options to apply 50-50."
        );
      }
    } else {
      Alert.alert(
        "Not Applicable",
        "50-50 is only applicable for questions with four options."
      );
    }
  };

  const handleQuit = () => {
    console.log("Quitting...");
  }
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
    setIsOverlayRemoved(false);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
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
    setCountdown(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(getRandomQuestion());
    setQuestionIndex(0);
    setIsDynamicPopUp(false);
    setMediaId(1);
    setMediaType("image");
    setIsTableOpen(false);
    setShowHint(false);
    setCorrectAnswer(0);
    setWrongAnswer(0);
    setNotAnswer(0);
    setIsQuestionOverlayVisible(false);
    setIsOverlayRemoved(false);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setIsFiftyFiftyUsed(false);
    dispatch(stopTimerSound())
    dispatch(playSound("quiz"));
  };

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
