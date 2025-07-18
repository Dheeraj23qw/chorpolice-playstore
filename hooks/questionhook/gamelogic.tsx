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
import { useRouter } from "expo-router";
import useRandomMessage from "../useRandomMessage";
import { resetDifficulty, setCorrectAnswers } from "@/redux/reducers/quiz";

interface PlayerMessage {
  message?: string | null;
}
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
  const [playerMessage, setPlayerMessage] = useState<PlayerMessage>({
    message: null,
  });
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
  const router = useRouter(); // Initialize router
  const [fiftyFiftyUsageCount, setFiftyFiftyUsageCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const difficulty = useSelector((state: RootState) => state.difficulty.level);
  const dispatch = useDispatch();

  const randomMessageWin = useRandomMessage("a", "winwithoutname");
  const randomMessageLose = useRandomMessage("b", "loserwithoutname");
  const randomMessageTimesUp = useRandomMessage("c", "timesup");

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
      initialTime = 60; // 90 seconds for easy
    } else if (difficulty === "medium") {
      initialTime = 90; // 120 seconds for medium
    } else if (difficulty === "hard") {
      initialTime = 150; // 150 seconds for hard
    }

    setCountdown(initialTime);

    // Timer countdown logic
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) return prevCountdown - 1;
        dispatch(stopTimerSound());
        dispatch(playSound("timesup"));
        clearInterval(timerRef.current!);
        setIsDynamicPopUp(true); // Show "Time's up" pop-up
        setMediaType("gif");
        setMediaId(TIMER_UP_GIF);
        setPlayerMessage({
          message: randomMessageTimesUp,
        });
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
    if (fiftyFiftyUsageCount >= 2) {
      // If used twice already, show message and return
      showModal(
        "Lifeline Used",
        "You have used the 50-50 lifeline twice already.",
        [{ text: "OK", onPress: closeModal }]
      );
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

        // Increment usage count
        setFiftyFiftyUsageCount((prev) => prev + 1);

        // Show appropriate message based on usage count
        const usageMessage =
          fiftyFiftyUsageCount === 0
            ? "You have used the 50-50 lifeline once. You can use it one more time."
            : "You have used the 50-50 lifeline twice. This is your last chance.";

        showModal("Lifeline Used", usageMessage, [
          { text: "OK", onPress: closeModal },
        ]);
      } else {
        showModal(
          "Insufficient Options",
          "There are not enough incorrect options to apply 50-50.",
          [{ text: "OK", onPress: closeModal }]
        );
      }
    } else {
      showModal(
        "Not Applicable",
        "50-50 is only applicable for questions with four options.",
        [{ text: "OK", onPress: closeModal }]
      );
    }
  };

  const handleQuit = () => {
    showModal("Quit Game", "Are you sure you want to quit the game?", [
      {
        text: "Cancel",
        onPress: closeModal, // Close the modal without quitting
      },
      {
        text: "Quit",
        onPress: () => {
          closeModal();
          resetGame();
          dispatch(resetDifficulty());
          router.replace("/gamelevel");
        },
      },
    ]);
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
      setPlayerMessage({
        message: randomMessageWin,
      });
      dispatch(playSound("win"));
    } else {
      setWrongAnswer((prev) => prev + 1);
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
      setPlayerMessage({
        message: randomMessageLose,
      });
      dispatch(playSound("lose"));
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true);
    }, 3000);
  };

  const handleNextQuestion = () => {
    dispatch(playSound("next"));
    setIsOverlayRemoved(false);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setShowHint(false);
    if (questionIndex + 1 === NUM_QUESTIONS) {
      dispatch(setCorrectAnswers(correctAnswer));
      router.push("/quizresult");
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
    setFiftyFiftyUsageCount(0);
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
    playerMessage,
  };
};
