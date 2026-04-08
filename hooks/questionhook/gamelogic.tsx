import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AudioEngine } from "@/audio/audioEngine";

import { AppDispatch, RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { useRouter } from "expo-router";
import useRandomMessage from "../useRandomMessage";
import { resetDifficulty, setCorrectAnswers } from "@/redux/reducers/quiz";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { applyTransaction } from "@/features/wallet/walletSlice";

interface PlayerMessage {
  message?: string | null;
}

/* ------------------ CONSTANTS ------------------ */

const NUM_QUESTIONS = 1;

const MEDIA = {
  CORRECT: 7,
  WRONG: 6,
  TIMEUP: 8,
};

const TIMER_BY_DIFFICULTY = {
  easy: 60,
  medium: 90,
  hard: 150,
} as const;

const POPUP_DELAY = 3000;

/* ------------------------------------------------ */

export const useQuizGameLogic = () => {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuestionRef = useRef<any>(null);

  const [countdown, setCountdown] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isDynamicPopUp, setIsDynamicPopUp] = useState(false);
  const [mediaId, setMediaId] = useState<number>(1);
  const [mediaType] = useState<"image" | "video" | "gif">("gif");
  const [playerMessage, setPlayerMessage] = useState<PlayerMessage>({});
  const [remainingOptions, setRemainingOptions] = useState<string[] | null>(
    null,
  );
  const [isFiftyFiftyActive, setIsFiftyFiftyActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(0);
  const [notAnswer, setNotAnswer] = useState(0);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [fiftyFiftyUsageCount, setFiftyFiftyUsageCount] = useState(0);
  const [isHintButtonVisible, setIsHintButtonVisible] = useState(false);

  const [question, setQuestion] = useState(() => getRandomQuestion());

  const randomWin = useRandomMessage("winwithoutname");
  const randomLose = useRandomMessage("loserwithoutname");
  const randomTimeUp = useRandomMessage("timesup");

  /* ---------------- TIMER ---------------- */

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeUp = useCallback(() => {
    clearTimer();
    AudioEngine.stop("timer");
    setNotAnswer((p) => p + 1);
    setMediaId(MEDIA.TIMEUP);
    setPlayerMessage({ message: randomTimeUp });
    setIsDynamicPopUp(true);

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true);
    }, POPUP_DELAY);
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    clearTimer();

    const safeDifficulty = difficulty ?? "easy";
    const initial = TIMER_BY_DIFFICULTY[safeDifficulty];

    setCountdown(initial);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [difficulty, handleTimeUp, clearTimer]);

  useEffect(() => {
    AudioEngine.play("timer", "gameplay");

    startTimer();

    return () => {
      clearTimer();
      AudioEngine.stop("timer");
    };
  }, [questionIndex]);

  /* ---------------- QUESTION ---------------- */

  const getNextQuestion = () => {
    let next;
    do {
      next = getRandomQuestion();
    } while (next === lastQuestionRef.current);

    lastQuestionRef.current = next;
    return next;
  };

  /* ---------------- ANSWER ---------------- */

  const handleAnswerSelection = (answer: string) => {
    clearTimer();
    AudioEngine.stop("timer");

    setSelectedAnswer(answer);
    setIsDynamicPopUp(true);

    const correct = answer === question?.correctAnswer;

    setIsCorrect(correct);

    if (correct) {
      setCorrectAnswer((p) => p + 1);
      setMediaId(MEDIA.CORRECT);
      setPlayerMessage({ message: randomWin });
      AudioEngine.play("win", "gameplay");
    } else {
      setWrongAnswer((p) => p + 1);
      setMediaId(MEDIA.WRONG);
      setPlayerMessage({ message: randomLose });
      AudioEngine.play("lose", "gameplay");
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      setShowHint(true);
    }, POPUP_DELAY);
  };

  /* ---------------- 50-50 ---------------- */

  const handleFiftyFifty = () => {
    // 🚫 Already exhausted
    if (fiftyFiftyUsageCount >= 2) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Empty!",
        textBody: "You've used all 50-50 lifelines for this game.",
        autoClose: 2000,
      });
      return; // ✅ IMPORTANT
    }

    // 🚫 Invalid question
    if (!question?.options || question.options.length !== 4) {
      Toast.show({
        type: ALERT_TYPE.INFO,
        title: "Unavailable",
        textBody: "50-50 is only for 4-option questions.",
        autoClose: 2000,
      });
      return; // ✅ IMPORTANT
    }

    const incorrect = question.options.filter(
      (opt) => opt !== question.correctAnswer,
    );

    const shuffled = [...incorrect].sort(() => 0.5 - Math.random());
    const toRemove = shuffled.slice(0, 2);

    const filtered = question.options.filter((opt) => !toRemove.includes(opt));

    // ✅ Apply lifeline
    setRemainingOptions(filtered);
    setIsFiftyFiftyActive(true);

    const nextCount = fiftyFiftyUsageCount + 1;
    setFiftyFiftyUsageCount(nextCount);

    // ✅ Feedback
    if (nextCount === 1) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "50-50 Activated!",
        textBody: "1 lifeline used. 1 remaining.",
        autoClose: 2000,
      });
    }

    if (nextCount === 2) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Final Lifeline!",
        textBody: "No 50-50 lifelines left. Use it wisely!",
        autoClose: 3000,
      });
    }
  };

  /* ---------------- NEXT ---------------- */

  const handleNextQuestion = () => {
    AudioEngine.play("next", "ui");

    setShowHint(false);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);

    if (questionIndex + 1 >= NUM_QUESTIONS) {
      dispatch(setCorrectAnswers(correctAnswer));
      AudioEngine.stop("timer");
      router.push("/quiz-result");
      return;
    }
    setIsHintButtonVisible(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuestion(getNextQuestion());
    setQuestionIndex((p) => p + 1);
  };

  /* ---------------- RESET / QUIT ---------------- */

  const resetGame = () => {
    clearTimer();
    setQuestionIndex(0);
    setCorrectAnswer(0);
    setWrongAnswer(0);
    setNotAnswer(0);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setFiftyFiftyUsageCount(0);
    setQuestion(getNextQuestion());
  };

  type Routes = "/mode-select" | "/stats" | "/earn";

  const handleNavigation = (targetRoute: Routes) => {
    try {
      resetGame();
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace(targetRoute);
      });
    } catch (err) {
      console.error("Navigation failed:", err);
    }
  };

  const handleQuit = () => handleNavigation("/mode-select");
  const handleStats = () => handleNavigation("/stats");
  const handleEarn = () => handleNavigation("/earn");

  const isQuittingRef = useRef(false);

  const handleQuitInMiddle = async () => {
    if (isQuittingRef.current) return;
    isQuittingRef.current = true;

    try {
      clearTimer();
      AudioEngine.stop("timer");

      const penaltyAmount = 500;

      await dispatch(
        applyTransaction({
          amount: -penaltyAmount,
          reason: "Quit Quiz Penalty",
          source: "quiz_penalty",
          metadata: {
            round: questionIndex + 1,
            difficulty: difficulty ?? "easy",
            timestamp: Date.now(),
            gameId: "quiz_think_count",
          },
        }),
      );

      resetGame();
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();

        router.replace("/level-select");
      });
    } catch (error) {
      console.error("Error during quit-in-middle workflow:", error);
    } finally {
      isQuittingRef.current = false;
    }
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
    notAnswer,
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
    setShowHint,
    isHintButtonVisible,
    setIsHintButtonVisible,
    handleQuitInMiddle,
    handleStats,
    handleEarn,
  };
};
