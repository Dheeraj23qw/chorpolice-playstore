import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AudioEngine } from "@/audio/audioEngine";

import { AppDispatch, RootState } from "@/redux/store";
import { useGameTableAndScores } from "@/hooks/questionhook/quizhook";
import { useRouter } from "expo-router";
import useRandomMessage from "../useRandomMessage";
import {
  resetDifficulty,
  setCorrectAnswers,
  setWinner,
} from "@/redux/reducers/quiz";
import { 
  markStakeDebited, 
  setSettlementStatus 
} from "@/redux/reducers/sessionSlice";
import { selectIsReconnectActive } from "@/redux/reducers/reconnectSlice";
import { selectEconomy } from "@/redux/selectors/sessionSelectors";
import store from "@/redux/store";
import { toast } from "@/components/feedback/toast";

import {
  broadcastPacket,
  handleIncomingPacket,
  sendPacketToHost,
  stopSession,
  subscribeToPackets,
} from "@/service/lanGameService";
// BOT-2 FIX: was require("@/service/BotEngine") at call sites — wrong path, runtime crash
import { BotEngine } from "@/service/QuizBotEngine";
import { MODES, NETWORK } from "@/constants/Networking";
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

const MEDIA = {
  CORRECT: 7,
  WRONG: 6,
  TIMEUP: 8,
} as const;

const HOST_TIMEOUT_MS = 15000;

