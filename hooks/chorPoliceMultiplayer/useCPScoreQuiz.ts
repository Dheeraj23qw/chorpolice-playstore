import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

import { MODES } from "@/constants/Networking";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { AppDispatch } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { broadcastPacket } from "@/service/lanGameService";

const TOTAL_QUESTIONS = 4;
const QUESTION_DURATION_MS = 7_000;

type ScoreQuizRoundState = "idle" | "answering" | "complete" | "finished";

interface ScoreQuizDeps {
  isHostRef: React.MutableRefObject<boolean>;
  timerRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>;
  currentQuizPlayerIdRef: React.MutableRefObject<string | null>;
  scoreQuizStartedRef: React.MutableRefObject<boolean>;
  quizOptionDisabledRef: React.MutableRefObject<boolean>;
  quizResponseSubmittedRef: React.MutableRefObject<boolean>;
  correctScoreRef: React.MutableRefObject<number>;
  setQuizDone: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizOptionDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizPlayerIndex: React.Dispatch<React.SetStateAction<number>>;
  setQuizOptions: React.Dispatch<React.SetStateAction<number[]>>;
  resolveScoreQuizPlayers: () => any[];
  setQuizCountdown?: React.Dispatch<React.SetStateAction<number | null>>;
  setShowQuizLeaderboard?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsQuizRoundComplete?: React.Dispatch<React.SetStateAction<boolean>>;
  setHasGuessedThisRound?: React.Dispatch<React.SetStateAction<boolean>>;
  setBoostScoreModalVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Host-authoritative Level 2 round controller. The host creates every question,
 * records the first answer from each eligible player, and is the only client that
 * may move from a completed question to the following one.
 */
export const useCPScoreQuiz = ({
  isHostRef,
  timerRefs,
  currentQuizPlayerIdRef,
  scoreQuizStartedRef,
  quizOptionDisabledRef,
  quizResponseSubmittedRef,
  correctScoreRef,
  setQuizDone,
  setQuizOptionDisabled,
  setQuizPlayerIndex,
  setQuizOptions,
  resolveScoreQuizPlayers,
  setQuizCountdown,
  setShowQuizLeaderboard,
  setIsQuizRoundComplete,
  setHasGuessedThisRound,
  setBoostScoreModalVisible,
}: ScoreQuizDeps) => {
  const dispatch = useDispatch<AppDispatch>();

  const pendingGuessesRef = useRef<Map<string, number>>(new Map());
  const currentTargetPlayerIdRef = useRef<string | null>(null);
  const currentQuestionIndexRef = useRef(-1);
  const currentRoundIdRef = useRef(0);
  const currentOptionsRef = useRef<number[]>([]);
  const deadlineRef = useRef(0);
  const roundStateRef = useRef<ScoreQuizRoundState>("idle");
  const scoredRoundsRef = useRef<Set<number>>(new Set());
  const completedRoundsRef = useRef<Set<number>>(new Set());
  const transitionInFlightRef = useRef(false);
  const completionBonusAppliedRef = useRef(false);
  const guessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildQuizOptions = useCallback((baseScore: number) => {
    const variations = [500, 800];
    const options = new Set<number>([baseScore]);

    while (options.size < 3) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const candidate = Math.max(
        0,
        baseScore + (Math.random() < 0.5 ? -variation : variation),
      );
      options.add(candidate);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }, []);

  const evaluateGuesses = useCallback(
    (questionIndex: number) => {
      if (
        !isHostRef.current ||
        roundStateRef.current !== "answering" ||
        currentQuestionIndexRef.current !== questionIndex ||
        scoredRoundsRef.current.has(questionIndex)
      ) {
        return;
      }

      const players = resolveScoreQuizPlayers();
      const targetPlayer = players[questionIndex];
      if (!targetPlayer || currentTargetPlayerIdRef.current !== targetPlayer.id) {
        return;
      }

      scoredRoundsRef.current.add(questionIndex);
      if (guessTimerRef.current) {
        clearTimeout(guessTimerRef.current);
        guessTimerRef.current = null;
      }

      const correctScore = correctScoreRef.current;
      const guesses = pendingGuessesRef.current;
      const playerResults = players.map((player) => {
        if (player.id === targetPlayer.id) {
          return {
            playerId: player.id,
            playerName: player.name,
            guessedScore: null,
            isCorrect: false,
            bonus: 0,
            timedOut: false,
            isTarget: true,
          };
        }

        const guessedScore = guesses.get(player.id) ?? null;
        const timedOut = guessedScore === null || guessedScore === -1;
        const isCorrect = !timedOut && guessedScore === correctScore;
        const bonus = isCorrect ? 2000 : -2000;

        ChorPoliceEngine.applyQuizBonus(player.id, bonus);

        return {
          playerId: player.id,
          playerName: player.name,
          guessedScore,
          isCorrect,
          bonus,
          timedOut,
          isTarget: false,
        };
      });

      if (questionIndex === TOTAL_QUESTIONS - 1 && !completionBonusAppliedRef.current) {
        completionBonusAppliedRef.current = true;
        players.forEach((player) => ChorPoliceEngine.applyQuizBonus(player.id, 2000));
      }

      // This packet is the single shared completion record for the question.
      // Clients do not infer completion from their own answer or local timer.
      broadcastPacket({
        type: MODES.CHOR_POLICE.SCORE_GUESS_RESULT,
        roundId: questionIndex + 1,
        questionIndex,
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.name,
        correctScore,
        playerResults,
        completedPlayerIds: players.map((player) => player.id),
        isRoundComplete: true,
        leaderboard: ChorPoliceEngine.getLeaderboard(),
      });
    },
    [correctScoreRef, isHostRef, resolveScoreQuizPlayers],
  );

  const collectGuess = useCallback(
    (
      guessingPlayerId: string,
      guessedScore: number,
      roundId?: number,
      targetPlayerId?: string,
    ) => {
      if (
        !isHostRef.current ||
        roundStateRef.current !== "answering" ||
        roundId !== currentRoundIdRef.current ||
        targetPlayerId !== currentTargetPlayerIdRef.current
      ) {
        return;
      }

      if (deadlineRef.current > 0 && Date.now() > deadlineRef.current) {
        evaluateGuesses(currentQuestionIndexRef.current);
        return;
      }

      const players = resolveScoreQuizPlayers();
      const targetId = currentTargetPlayerIdRef.current;
      const isEligiblePlayer = players.some(
        (player) => player.id === guessingPlayerId && player.id !== targetId,
      );
      const isAllowedGuess =
        guessedScore === -1 || currentOptionsRef.current.includes(guessedScore);

      if (
        !isEligiblePlayer ||
        !isAllowedGuess ||
        pendingGuessesRef.current.has(guessingPlayerId)
      ) {
        return;
      }

      pendingGuessesRef.current.set(guessingPlayerId, guessedScore);

      const eligiblePlayers = players.filter((player) => player.id !== targetId);
      if (eligiblePlayers.every((player) => pendingGuessesRef.current.has(player.id))) {
        evaluateGuesses(currentQuestionIndexRef.current);
      }
    },
    [evaluateGuesses, isHostRef, resolveScoreQuizPlayers],
  );

  const queueScoreQuizTurn = useCallback(
    (questionIndex: number) => {
      if (!isHostRef.current || !Number.isInteger(questionIndex)) return false;

      const isInitialQuestion =
        questionIndex === 0 &&
        currentQuestionIndexRef.current === -1 &&
        roundStateRef.current === "idle";
      const isNextCompletedQuestion =
        questionIndex === currentQuestionIndexRef.current + 1 &&
        roundStateRef.current === "complete";

      if (
        questionIndex < 0 ||
        questionIndex >= TOTAL_QUESTIONS ||
        transitionInFlightRef.current ||
        (!isInitialQuestion && !isNextCompletedQuestion)
      ) {
        return false;
      }

      const players = resolveScoreQuizPlayers();
      const targetPlayer = players[questionIndex];
      if (!targetPlayer || players.length !== TOTAL_QUESTIONS) return false;

      transitionInFlightRef.current = true;
      const correctScore =
        ChorPoliceEngine.state.scores[targetPlayer.id]?.totalScore ?? 0;
      const options = buildQuizOptions(correctScore);

      broadcastPacket({
        type: MODES.CHOR_POLICE.SCORE_QUIZ_TURN,
        roundId: questionIndex + 1,
        questionIndex,
        targetPlayerId: targetPlayer.id,
        targetPlayerName: targetPlayer.name,
        options,
        correctScore,
        deadline: Date.now() + QUESTION_DURATION_MS,
      });

      return true;
    },
    [buildQuizOptions, isHostRef, resolveScoreQuizPlayers],
  );

  const advanceScoreQuiz = useCallback(() => {
    if (
      !isHostRef.current ||
      roundStateRef.current !== "complete" ||
      transitionInFlightRef.current
    ) {
      return false;
    }

    if (currentQuestionIndexRef.current === TOTAL_QUESTIONS - 1) {
      transitionInFlightRef.current = true;
      roundStateRef.current = "finished";
      ChorPoliceEngine.endGame();
      return true;
    }

    return queueScoreQuizTurn(currentQuestionIndexRef.current + 1);
  }, [isHostRef, queueScoreQuizTurn]);

  const handleScoreQuizTurnPacket = useCallback(
    (packet: any) => {
      const questionIndex = Number.isInteger(packet.questionIndex)
        ? packet.questionIndex
        : typeof packet.roundId === "number"
          ? packet.roundId - 1
          : -1;
      const roundId = questionIndex + 1;
      const players = resolveScoreQuizPlayers();
      const targetPlayer = players[questionIndex];

      const isInitialQuestion =
        questionIndex === 0 &&
        currentQuestionIndexRef.current === -1 &&
        roundStateRef.current === "idle";
      const isExpectedNextQuestion =
        questionIndex === currentQuestionIndexRef.current + 1 &&
        roundStateRef.current === "complete";

      if (
        questionIndex < 0 ||
        questionIndex >= TOTAL_QUESTIONS ||
        packet.roundId !== roundId ||
        !targetPlayer ||
        targetPlayer.id !== packet.targetPlayerId ||
        (!isInitialQuestion && !isExpectedNextQuestion)
      ) {
        return false;
      }

      currentQuestionIndexRef.current = questionIndex;
      currentRoundIdRef.current = roundId;
      currentTargetPlayerIdRef.current = packet.targetPlayerId;
      currentQuizPlayerIdRef.current = packet.targetPlayerId;
      currentOptionsRef.current = Array.isArray(packet.options) ? packet.options : [];
      correctScoreRef.current =
        typeof packet.correctScore === "number" ? packet.correctScore : 0;
      deadlineRef.current =
        typeof packet.deadline === "number"
          ? packet.deadline
          : Date.now() + QUESTION_DURATION_MS;
      pendingGuessesRef.current = new Map();
      roundStateRef.current = "answering";
      transitionInFlightRef.current = false;
      scoreQuizStartedRef.current = true;
      quizOptionDisabledRef.current = false;
      quizResponseSubmittedRef.current = false;

      dispatch(setReduxGamePhase("score_quiz"));
      setQuizDone(false);
      setQuizPlayerIndex(questionIndex);
      setQuizOptions(currentOptionsRef.current);
      setQuizOptionDisabled(false);
      setQuizCountdown?.(
        Math.max(1, Math.ceil((deadlineRef.current - Date.now()) / 1000)),
      );
      setShowQuizLeaderboard?.(false);
      setIsQuizRoundComplete?.(false);
      setHasGuessedThisRound?.(false);
      setBoostScoreModalVisible?.(false);

      if (isHostRef.current) {
        if (guessTimerRef.current) clearTimeout(guessTimerRef.current);
        const questionAtStart = questionIndex;
        guessTimerRef.current = setTimeout(
          () => evaluateGuesses(questionAtStart),
          Math.max(0, deadlineRef.current - Date.now()),
        );
        timerRefs.current.push(guessTimerRef.current);

        players.forEach((player) => {
          if (!player.isBot || player.id === packet.targetPlayerId) return;

          const botTimer = setTimeout(() => {
            if (
              roundStateRef.current !== "answering" ||
              currentRoundIdRef.current !== roundId ||
              currentTargetPlayerIdRef.current !== packet.targetPlayerId
            ) {
              return;
            }

            const guessedScore =
              Math.random() < 0.5
                ? correctScoreRef.current
                : currentOptionsRef.current.find(
                    (option) => option !== correctScoreRef.current,
                  ) ?? correctScoreRef.current;
            collectGuess(player.id, guessedScore, roundId, packet.targetPlayerId);
          }, 2_500 + Math.floor(Math.random() * 1_000));
          timerRefs.current.push(botTimer);
        });
      }

      return true;
    },
    [
      collectGuess,
      correctScoreRef,
      currentQuizPlayerIdRef,
      dispatch,
      evaluateGuesses,
      isHostRef,
      quizOptionDisabledRef,
      quizResponseSubmittedRef,
      resolveScoreQuizPlayers,
      scoreQuizStartedRef,
      setBoostScoreModalVisible,
      setHasGuessedThisRound,
      setIsQuizRoundComplete,
      setQuizCountdown,
      setQuizDone,
      setQuizOptionDisabled,
      setQuizOptions,
      setQuizPlayerIndex,
      setShowQuizLeaderboard,
      timerRefs,
    ],
  );

  const handleScoreQuizResultPacket = useCallback(
    (packet: any) => {
      const questionIndex = Number.isInteger(packet.questionIndex)
        ? packet.questionIndex
        : typeof packet.roundId === "number"
          ? packet.roundId - 1
          : -1;

      if (
        packet.isRoundComplete !== true ||
        questionIndex !== currentQuestionIndexRef.current ||
        packet.roundId !== currentRoundIdRef.current ||
        roundStateRef.current !== "answering" ||
        completedRoundsRef.current.has(questionIndex)
      ) {
        return false;
      }

      completedRoundsRef.current.add(questionIndex);
      roundStateRef.current = "complete";
      deadlineRef.current = 0;
      currentTargetPlayerIdRef.current = null;
      currentQuizPlayerIdRef.current = null;
      quizOptionDisabledRef.current = true;
      transitionInFlightRef.current = false;

      if (guessTimerRef.current) {
        clearTimeout(guessTimerRef.current);
        guessTimerRef.current = null;
      }

      setQuizOptionDisabled(true);
      setQuizCountdown?.(0);
      setIsQuizRoundComplete?.(true);
      setShowQuizLeaderboard?.(true);
      return true;
    },
    [
      currentQuizPlayerIdRef,
      quizOptionDisabledRef,
      setIsQuizRoundComplete,
      setQuizCountdown,
      setQuizOptionDisabled,
      setShowQuizLeaderboard,
    ],
  );

  return {
    advanceScoreQuiz,
    collectGuess,
    getCurrentRoundId: () => currentRoundIdRef.current,
    handleScoreQuizResultPacket,
    handleScoreQuizTurnPacket,
    queueScoreQuizTurn,
  };
};
