import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playSound,
  stopQuizSound,
  stopTimerSound,
} from "@/redux/reducers/soundReducer";
import { RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { useRouter } from "expo-router";
import useRandomMessage from "../useRandomMessage";
import { resetDifficulty, setCorrectAnswers } from "@/redux/reducers/quiz";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification"; // Added this

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
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif">("image");
  const [playerMessage, setPlayerMessage] = useState<PlayerMessage>({ message: null });
  const [remainingOptions, setRemainingOptions] = useState<string[] | null>(null);
  const [isFiftyFiftyActive, setIsFiftyFiftyActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(0);
  const [notanswer, setNotAnswer] = useState(0);
  const [question, setQuestion] = useState(getRandomQuestion());
  const [isOverlayRemoved, setIsOverlayRemoved] = useState(false);
  const [isQuestionOverlayVisible, setIsQuestionOverlayVisible] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);
  const [fiftyFiftyUsageCount, setFiftyFiftyUsageCount] = useState(0);

  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const difficulty = useSelector((state: RootState) => state.difficulty.level);
  const dispatch = useDispatch();

  const randomMessageWin = useRandomMessage("a", "winwithoutname");
  const randomMessageLose = useRandomMessage("b", "loserwithoutname");
  const randomMessageTimesUp = useRandomMessage("c", "timesup");

  useEffect(() => {
    setIsQuestionOverlayVisible(true);
    const overlayTimeout = setTimeout(() => {
      setIsQuestionOverlayVisible(false);
      setIsOverlayRemoved(true);
    }, 2500);

    return () => clearTimeout(overlayTimeout);
  }, [questionIndex]);

  useEffect(() => {
    if (!isOverlayRemoved) return;
    dispatch(stopQuizSound());
    dispatch(playSound("timer"));

    let initialTime = 60;
    if (difficulty === "medium") initialTime = 90;
    else if (difficulty === "hard") initialTime = 150;

    setCountdown(initialTime);

    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 0) return prevCountdown - 1;
        dispatch(stopTimerSound());
        dispatch(playSound("timesup"));
        clearInterval(timerRef.current!);
        setIsDynamicPopUp(true);
        setMediaType("gif");
        setMediaId(TIMER_UP_GIF);
        setPlayerMessage({ message: randomMessageTimesUp });
        setNotAnswer((prev) => prev + 1);
        
        setTimeout(() => {
          setIsDynamicPopUp(false);
          setShowHint(true);
        }, 4000);

        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, questionIndex, isOverlayRemoved]);

  // ---------------------------
  // LIFELINE LOGIC (Updated to Dialog)
  // ---------------------------
  const handleFiftyFifty = () => {
    if (fiftyFiftyUsageCount >= 2) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Lifeline Used",
        textBody: "You have used the 50-50 lifeline twice already.",
        button: "OK",
      });
      return;
    }

    if (!question) return;

    if (question.boolean || !question.options || question.options.length !== 4) {
      Dialog.show({
        type: ALERT_TYPE.INFO,
        title: "Not Applicable",
        textBody: "50-50 is only applicable for questions with four options.",
        button: "OK",
      });
      return;
    }

    const incorrectOptions = question.options.filter(
      (option) => option !== question.correctAnswer
    );

    if (incorrectOptions.length >= 2) {
      const randomIncorrectOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      const optionsToKeep = [question.correctAnswer, randomIncorrectOption];

      setRemainingOptions(optionsToKeep);
      setIsFiftyFiftyActive(true);
      setFiftyFiftyUsageCount((prev) => prev + 1);

      const usageMessage = fiftyFiftyUsageCount === 0
        ? "You have used the 50-50 lifeline once. You can use it one more time."
        : "You have used the 50-50 lifeline twice. This is your last chance.";

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Lifeline Active",
        textBody: usageMessage,
        button: "Let's Go",
      });
    }
  };

  // ---------------------------
  // QUIT LOGIC (Updated to Dialog)
  // ---------------------------
  const handleQuit = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Quit Game",
      textBody: "Are you sure you want to quit the game?",
      button: "Quit",
      onPressButton: () => {
        Dialog.hide();
        resetGame();
        dispatch(resetDifficulty());
        router.replace("/gamelevel");
      }
    });
  };

  const handleAnswerSelection = (answer: string) => {
    dispatch(stopTimerSound());
    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    if (timerRef.current) clearInterval(timerRef.current);

    if (answer === question?.correctAnswer) {
      setCorrectAnswer((prev) => prev + 1);
      setMediaType("gif");
      setMediaId(CORRECT_ANSWER_GIF);
      setIsCorrect(true);
      setPlayerMessage({ message: randomMessageWin });
      dispatch(playSound("win"));
    } else {
      setWrongAnswer((prev) => prev + 1);
      setIsCorrect(false);
      setMediaType("gif");
      setMediaId(INCORRECT_ANSWER_GIF);
      setPlayerMessage({ message: randomMessageLose });
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
    playerMessage,
  };
};