export const useQuizGameLogic = () => {
  const { table, getRandomQuestion } = useGameTableAndScores();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const difficulty = useSelector((state: RootState) => state.difficulty.level);

  // BOT-1 FIX: was getSessionContext() from transport layer — not reactive, can be stale
  // Using Redux state for stable, reactive identity
  const sessionState = useSelector((state: RootState) => state.session);
  const economy = useSelector(selectEconomy);
  const localPlayerId = sessionState.localPlayerId || "host_id";
  const isHost = sessionState.isHost || localPlayerId === "host_id";
  const isMultiplayer = Object.keys(QuizEngine.state.playerScores).length > 1;

  // BOT-5 FIX: guard against double stake deduction on hook remount
  const stakeDeductedRef = useRef(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const postAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const leaderboardAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastQuestionRef = useRef<any>(null);
  const initialHostSyncSentRef = useRef(false);
  const roundSummaryReceivedRef = useRef(false);
  const roundLockedRef = useRef(false);
  const roundAdvanceInFlightRef = useRef(false);
  const currentQuestionIdRef = useRef<string | null>(null);
  const roundStartedAtRef = useRef<number | null>(null);
  const roundDeadlineAtRef = useRef<number | null>(null);
  const hostClockOffsetRef = useRef(0);
  const lastHostSignalAtRef = useRef(Date.now());
  const hostDisconnectHandledRef = useRef(false);
  const isQuizTimerFrozenLoggedRef = useRef(false);

  const buildLocalQuestionId = useCallback(
    (round: number) => `tc-local-${round}-${Date.now()}`,
    [],
  );

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
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [isWaitingForOthers, setIsWaitingForOthers] = useState(false);
  const [isExitModalVisible, setIsExitModalVisible] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isPersonalSummaryVisible, setIsPersonalSummaryVisible] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    isMultiplayer ? null : buildLocalQuestionId(1),
  );
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

  const [question, setQuestion] = useState(() => {
    const nextQuestion = getRandomQuestion();
    lastQuestionRef.current = nextQuestion;
    return nextQuestion;
  });

  useEffect(() => {
    if (!isMultiplayer && !currentQuestionIdRef.current && activeQuestionId) {
      currentQuestionIdRef.current = activeQuestionId;
    }
  }, [activeQuestionId, isMultiplayer]);

  const randomWin = useRandomMessage("winwithoutname");
  const randomLose = useRandomMessage("loserwithoutname");
  const randomTimeUp = useRandomMessage("timesup");

  const getTimeLimitMs = useCallback(() => {
    return TIMER_BY_DIFFICULTY[difficulty ?? "easy"] * 1000;
  }, [difficulty]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearPostAnswerTimeout = useCallback(() => {
    if (postAnswerTimeoutRef.current) {
      clearTimeout(postAnswerTimeoutRef.current);
      postAnswerTimeoutRef.current = null;
    }
  }, []);

  const clearLeaderboardAdvanceTimeout = useCallback(() => {
    if (leaderboardAdvanceTimeoutRef.current) {
      clearTimeout(leaderboardAdvanceTimeoutRef.current);
      leaderboardAdvanceTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLeaderboardAdvanceTimeout();
    };
  }, [clearLeaderboardAdvanceTimeout]);

  const generateUniqueQuestion = useCallback(() => {
    let nextQuestion = getRandomQuestion();

    while (nextQuestion === lastQuestionRef.current) {
      nextQuestion = getRandomQuestion();
    }

    lastQuestionRef.current = nextQuestion;
    return nextQuestion;
  }, [getRandomQuestion]);

  const advanceMultiplayerRound = useCallback(() => {
    if (!isMultiplayer || !isHost) {
      return false;
    }

    if (roundAdvanceInFlightRef.current) {
      return true;
    }

    roundAdvanceInFlightRef.current = true;
    clearLeaderboardAdvanceTimeout();

    const nextQuestion = generateUniqueQuestion();
    const nextRound = QuizEngine.state.currentRound;
    const startAt = Date.now();
    const durationMs = getTimeLimitMs();

    if (__DEV__) {
      console.log(`[Quiz] Advancing from leaderboard to round ${nextRound}.`);
    }

    broadcastPacket({
      type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
      question: nextQuestion,
      optionsLength: nextQuestion?.options?.length || 0,
      round: nextRound,
      questionId: `tc-round-${nextRound}-${startAt}`,
      roundStartedAt: startAt,
      deadlineAt: startAt + durationMs,
      durationMs,
      serverNow: Date.now(),
    });

    return true;
  }, [
    clearLeaderboardAdvanceTimeout,
    generateUniqueQuestion,
    getTimeLimitMs,
    isHost,
    isMultiplayer,
  ]);

  const initRoundProgress = useCallback(() => {
    if (!isMultiplayer) return;

    const progress: Record<string, any> = {};
    Object.values(QuizEngine.state.playerScores).forEach((player) => {
      progress[player.id] = {
        id: player.id,
        name: player.name,
        isFinished: false,
        correctCount: player.correctCount ?? 0,
        avatarId: player.avatarId,
      };
    });
    setRoundProgress(progress);
  }, [isMultiplayer]);

  const markPlayerFinished = useCallback(
    (playerId: string, correctCount?: number) => {
      setRoundProgress((prev) => {
        if (!prev[playerId]) return prev;
        return {
          ...prev,
          [playerId]: {
            ...prev[playerId],
            isFinished: true,
            correctCount:
              typeof correctCount === "number"
                ? correctCount
                : prev[playerId].correctCount,
          },
        };
      });
    },
    [],
  );

  const queuePostAnswerTransition = useCallback(() => {
    clearPostAnswerTimeout();
    postAnswerTimeoutRef.current = setTimeout(() => {
      postAnswerTimeoutRef.current = null;
      setIsDynamicPopUp(false);

      if (!isMultiplayer) {
        setShowHint(true);
        return;
      }

      if (!roundSummaryReceivedRef.current) {
        setIsWaitingForOthers(true);
      }
    }, POPUP_DELAY);
  }, [clearPostAnswerTimeout, isMultiplayer]);

  const syncLocalQuizStats = useCallback(
    (leaderboard?: Array<{ id: string; correctCount?: number }>) => {
      if (!isMultiplayer) {
        dispatch(setCorrectAnswers(correctAnswer));
        return;
      }

      const effectiveLeaderboard =
        leaderboard ||
        Object.values(QuizEngine.state.playerScores).map((player) => ({
          id: player.id,
          correctCount: player.correctCount,
        }));

      const myStats = effectiveLeaderboard.find(
        (player) => player.id === localPlayerId,
      );
      const winnerId = effectiveLeaderboard[0]?.id;

      dispatch(setCorrectAnswers(myStats?.correctCount ?? 0));
      dispatch(setWinner(winnerId === localPlayerId));
    },
    [correctAnswer, dispatch, isMultiplayer, localPlayerId],
  );

  const applyQuestionSync = useCallback(
    (packet: any, options: { force?: boolean } = {}) => {
      const incomingRound = packet.round || 1;
      const currentDisplayedRound = questionIndex + 1;
      const incomingQuestionId = packet.questionId || buildLocalQuestionId(incomingRound);

      if (!options.force) {
        if (incomingRound < currentDisplayedRound) {
          return;
        }

        if (
          incomingRound === currentDisplayedRound &&
          currentQuestionIdRef.current === incomingQuestionId
        ) {
          return;
        }

        if (
          incomingRound === currentDisplayedRound &&
          currentQuestionIdRef.current
        ) {
          return;
        }
      }

      clearTimer();
      clearPostAnswerTimeout();
      clearLeaderboardAdvanceTimeout();

      roundLockedRef.current = false;
      roundSummaryReceivedRef.current = false;
      roundAdvanceInFlightRef.current = false;
      hostClockOffsetRef.current =
        typeof packet.serverNow === "number" ? packet.serverNow - Date.now() : 0;
      roundStartedAtRef.current =
        packet.roundStartedAt || packet.serverNow || Date.now();
      roundDeadlineAtRef.current =
        packet.deadlineAt ||
        (roundStartedAtRef.current + (packet.durationMs || getTimeLimitMs()));
      currentQuestionIdRef.current = packet.questionId;
      setQuestion(packet.question);
      setMatchHistory((prev) => {
        // Prevent duplicates for same questionId
        if (prev.some(q => q.questionId === packet.questionId)) return prev;
        return [...prev, { ...packet.question, questionId: packet.questionId }];
      });
      setQuestionIndex(packet.round - 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setIsDynamicPopUp(false);
      setMediaId(1);
      setPlayerMessage({});
      setRemainingOptions(null);
      setIsFiftyFiftyActive(false);
      setShowHint(false);
      setIsHintButtonVisible(false);
      setIsWaitingForOthers(false);
      setIsLeaderboardVisible(false);
      setLeaderboardData(null);
      setActiveQuestionId(incomingQuestionId);
      const deadlineAt = roundDeadlineAtRef.current ?? Date.now();
      setCountdown(
        Math.max(
          0,
          Math.ceil(
            (deadlineAt - (Date.now() + hostClockOffsetRef.current)) / 1000,
          ),
        ),
      );

      initRoundProgress();
    },
    [
      buildLocalQuestionId,
      clearPostAnswerTimeout,
      clearTimer,
      getTimeLimitMs,
      initRoundProgress,
      questionIndex,
    ],
  );

  const submitMultiplayerAnswer = useCallback(
    (wasCorrect: boolean, optionIndex?: number) => {
      if (!isMultiplayer || !currentQuestionIdRef.current) return;

      const packet = {
        type: MODES.THINK_AND_COUNT.ANSWER_SUBMITTED,
        playerId: localPlayerId,
        round: questionIndex + 1,
        questionId: currentQuestionIdRef.current,
        isCorrect: wasCorrect,
        optionIndex,
        timestamp: Date.now(),
      };

      if (isHost) {
        handleIncomingPacket(packet);
        return;
      }

      sendPacketToHost(packet);
    },
    [isHost, isMultiplayer, localPlayerId, questionIndex],
  );

  const handleTimeUp = useCallback(() => {
    if (roundLockedRef.current) return;
    
    // 🔥 PAUSE GUARD: If reconnecting or disconnected, prevent auto-submit
    if (selectIsReconnectActive(store.getState())) {
      console.log("[LAN][MATCH] Quiz auto-submit blocked due to disconnect");
      return;
    }

    roundLockedRef.current = true;
    clearTimer();
    AudioEngine.stop("timer");
    clearPostAnswerTimeout();

    setNotAnswer((prev) => prev + 1);
    setMediaId(MEDIA.TIMEUP);
    setPlayerMessage({ message: randomTimeUp });
    setIsDynamicPopUp(true);

    if (isMultiplayer) {
      markPlayerFinished(localPlayerId);
      submitMultiplayerAnswer(false);
    }

    queuePostAnswerTransition();
  }, [
    clearPostAnswerTimeout,
    clearTimer,
    isMultiplayer,
    localPlayerId,
    markPlayerFinished,
    queuePostAnswerTransition,
    randomTimeUp,
    submitMultiplayerAnswer,
  ]);

  const startTimer = useCallback(() => {
    clearTimer();

    if (!activeQuestionId) {
      return;
    }

    if (isMultiplayer && !roundDeadlineAtRef.current) {
      return;
    }

    if (!roundStartedAtRef.current || !roundDeadlineAtRef.current) {
      const now = Date.now();
      hostClockOffsetRef.current = 0;
      roundStartedAtRef.current = now;
      roundDeadlineAtRef.current = now + getTimeLimitMs();
    }

    const tick = () => {
      if (!roundDeadlineAtRef.current) return;
      
      // 🔥 PAUSE GUARD: If reconnecting, freeze countdown
      if (selectIsReconnectActive(store.getState())) {
        if (!isQuizTimerFrozenLoggedRef.current) {
          console.log("[LAN][MATCH] Quiz timer frozen due to disconnect");
          console.log("[LAN][MATCH] Gameplay frozen during reconnect");
          isQuizTimerFrozenLoggedRef.current = true;
        }
        return;
      } else {
        isQuizTimerFrozenLoggedRef.current = false;
      }

      const remainingMs = Math.max(
        0,
        roundDeadlineAtRef.current - (Date.now() + hostClockOffsetRef.current),
      );
      const nextCountdown = remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;

      setCountdown((prev) => (prev === nextCountdown ? prev : nextCountdown));

      if (remainingMs <= 0) {
        handleTimeUp();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 250);
  }, [activeQuestionId, clearTimer, getTimeLimitMs, handleTimeUp, isMultiplayer]);

  useEffect(() => {
    if (!activeQuestionId) return;
    if (isMultiplayer && !roundDeadlineAtRef.current) return;

    AudioEngine.play("timer", "gameplay");
    startTimer();

    return () => {
      clearTimer();
      AudioEngine.stop("timer");
    };
  }, [activeQuestionId, clearTimer, isMultiplayer, startTimer]);

  useEffect(() => {
    if (isMultiplayer) {
      initRoundProgress();
    }
  }, [initRoundProgress, isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer || !QuizEngine.state.currentQuestionId) {
      return;
    }

    const syncedQuestionId = QuizEngine.state.currentQuestionId;
    if (
      syncedQuestionId &&
      currentQuestionIdRef.current === syncedQuestionId &&
      activeQuestionId === syncedQuestionId &&
      roundDeadlineAtRef.current
    ) {
      return;
    }

    applyQuestionSync(
      {
        type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
        question: QuizEngine.state.currentQuestion,
        questionId: QuizEngine.state.currentQuestionId,
        round: QuizEngine.state.currentRound,
        roundStartedAt: QuizEngine.state.roundStartedAt,
        deadlineAt: QuizEngine.state.roundDeadlineAt,
        durationMs: getTimeLimitMs(),
        serverNow: Date.now(),
      },
      { force: true },
    );
  }, [activeQuestionId, applyQuestionSync, getTimeLimitMs, isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer || !isHost || initialHostSyncSentRef.current) {
      return;
    }

    const startAt = Date.now();
    const durationMs = getTimeLimitMs();
    const packet = {
      type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
      question,
      optionsLength: question?.options?.length || 0,
      round: QuizEngine.state.currentRound,
      questionId: `tc-round-${QuizEngine.state.currentRound}-${startAt}`,
      roundStartedAt: startAt,
      deadlineAt: startAt + durationMs,
      durationMs,
      serverNow: Date.now(),
    };

    initialHostSyncSentRef.current = true;
    applyQuestionSync(packet, { force: true });
    handleIncomingPacket(packet);

    const syncTimeout = setTimeout(() => {
      broadcastPacket({ ...packet, serverNow: Date.now() }, { processLocally: false });
    }, 350);

    return () => clearTimeout(syncTimeout);
  }, [applyQuestionSync, getTimeLimitMs, isHost, isMultiplayer, question]);

  useEffect(() => {
    if (!isMultiplayer || !economy.matchId || economy.stakeDebited || economy.stakeAmount <= 0) {
      return;
    }

    console.log(`[ECONOMY] Debiting stake for T&C match: ${economy.matchId}`);
    dispatch(markStakeDebited());
    dispatch(updateCoins(-economy.stakeAmount));
    toast.info("Match Started", `Stake of ${economy.stakeAmount} coins debited.`);
  }, [isMultiplayer, economy.matchId, economy.stakeDebited, economy.stakeAmount, dispatch]);

  const handleAnswerSelection = useCallback(
    (answer: string) => {
      if (roundLockedRef.current || !question) return;

      // 🔥 PAUSE GUARD: If reconnecting or disconnected, prevent answer
      if (selectIsReconnectActive(store.getState())) {
        console.log("[LAN][MATCH] Quiz answer blocked due to disconnect");
        return;
      }

      roundLockedRef.current = true;
      clearTimer();
      AudioEngine.stop("timer");
      clearPostAnswerTimeout();

      setSelectedAnswer(answer);
      setIsDynamicPopUp(true);

      const wasCorrect = answer === question.correctAnswer;
      const optionIndex = (question.options as string[])?.indexOf(answer);

      setIsCorrect(wasCorrect);

      if (wasCorrect) {
        setCorrectAnswer((prev) => prev + 1);
        setMediaId(MEDIA.CORRECT);
        setPlayerMessage({ message: randomWin });
        AudioEngine.play("win", "gameplay");
      } else {
        setWrongAnswer((prev) => prev + 1);
        setMediaId(MEDIA.WRONG);
        setPlayerMessage({ message: randomLose });
        AudioEngine.play("lose", "gameplay");
      }

      if (isMultiplayer) {
        markPlayerFinished(localPlayerId);
        submitMultiplayerAnswer(wasCorrect, optionIndex);
      }

      queuePostAnswerTransition();
    },
    [
      clearPostAnswerTimeout,
      clearTimer,
      isMultiplayer,
      localPlayerId,
      markPlayerFinished,
      queuePostAnswerTransition,
      question,
      randomLose,
      randomWin,
      submitMultiplayerAnswer,
    ],
  );

  const handleFiftyFifty = useCallback(() => {
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
      (option: string) => option !== question.correctAnswer,
    );

    const shuffled = [...incorrect].sort(() => 0.5 - Math.random());
    const filtered = question.options.filter(
      (option: string) => !shuffled.slice(0, 2).includes(option),
    );

    setRemainingOptions(filtered);
    setIsFiftyFiftyActive(true);

    const nextCount = fiftyFiftyUsageCount + 1;
    setFiftyFiftyUsageCount(nextCount);

    if (nextCount === 1) {
      toast.success("50-50 Activated!", "1 lifeline used. 1 remaining.", 2000);
    } else {
      toast.warning(
        "Final Lifeline!",
        "No 50-50 lifelines left. Use it wisely!",
        3000,
      );
    }
  }, [fiftyFiftyUsageCount, question]);

  const handleNextQuestion = useCallback(() => {
    if (selectIsReconnectActive(store.getState())) {
      console.log("[LAN][MATCH] Quiz action blocked during reconnect");
      return;
    }
    AudioEngine.play("next", "ui");
    clearPostAnswerTimeout();
    clearLeaderboardAdvanceTimeout();

    if (questionIndex + 1 >= NUM_QUESTIONS) {
      if (isMultiplayer) {
        setIsPersonalSummaryVisible(true);
        setIsLeaderboardVisible(false);
        setIsWaitingForOthers(false);
      } else {
        handleQuit();
      }
      return;
    }

    if (isMultiplayer) {
      if (!isHost) return;
      advanceMultiplayerRound();
      return;
    }

    const nextRound = questionIndex + 2;
    const nextQuestion = generateUniqueQuestion();
    const nextQuestionId = buildLocalQuestionId(nextRound);
    const startAt = Date.now();

    roundLockedRef.current = false;
    roundSummaryReceivedRef.current = false;
    hostClockOffsetRef.current = 0;
    currentQuestionIdRef.current = nextQuestionId;
    roundStartedAtRef.current = startAt;
    roundDeadlineAtRef.current = startAt + getTimeLimitMs();

    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsDynamicPopUp(false);
    setMediaId(1);
    setPlayerMessage({});
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setShowHint(false);
    setIsHintButtonVisible(false);
    setIsWaitingForOthers(false);
    setIsLeaderboardVisible(false);
    setLeaderboardData(null);
    setQuestion(nextQuestion);
    setQuestionIndex(nextRound - 1);
    setActiveQuestionId(nextQuestionId);
  }, [
    advanceMultiplayerRound,
    buildLocalQuestionId,
    clearLeaderboardAdvanceTimeout,
    clearPostAnswerTimeout,
    clearTimer,
    generateUniqueQuestion,
    getTimeLimitMs,
    isHost,
    isMultiplayer,
    questionIndex,
  ]);

  useEffect(() => {
    const unsubscribe = subscribeToPackets((packet, sourceIp) => {
      if (!packet?.type) return;

      if (!isHost && sourceIp) {
        lastHostSignalAtRef.current = Date.now();
      }

      if (packet.type === MODES.THINK_AND_COUNT.ANSWER_SUBMITTED) {
        markPlayerFinished(packet.playerId);
      }

      if (packet.type === "TC_ROUND_SUMMARY") {
        if (packet.round !== questionIndex + 1) {
          return;
        }

        clearPostAnswerTimeout();
        clearLeaderboardAdvanceTimeout();
        setIsDynamicPopUp(false);
        setLeaderboardData(packet.leaderboard);
        setRoundProgress((prev) => {
          const updated = { ...prev };
          packet.leaderboard.forEach((item: any) => {
            updated[item.id] = {
              ...(updated[item.id] || {}),
              id: item.id,
              name: item.name,
              avatarId: item.avatarId,
              isFinished: true,
              correctCount: item.correctCount,
            };
          });
          return updated;
        });

        roundSummaryReceivedRef.current = true;
        roundLockedRef.current = false;
        roundAdvanceInFlightRef.current = false;
        setIsWaitingForOthers(false);
        setIsLeaderboardVisible(true);

        if (isHost && !packet.isLastRound) {
          // 🔥 REMOVED: Automatic advance timeout. 
          // Progression is now manual via the host's "Next Round" button.
        }

        if (packet.isLastRound) {
          syncLocalQuizStats(packet.leaderboard);
        }

        // 🔥 SETTLEMENT: Only credit if not already settled/refunded
        if (packet.isLastRound) {
          const s = store.getState().session;
          if (s.economy.settlementStatus === "PENDING") {
            dispatch(setSettlementStatus("SETTLED"));
            
            const leaderboard = packet.leaderboard ?? [];
            if (leaderboard.length > 0) {
              const maxScore = leaderboard[0].correctCount;
              const winners = leaderboard.filter((p: any) => p.correctCount === maxScore);
              const isLocalWinner = winners.some((p: any) => p.id === localPlayerId);

              if (isLocalWinner) {
                const totalPot = QuizEngine.state.totalPot;
                const splitPot = Math.floor(totalPot / winners.length);

                if (splitPot > 0) {
                  dispatch(updateCoins(splitPot));
                  const winMsg = winners.length > 1
                    ? `You tied for 1st! Shared pot: ${splitPot} coins.`
                    : `You won the full pot of ${splitPot} coins!`;
                  toast.success("CHAMPION! 🏆", winMsg);
                }
              }
            }
          }
        }
      }

      if (packet.type === MODES.THINK_AND_COUNT.QUESTION_SYNC) {
        applyQuestionSync(packet);
      }

      if (packet.type === MODES.THINK_AND_COUNT.GAME_END) {
        if (packet.reason === "completed") {
          clearTimer();
          clearPostAnswerTimeout();
          AudioEngine.stop("timer");
          syncLocalQuizStats(leaderboardData);
          if (isMultiplayer) {
            BotEngine.reset();
          }
          stopSession();
          requestAnimationFrame(() => {
            router.push({ pathname: "/quiz-result" } as any);
          });
          return;
        }

        const s = store.getState().session;
        const leaverId = packet.leaverId as string | undefined;
        const isLeaver = localPlayerId === leaverId;
        const refund = !isLeaver && s.economy.stakeDebited && s.economy.settlementStatus === "PENDING"
          ? s.economy.stakeAmount
          : 0;

        if (refund > 0) {
          dispatch(setSettlementStatus("REFUNDED"));
          dispatch(updateCoins(refund));
          toast.success(
            "Refunded (Fairness)",
            packet.reason === "host_quit"
              ? `Host left. Your ${refund} coins were returned.`
              : `A player left. Your ${refund} coins were returned.`,
            5000,
          );
        } else if (!isLeaver) {
          const msg = packet.reason === "host_quit" ? "Host left the game." : "Match ended for fairness.";
          toast.error("Match Ended", msg, 4000);
        }

        clearTimer();
        clearPostAnswerTimeout();
        AudioEngine.stop("timer");
        if (isMultiplayer) {
          BotEngine.reset();
        }
        stopSession();
        QuizEngine.reset();
        dispatch(resetDifficulty());
        requestAnimationFrame(() => {
          router.dismissAll();
          router.replace("/mode-select" as any);
        });
        return;
      }

      if (packet.type === NETWORK.PLAYER_LEAVE && packet.playerId) {
        if (packet.playerId !== localPlayerId) {
          if (isHost) {
            broadcastPacket({
              type: MODES.THINK_AND_COUNT.GAME_END,
              reason: "player_left",
              leaverId: packet.playerId,
              stake: QuizEngine.state.stake,
            });
          } else if (packet.playerId === "host_id" || packet.reason === "host_disconnected") {
            // Host disconnected — trigger refund and exit
            const s = store.getState().session;
            const refund = s.economy.stakeDebited && s.economy.settlementStatus === "PENDING"
              ? s.economy.stakeAmount
              : 0;

            void (async () => {
              if (refund > 0) {
                dispatch(setSettlementStatus("REFUNDED"));
                dispatch(updateCoins(refund));
                toast.success("Refunded (Host Lost)", `The host disconnected. Your ${refund} coins were returned.`, 5000);
              } else {
                toast.error("Match Ended", "The host disconnected.", 4000);
              }
              
              clearTimer();
              clearPostAnswerTimeout();
              AudioEngine.stop("timer");
              if (isMultiplayer) BotEngine.reset();
              await stopSession();
              QuizEngine.reset();
              dispatch(resetDifficulty());
              router.dismissAll();
              router.replace("/mode-select" as any);
            })();
          }
          return;
        }

        if (!isHost) {
          clearTimer();
          clearPostAnswerTimeout();
          AudioEngine.stop("timer");
          toast.error("Disconnected", "You were removed from the game.", 3000);
          stopSession();
          QuizEngine.reset();
          dispatch(resetDifficulty());
          requestAnimationFrame(() => {
            router.dismissAll();
            router.replace("/mode-select" as any);
          });
        }
      }

      if (packet.type === NETWORK.SYNC_STATE) {
        console.log("[QuizHook] Handling SYNC_STATE packet");
        // State restoration logic handled by engines, hook just needs to update its local derived refs/states
        // Most reactive state comes from QuizEngine.state which applyQuestionSync reads.
        if (packet.engineState) {
          // Force a sync of the current question if available
          applyQuestionSync({
            type: MODES.THINK_AND_COUNT.QUESTION_SYNC,
            question: packet.engineState.currentQuestion,
            questionId: packet.engineState.currentQuestionId,
            round: packet.engineState.currentRound,
            roundStartedAt: packet.engineState.roundStartedAt,
            deadlineAt: packet.engineState.roundDeadlineAt,
            durationMs: getTimeLimitMs(),
            serverNow: Date.now(),
          }, { force: true });
        }
      }
    });

    return () => unsubscribe();
  }, [
    advanceMultiplayerRound,
    applyQuestionSync,
    clearLeaderboardAdvanceTimeout,
    clearPostAnswerTimeout,
    clearTimer,
    dispatch,
    isHost,
    isMultiplayer,
    localPlayerId,
    leaderboardData,
    markPlayerFinished,
    questionIndex,
    router,
    syncLocalQuizStats,
  ]);

  useEffect(() => {
    if (isHost || !isMultiplayer) {
      return;
    }

    const interval = setInterval(() => {
      if (hostDisconnectHandledRef.current) {
        return;
      }

      if (Date.now() - lastHostSignalAtRef.current < HOST_TIMEOUT_MS) {
        return;
      }

      hostDisconnectHandledRef.current = true;
      clearTimer();
      clearPostAnswerTimeout();
      AudioEngine.stop("timer");
      const refund = QuizEngine.state.stake || 0;
      if (refund > 0) {
        dispatch(updateCoins(refund));
      }
      stopSession();
      QuizEngine.reset();
      dispatch(resetDifficulty());
      toast.error(
        "Host Disconnected",
        refund > 0
          ? `${refund} coins returned because the host disconnected.`
          : "The host connection was lost. Returning to the lobby.",
        4000,
      );
      requestAnimationFrame(() => {
        router.dismissAll();
        router.replace("/mode-select" as any);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [
    clearPostAnswerTimeout,
    clearTimer,
    dispatch,
    isHost,
    isMultiplayer,
    router,
    syncLocalQuizStats,
  ]);

  const resetGame = useCallback(() => {
    clearTimer();
    clearPostAnswerTimeout();
    roundLockedRef.current = false;
    roundSummaryReceivedRef.current = false;
    currentQuestionIdRef.current = null;
    roundStartedAtRef.current = null;
    roundDeadlineAtRef.current = null;
    hostClockOffsetRef.current = 0;

    setQuestionIndex(0);
    setCorrectAnswer(0);
    setWrongAnswer(0);
    setNotAnswer(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsDynamicPopUp(false);
    setMediaId(1);
    setPlayerMessage({});
    setRemainingOptions(null);
    setIsFiftyFiftyActive(false);
    setShowHint(false);
    setFiftyFiftyUsageCount(0);
    setIsHintButtonVisible(false);
    setIsWaitingForOthers(false);
    setIsLeaderboardVisible(false);
    setLeaderboardData(null);
    setActiveQuestionId(null);
  }, [clearPostAnswerTimeout, clearTimer]);

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

  const handleOpenFinalLeaderboard = useCallback(() => {
    clearTimer();
    clearPostAnswerTimeout();
    clearLeaderboardAdvanceTimeout();
    AudioEngine.stop("timer");

    requestAnimationFrame(() => {
      router.replace("/quiz-result" as any);
    });
  }, [
    clearLeaderboardAdvanceTimeout,
    clearPostAnswerTimeout,
    clearTimer,
    router,
  ]);

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

  const isQuittingRef = useRef(false);

  const handleConfirmExit = useCallback(async () => {
    if (isQuittingRef.current) return;
    isQuittingRef.current = true;

    try {
      clearTimer();
      clearPostAnswerTimeout();
      AudioEngine.stop("timer");
      setIsExitModalVisible(false);

      if (isMultiplayer) {
        const stake = QuizEngine.state.stake;

        if (isHost) {
          if (stake > 0) {
            toast.error(
              "Stake Lost!",
              `Your ${stake} coins are lost because you left the game in the middle.`,
              4000,
            );
          }

          broadcastPacket(
            {
              type: MODES.THINK_AND_COUNT.GAME_END,
              reason: "host_quit",
              stake,
            },
            { processLocally: false },
          );

          await new Promise<void>((resolve) => {
            const flushTimer = setTimeout(() => resolve(), 150);
            postAnswerTimeoutRef.current = flushTimer;
          });

          BotEngine.reset();
          QuizEngine.reset();
        } else {
          if (stake > 0) {
            toast.warning(
              "Stake Lost",
              `Your ${stake} coins are lost because you left the game.`,
              3000,
            );
          }

          sendPacketToHost({
            type: NETWORK.PLAYER_LEAVE,
            playerId: localPlayerId,
            reason: "player_quit",
          });

          await new Promise<void>((resolve) => {
            const flushTimer = setTimeout(() => resolve(), 150);
            postAnswerTimeoutRef.current = flushTimer;
          });
        }
      }

      stopSession();
      QuizEngine.reset();
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
    clearPostAnswerTimeout,
    clearTimer,
    dispatch,
    isHost,
    isMultiplayer,
    localPlayerId,
    resetGame,
    router,
  ]);

  const handleQuitInMiddle = useCallback(() => {
    if (!isMultiplayer) {
      clearTimer();
      AudioEngine.stop("timer");
    }
    setIsExitModalVisible(true);
  }, [clearTimer, isMultiplayer]);

  const handleCancelExit = useCallback(() => {
    setIsExitModalVisible(false);
    if (!isMultiplayer && !roundLockedRef.current) {
      AudioEngine.play("timer", "gameplay");
      startTimer();
    }
  }, [isMultiplayer, startTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearPostAnswerTimeout();
      AudioEngine.stop("timer");
    };
  }, [clearPostAnswerTimeout, clearTimer]);

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
    isExitModalVisible,
    setIsExitModalVisible,
    handleConfirmExit,
    handleCancelExit,
    isHost,
    isHindi,
    toggleHindi: () => setIsHindi((prev) => !prev),
    matchHistory,
    isPersonalSummaryVisible,
    handleOpenFinalLeaderboard,
    activeQuestionId,
  };
};
