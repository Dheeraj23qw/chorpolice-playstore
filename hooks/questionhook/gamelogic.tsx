import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playSound,
  stopQuizSound,
  stopTimerSound,
} from "@/redux/reducers/soundReducer";
import { RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { Alert } from "react-native";

const NUM_QUESTIONS = 7;
const CORRECT_ANSWER_GIF = 7;
const INCORRECT_ANSWER_GIF = 6;
const TIMER_UP_GIF = 8;
export const useQuizGameLogic = () => {
  const { table, getRandomQuestion } = useGameTableAndScores();

  const [countdown, setCountdown] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">(
    "image"
  );
  const [remainingOptions, setRemainingOptions] = useState<string[] | null>(
    null
  );
  const [isFiftyFiftyActive, setIsFiftyFiftyActive] = useState(false);
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(0);
  const [notanswer, setNotAnswer] = useState(0);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [isOverlayRemoved, setIsOverlayRemoved] = useState(false);
  const [isQuestionOverlayVisible, setIsQuestionOverlayVisible] =
    useState(false);
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalContent, setModalContent] = useState<string>("");
  const [modalButtons, setModalButtons] = useState<
    Array<{ text: string; onPress: () => void }>
  >([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const difficulty = useSelector((state: RootState) => state.difficulty.level);
  const dispatch = useDispatch();

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

  const showModal = (
    title: string,
    content: string,
    buttons: Array<{ text: string; onPress: () => void }>
  ) => {
    setModalTitle(title);
    setModalContent(content);
    setModalButtons(buttons);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Function to handle the 50-50 lifeline
  const handleFiftyFifty = () => {
    if (isFiftyFiftyUsed) {
      showModal("Lifeline Used", "You have already used the 50-50 lifeline.", [
        { text: "OK", onPress: closeModal },
      ]);
      return;
    }

    if (!question) return; // Ensure the question exists

    // Check if it's a true/false question
    if (question.boolean) {
      showModal(
        "Not Applicable",
        "50-50 is only applicable for questions with four options.",
        [{ text: "OK", onPress: closeModal }]
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
        setIsFiftyFiftyActive(true);
        setIsFiftyFiftyUsed(true); // Mark lifeline as used

        showModal(
          "Lifeline Used",
          "Two incorrect options have been removed.",
          [{ text: "OK", onPress: closeModal }]
        );
      } else {
        showModal(
          "Insufficient Options",
          "There are not enough incorrect options to apply 50-50.",
          [{ text: "OK", onPress: closeModal }]
        );
      }
    } else {
      showModal(
        `Not Applicable`,
        `50-50 is only applicable for questions with four options.`,
        [{ text: "OK", onPress: closeModal }]
      );
    }
  };

  const handleQuit = () => {
    console.log("Quitting...");
  };

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
    dispatch(stopTimerSound());
    dispatch(playSound("quiz"));
  };

  return {
    question,
    difficulty,
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
    isQuestionOverlayVisible,
    isOverlayRemoved,
    handleQuit,
    isTableOpen,
    setIsTableOpen,
    handleFiftyFifty,
    handleNextQuestion,
    handleAnswerSelection,
    resetGame,
    questionIndex,
    table,
    isModalVisible,
    modalTitle,
    modalContent,
    modalButtons,
    closeModal,
    showModal,
  };
};
