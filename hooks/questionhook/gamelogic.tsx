import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AudioEngine } from "@/audio/audioEngine";

import { AppDispatch, RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { useRouter } from "expo-router";
import useRandomMessage from "../useRandomMessage";
import { resetDifficulty, setCorrectAnswers } from "@/redux/reducers/quiz";
import { toast } from "@/components/feedback/toast";
import { loadUsername } from "@/storage/userStorage";

import {
  handleIncomingPacket,
  subscribeToPackets,
} from "@/service/lanGameService";
import { MODES } from "@/constants/Networking";
import { QuizEngine } from "@/service/QuizEngine";
import {
  NUM_QUESTIONS,
  POPUP_DELAY,
  TIMER_BY_DIFFICULTY,
} from "@/constants/quizConstants";
import { updateCoins } from "@/features/wallet/walletSlice";

interface PlayerMessage {
  message?: string | null;
}

/* ------------------ CONSTANTS ------------------ */

// NUM_QUESTIONS, POPUP_DELAY, TIMER_BY_DIFFICULTY are imported from @/constants/quizConstants
// to stay in sync with QuizScreen (prevents ReferenceError crash).

const MEDIA = {
  CORRECT: 7,
  WRONG: 6,
  TIMEUP: 8,
};

/* ------------------------------------------------ */

export const useQuizGameLogic = () => {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuestionRef = useRef<any>(null);

  const [countdown, setCountdown] = useState(0);

  // 🛡️ User Identity: Find our own ID in the engine's score table
  const [localPlayerId, setLocalPlayerId] = useState<string>("host_id");
  const userName = useRef(loadUsername()).current;

  const isMultiplayer = Object.keys(QuizEngine.state.playerScores).length > 1;

  useEffect(() => {
    if (isMultiplayer) {
      const myPlayer = Object.values(QuizEngine.state.playerScores).find(
        (p) => p.name === userName,
      );
      if (myPlayer) setLocalPlayerId(myPlayer.id);
    }
  }, [userName, isMultiplayer]);

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
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);

  // 🔄 UI Live Sync: Track who is finished vs thinking
  const [roundProgress, setRoundProgress] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
        isFinished: boolean;
        correctCount: number;
        avatarId: number;
      }
    >
  >({});

  const [question, setQuestion] = useState(() => getRandomQuestion());

  // Initialize progress for the round
  const initRoundProgress = useCallback(() => {
    const progress: any = {};
    Object.values(QuizEngine.state.playerScores).forEach((p) => {
      progress[p.id] = {
        id: p.id,
        name: p.name,
        isFinished: false,
        correctCount: 0, // Placeholder, updated by Round Summary or live packets
        avatarId: p.avatarId,
      };
    });
    setRoundProgress(progress);
  }, []);

  useEffect(() => {
    if (isMultiplayer) initRoundProgress();
  }, [questionIndex, isMultiplayer, initRoundProgress]);

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

    const timeLimit = TIMER_BY_DIFFICULTY[difficulty ?? "easy"];

    // 📡 Inform engine that this player timed out so the round counter advances
    if (isMultiplayer) {
      handleIncomingPacket({
        type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
        playerId: localPlayerId,
        isCorrect: false,
        timeTaken: timeLimit * 1000,
        timestamp: Date.now(),
      });
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      if (!isMultiplayer) {
        setShowHint(true);
      } else {
        // 🛡️ Only show waiting if summary hasn't already arrived
        if (!roundSummaryReceivedRef.current) {
          setIsWaitingForOthers(true);
        }
      }
    }, POPUP_DELAY);
  }, [clearTimer, isMultiplayer, localPlayerId, randomTimeUp, difficulty]);

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
  }, [questionIndex, startTimer, clearTimer]);

  /* ---------------- QUESTION ---------------- */

  const getNextQuestion = useCallback(() => {
    let next;
    do {
      next = getRandomQuestion();
    } while (next === lastQuestionRef.current);

    lastQuestionRef.current = next;

    // 📡 If Host, broadcast the question to sync everyone
    if (isMultiplayer && localPlayerId === "host_id") {
      console.log(
        "📡 [GameLogic] Host: Syncing question to all clients for Round:",
        questionIndex + 1,
      );
      handleIncomingPacket({
        type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
        question: next,
        round: questionIndex + 1,
      });
    }

    return next;
  }, [getRandomQuestion, isMultiplayer, localPlayerId, questionIndex]);

  // 💰 STAKE DEBIT & FIRST QUESTION SYNC EFFECT
  useEffect(() => {
    if (isMultiplayer) {
      const stake = QuizEngine.state.stake;
      if (stake > 0 && questionIndex === 0) {
        console.log("💰 [GameLogic] Debiting stake:", stake);
        dispatch(updateCoins(-stake));
      }

      // 📡 Trigger first sync for bots if Host
      if (localPlayerId === "host_id" && questionIndex === 0) {
        console.log(
          "📡 [GameLogic] Host: Triggering first round sync for bots",
        );
        handleIncomingPacket({
          type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
          question: question, // Current initial question
          round: 1,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- ANSWER ---------------- */

  const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);

  /**
   * 🛡️ RACE CONDITION GUARD:
   * TC_ROUND_SUMMARY can arrive BEFORE the 3s popup delay fires.
   * Without this ref, the delayed setTimeout would set isWaitingForOthers=true
   * AFTER the summary already cleared it — permanently blocking the UI.
   */
  const roundSummaryReceivedRef = useRef(false);

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

    const timeLimit = TIMER_BY_DIFFICULTY[difficulty ?? "easy"];
    const timeTaken = (timeLimit - countdown) * 1000; // in ms

    // 📡 Multiplayer: broadcast this player's answer to the engine
    if (isMultiplayer) {
      handleIncomingPacket({
        type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
        playerId: localPlayerId,
        isCorrect: correct,
        timeTaken: timeTaken,
        timestamp: Date.now(),
      });
    }

    setTimeout(() => {
      setIsDynamicPopUp(false);
      if (!isMultiplayer) {
        setShowHint(true);
      } else {
        // 🛡️ Only show waiting if summary hasn't already arrived
        if (!roundSummaryReceivedRef.current) {
          setIsWaitingForOthers(true);
        }
      }
    }, POPUP_DELAY);
  };

  /* ---------------- 50-50 ---------------- */

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsageCount >= 2) {
      toast.error(
        "Empty!",
        "You've used all 50-50 lifelines for this game.",
        2000,
      );
      return;
    }

    if (!question?.options || question.options.length !== 4) {
      toast.info("Unavailable", "50-50 is only for 4-option questions.", 2000);
      return;
    }

    const incorrect = question.options.filter(
      (opt) => opt !== question.correctAnswer,
    );

    const shuffled = [...incorrect].sort(() => 0.5 - Math.random());
    const toRemove = shuffled.slice(0, 2);

    const filtered = question.options.filter((opt) => !toRemove.includes(opt));

    setRemainingOptions(filtered);
    setIsFiftyFiftyActive(true);

    const nextCount = fiftyFiftyUsageCount + 1;
    setFiftyFiftyUsageCount(nextCount);

    if (nextCount === 1) {
      toast.success("50-50 Activated!", "1 lifeline used. 1 remaining.", 2000);
    }

    if (nextCount === 2) {
      toast.warning(
        "Final Lifeline!",
        "No 50-50 lifelines left. Use it wisely!",
        3000,
      );
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
      clearTimer();
      // Kill bots before navigating — prevents late packets crashing QuizResult
      if (isMultiplayer) {
        const { BotEngine } = require("@/service/BotEngine");
        BotEngine.reset();
      }
      router.push({ pathname: "/quiz-result" } as any);
      return;
    }
    setIsHintButtonVisible(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsLeaderboardVisible(false);
    setIsWaitingForOthers(false);
    roundSummaryReceivedRef.current = false; // 🔄 Reset for next round
    setQuestion(getNextQuestion());
    setQuestionIndex((p) => p + 1);
  };

  /* ---------------- MULTIPLAYER LISTENERS ---------------- */

  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet) => {
      // 🔄 LIVE ANSWER PROGRESS: Mark individual player as done in real-time
      if (packet.type === MODES.THINK_AND_COUNT.ANSWER_SUBMITTED) {
        setRoundProgress((prev) => {
          if (!prev[packet.playerId]) return prev;
          return {
            ...prev,
            [packet.playerId]: {
              ...prev[packet.playerId],
              isFinished: true,
            },
          };
        });
      }

      // 🏆 ROUND SUMMARY: Authoritative signal that ALL players have answered.
      // This is the ONLY place where we show the leaderboard.
      if (packet.type === "TC_ROUND_SUMMARY") {
        console.log(
          "🏆 [GameLogic] Received Leaderboard Summary for Round:",
          packet.round,
        );

        setLeaderboardData(packet.leaderboard);

        // Update progress with final correctCount from authoritative summary
        setRoundProgress((prev) => {
          const updated = { ...prev };
          packet.leaderboard.forEach((item: any) => {
            updated[item.id] = {
              ...updated[item.id],
              isFinished: true,
              correctCount: item.correctCount,
            };
          });
          return updated;
        });

        // ✅ NOW show the leaderboard — waiting overlay goes away automatically
        roundSummaryReceivedRef.current = true;
        setIsWaitingForOthers(false);
        setIsLeaderboardVisible(true);

        // 💰 WINNER PAYOUT: Only on the final round and only for the top player
        if (packet.isLastRound && packet.leaderboard[0]?.id === localPlayerId) {
          const coins = QuizEngine.state.totalPot;
          if (coins > 0) {
            dispatch(updateCoins(coins));
            toast.success("CHAMPION!", `You won the coins of ${coins} coins!`);
          }
        }
      }

      // 📡 QUESTION SYNC: Only apply if we are NOT already on leaderboard
      // (prevents a late sync overwriting the leaderboard state)
      if (
        packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC &&
        !isLeaderboardVisible
      ) {
        setQuestion(packet.question);
        if (packet.round > questionIndex + 1) {
          setQuestionIndex(packet.round - 1);
        }
      }

      // 🚪 GAME END: Host quit — refund innocent non-host players
      if (
        packet.type === MODES.THINK_AND_COUNT.GAME_END &&
        packet.reason === "host_quit"
      ) {
        if (!isHost) {
          const refund = packet.stake || 0;
          console.log(
            `💰 [GameLogic] Host quit — refunding ${refund} coins to innocent player.`,
          );

          if (refund > 0) {
            dispatch(updateCoins(refund));
            toast.success(
              "Coins Refunded!",
              `${refund} coins returned because the host left the game.`,
              4000,
            );
          }

          // Navigate back to home
          clearTimer();
          AudioEngine.stop("timer");
          resetGame();
          dispatch(resetDifficulty());
          requestAnimationFrame(() => {
            router.dismissAll();
            router.replace("/mode-select" as any);
          });
        }
      }
    });

    return () => unsubscribe();
  }, [isLeaderboardVisible, questionIndex, dispatch, localPlayerId]);

  /* ---------------- EXIT MODAL STATE ---------------- */

  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const isHost = localPlayerId === "host_id";

  /* ---------------- RESET / QUIT ---------------- */

  const resetGame = useCallback(() => {
    clearTimer();
    setQuestionIndex(0);
    setCorrectAnswer(0);
    setWrongAnswer(0);
    setNotAnswer(0);
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setFiftyFiftyUsageCount(0);
    setQuestion(getNextQuestion());
  }, [clearTimer, getNextQuestion]);

  const handleNavigation = useCallback(
    (targetRoute: string) => {
      try {
        resetGame();
        dispatch(resetDifficulty());

        requestAnimationFrame(() => {
          router.dismissAll();
          router.replace(targetRoute as any);
        });
      } catch (err) {
        console.error("Navigation failed:", err);
      }
    },
    [dispatch, resetGame, router],
  );

  const handleQuit = useCallback(
    () => handleNavigation("/mode-select"),
    [handleNavigation],
  );
  const handleStats = useCallback(
    () => handleNavigation("/stats"),
    [handleNavigation],
  );
  const handleEarn = useCallback(
    () => handleNavigation("/earn"),
    [handleNavigation],
  );

  /**
   * 🛡️ Double-tap guarded exit handler.
   * RULES:
   * - Single player: Clean exit, no penalty.
   * - HOST exits multiplayer: Stake was already deducted at game start — no double deduction.
   *   Just show message that stake is lost, end the game, kill bots.
   * - NON-HOST exits multiplayer by choice: Stake already deducted — show stake lost message,
   *   remove self from engine so the game continues for others.
   */
  const isQuittingRef = useRef(false);

  const handleConfirmExit = useCallback(async () => {
    if (isQuittingRef.current) return; // 🛡️ double-tap guard
    isQuittingRef.current = true;

    try {
      clearTimer();
      AudioEngine.stop("timer");
      setIsExitModalVisible(false);

      if (isMultiplayer) {
        const stake = QuizEngine.state.stake;

        if (isHost) {
          // HOST: End the entire session
          // Stake was already cut at game start — no double deduction.
          console.log(
            `🚪 [GameLogic] Host leaving — stake (${stake}) already deducted, ending session.`,
          );

          if (stake > 0) {
            toast.error(
              "Stake Lost!",
              `Your ${stake} coins are lost because you left the game in the middle.`,
              4000,
            );
          }

          // 📡 Broadcast TC_GAME_END so non-host players get refunded
          handleIncomingPacket({
            type: MODES.THINK_AND_COUNT.GAME_END,
            reason: "host_quit",
            stake: stake,
          });

          const { BotEngine } = require("@/service/BotEngine");
          BotEngine.reset();
          QuizEngine.reset();
        } else {
          // NON-HOST exits by choice: Stake already deducted at start — it's lost.
          console.log(
            `🚪 [GameLogic] Player ${localPlayerId} leaving — stake (${stake}) lost.`,
          );

          if (stake > 0) {
            toast.warning(
              "Stake Lost",
              `Your ${stake} coins are lost because you left the game.`,
              3000,
            );
          }

          QuizEngine.removePlayer(localPlayerId);
        }
      }
      // Single player: No penalty — just exit cleanly.

      resetGame();
      dispatch(resetDifficulty());

      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace("/mode-select" as any);
      });
    } catch (error) {
      console.error("Error during exit:", error);
    } finally {
      isQuittingRef.current = false;
    }
  }, [
    clearTimer,
    isMultiplayer,
    isHost,
    localPlayerId,
    dispatch,
    resetGame,
    router,
  ]);

  /**
   * Opens the exit modal — immediately pauses the timer and kills the
   * ticking sound so the modal feels clean and silent.
   */
  const handleQuitInMiddle = useCallback(() => {
    clearTimer();
    AudioEngine.stop("timer");
    setIsExitModalVisible(true);
  }, [clearTimer]);

  /**
   * User cancelled the exit modal — resume the timer and sound
   * from wherever they left off.
   */
  const handleCancelExit = useCallback(() => {
    setIsExitModalVisible(false);
    // Restart the timer from the current countdown value
    if (countdown > 0) {
      AudioEngine.play("timer", "gameplay");
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [countdown, handleTimeUp]);

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
    isLeaderboardVisible,
    setIsLeaderboardVisible,
    leaderboardData,
    isMultiplayer,
    isWaitingForOthers,
    roundProgress,
    localPlayerId,
    // Exit modal
    isExitModalVisible,
    setIsExitModalVisible,
    handleConfirmExit,
    handleCancelExit,
    isHost,
  };
};
