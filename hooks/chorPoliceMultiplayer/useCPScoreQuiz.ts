import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";

import { MODES } from "@/constants/Networking";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { AppDispatch } from "@/redux/store";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { broadcastPacket } from "@/service/lanGameService";

const TOTAL_QUESTIONS = 4;
const QUESTION_DURATION_MS = 15_000;

type ScoreQuizRoundState = "idle" | "answering" | "complete" | "finished";

interface ScoreQuizDeps {
  isHostRef: React.MutableRefObject<boolean>;
  timerRefs: React.MutableRefObject<ReturnType<typeof setTimeout>[]>;
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

  const pendingAnswersRef = useRef<Map<string, number>>(new Map());
  const currentQuestionIndexRef = useRef(-1);
  const currentRoundIdRef = useRef(0);
  const level1SnapshotRef = useRef<Map<string, number>>(new Map());
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
      const variation =
        variations[Math.floor(Math.random() * variations.length)];
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
      console.log(
        `[CP_QUIZ] evaluateGuesses called for qIdx=${questionIndex}. isHost=${isHostRef.current}, roundState=${roundStateRef.current}, currentQIdx=${currentQuestionIndexRef.current}, alreadyScored=${scoredRoundsRef.current.has(questionIndex)}`,
      );

      if (
        !isHostRef.current ||
        roundStateRef.current !== "answering" ||
        currentQuestionIndexRef.current !== questionIndex ||
        scoredRoundsRef.current.has(questionIndex)
      ) {
        console.warn(
          `[CP_QUIZ] evaluateGuesses SKIPPED for qIdx=${questionIndex}`,
        );
        return;
      }

      const players = resolveScoreQuizPlayers();
      scoredRoundsRef.current.add(questionIndex);
      if (guessTimerRef.current) {
        clearTimeout(guessTimerRef.current);
        guessTimerRef.current = null;
      }

      const correctScore = correctScoreRef.current;
      const guesses = pendingAnswersRef.current;
      const playerResults = players.map((player) => {
        const guessedScore = guesses.has(player.id)
          ? (guesses.get(player.id) ?? -1)
          : -1;
        const timedOut = guessedScore === -1;
        const isCorrect = !timedOut && guessedScore === correctScore;
        const bonus = isCorrect ? 2000 : -2000;

        ChorPoliceEngine.applyQuizBonus(player.id, bonus);

        // Log per-player outcome for Level 2
        console.log(
          `[CP_QUIZ] Player ${player.name} (${player.id}) ${isCorrect ? "correct" : timedOut ? "timed out" : "wrong"} -> L2 bonus ${
            bonus > 0 ? "+" + bonus : String(bonus)
          }`,
        );

        return {
          playerId: player.id,
          playerName: player.name,
          guessedScore: timedOut ? null : guessedScore,
          isCorrect,
          bonus,
          timedOut,
        };
      });

      // This packet is the single shared completion record for the question.
      // Clients do not infer completion from their own answer or local timer.
      broadcastPacket({
        type: MODES.CHOR_POLICE.SCORE_GUESS_RESULT,
        roundId: questionIndex + 1,
        questionIndex,
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
      questionIndex?: number,
    ) => {
      if (
        !isHostRef.current ||
        roundStateRef.current !== "answering" ||
        roundId !== currentRoundIdRef.current ||
        questionIndex !== currentQuestionIndexRef.current
      ) {
        return;
      }

      if (deadlineRef.current > 0 && Date.now() > deadlineRef.current) {
        evaluateGuesses(currentQuestionIndexRef.current);
        return;
      }

      const players = resolveScoreQuizPlayers();
      const isEligiblePlayer = players.some(
        (player) => player.id === guessingPlayerId,
      );
      const isAllowedGuess =
        guessedScore === -1 || currentOptionsRef.current.includes(guessedScore);

      if (
        !isEligiblePlayer ||
        !isAllowedGuess ||
        pendingAnswersRef.current.has(guessingPlayerId)
      ) {
        return;
      }

      pendingAnswersRef.current.set(guessingPlayerId, guessedScore);
      if (pendingAnswersRef.current.size >= players.length) {
        evaluateGuesses(currentQuestionIndexRef.current);
      }
    },
    [evaluateGuesses, isHostRef, resolveScoreQuizPlayers],
  );

  const queueScoreQuizTurn = useCallback(
    (questionIndex: number) => {
      console.log(
        `[CP_QUIZ] queueScoreQuizTurn called for index ${questionIndex}. isHost: ${isHostRef.current}, currentQuestionIndex: ${currentQuestionIndexRef.current}, roundState: ${roundStateRef.current}`,
      );

      if (!isHostRef.current || !Number.isInteger(questionIndex)) {
        console.warn(
          "[CP_QUIZ] queueScoreQuizTurn aborted: not host or invalid index.",
        );
        return false;
      }

      if (questionIndex < 0 || questionIndex >= TOTAL_QUESTIONS) {
        console.warn(`[CP_QUIZ] Invalid questionIndex ${questionIndex}`);
        return false;
      }

      const players = resolveScoreQuizPlayers();
      if (!players.length) {
        console.warn(
          "[CP_QUIZ] queueScoreQuizTurn aborted: no eligible players found.",
        );
        return false;
      }

      // Snapshot Level 1 scores at the start of Level 2 (host only).
      if (isHostRef.current && questionIndex === 0) {
        const snap = new Map<string, number>();
        players.forEach((p) => {
          snap.set(p.id, ChorPoliceEngine.getLevel1Score(p.id));
        });
        level1SnapshotRef.current = snap;

        const snapshotLog = players
          .map((p) => `${p.name}=${level1SnapshotRef.current.get(p.id) ?? 0}`)
          .join(", ");
        console.log(`[CP_QUIZ] L2 source scores snapshot: ${snapshotLog}`);
      }

      transitionInFlightRef.current = true;
      const targetPlayer = players[questionIndex];
      const correctScore =
        level1SnapshotRef.current.get(targetPlayer.id) ??
        ChorPoliceEngine.getLevel1Score(targetPlayer.id) ??
        0;
      const options = buildQuizOptions(correctScore);

      console.log(
        `[CP_QUIZ] Broadcasting SCORE_QUIZ_TURN for question ${questionIndex + 1}`,
      );

      broadcastPacket({
        type: MODES.CHOR_POLICE.SCORE_QUIZ_TURN,
        roundId: questionIndex + 1,
        questionIndex,
        options,
        correctScore,
        deadline: Date.now() + QUESTION_DURATION_MS,
      });

      return true;
    },
    [buildQuizOptions, isHostRef, resolveScoreQuizPlayers],
  );

  const advanceScoreQuiz = useCallback(() => {
    console.log(
      `[CP_QUIZ] advanceScoreQuiz called. isHost: ${isHostRef.current}, roundState: ${roundStateRef.current}, transitionInFlight: ${transitionInFlightRef.current}, questionIndex: ${currentQuestionIndexRef.current}`,
    );

    if (!isHostRef.current) {
      console.warn("[CP_QUIZ] advanceScoreQuiz ignored: not host.");
      return false;
    }

    // Reset transition guards so explicit host navigation always works
    transitionInFlightRef.current = false;
    roundStateRef.current = "complete";

    if (currentQuestionIndexRef.current >= TOTAL_QUESTIONS - 1) {
      console.log("[CP_QUIZ] Reached question 4 completion -> endGame()");
      transitionInFlightRef.current = true;
      roundStateRef.current = "finished";
      ChorPoliceEngine.endGame();
      return true;
    }

    const nextIndex = currentQuestionIndexRef.current + 1;
    console.log(`[CP_QUIZ] Advancing to question index ${nextIndex}`);
    return queueScoreQuizTurn(nextIndex);
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

      console.log(
        `[CP_QUIZ] handleScoreQuizTurnPacket: qIdx=${questionIndex}, roundId=${roundId}, currentQIdx=${currentQuestionIndexRef.current}, roundState=${roundStateRef.current}, isHost=${isHostRef.current}`,
      );

      const isInitialQuestion =
        questionIndex === 0 &&
        currentQuestionIndexRef.current === -1 &&
        (roundStateRef.current === "idle" ||
          roundStateRef.current === "complete");
      const isExpectedNextQuestion =
        questionIndex === currentQuestionIndexRef.current + 1 &&
        (roundStateRef.current === "complete" ||
          roundStateRef.current === "answering");

      if (
        questionIndex < 0 ||
        questionIndex >= TOTAL_QUESTIONS ||
        packet.roundId !== roundId ||
        !Array.isArray(packet.options) ||
        (!isInitialQuestion && !isExpectedNextQuestion)
      ) {
        console.warn(
          `[CP_QUIZ] handleScoreQuizTurnPacket REJECTED. isInitial=${isInitialQuestion}, isExpectedNext=${isExpectedNextQuestion}`,
        );
        return false;
      }

      currentQuestionIndexRef.current = questionIndex;
      currentRoundIdRef.current = roundId;
      currentOptionsRef.current = Array.isArray(packet.options)
        ? packet.options
        : [];
      correctScoreRef.current =
        typeof packet.correctScore === "number" ? packet.correctScore : 0;
      deadlineRef.current =
        typeof packet.deadline === "number"
          ? packet.deadline
          : Date.now() + QUESTION_DURATION_MS;
      pendingAnswersRef.current = new Map();
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
          if (!player.isBot) return;

          const botTimer = setTimeout(
            () => {
              if (
                roundStateRef.current !== "answering" ||
                currentRoundIdRef.current !== roundId
              ) {
                return;
              }

              const guessedScore =
                Math.random() < 0.5
                  ? correctScoreRef.current
                  : (currentOptionsRef.current.find(
                      (option) => option !== correctScoreRef.current,
                    ) ?? correctScoreRef.current);
              collectGuess(player.id, guessedScore, roundId, questionIndex);
            },
            2_000 + Math.floor(Math.random() * 1_000),
          );
          timerRefs.current.push(botTimer);
        });
      }

      return true;
    },
    [
      collectGuess,
      correctScoreRef,
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

      console.log(
        `[CP_QUIZ] handleScoreQuizResultPacket: qIdx=${questionIndex}, roundId=${packet.roundId}, currentQIdx=${currentQuestionIndexRef.current}, currentRoundId=${currentRoundIdRef.current}, roundState=${roundStateRef.current}, isRoundComplete=${packet.isRoundComplete}`,
      );

      if (
        packet.isRoundComplete !== true ||
        questionIndex !== currentQuestionIndexRef.current ||
        packet.roundId !== currentRoundIdRef.current ||
        roundStateRef.current !== "answering" ||
        completedRoundsRef.current.has(questionIndex)
      ) {
        console.warn(
          `[CP_QUIZ] handleScoreQuizResultPacket REJECTED. matchQIdx=${questionIndex === currentQuestionIndexRef.current}, matchRoundId=${packet.roundId === currentRoundIdRef.current}, stateIsAnswering=${roundStateRef.current === "answering"}, alreadyCompleted=${completedRoundsRef.current.has(questionIndex)}`,
        );
        return false;
      }

      completedRoundsRef.current.add(questionIndex);
      roundStateRef.current = "complete";
      deadlineRef.current = 0;
      quizOptionDisabledRef.current = true;
      transitionInFlightRef.current = false;

      if (guessTimerRef.current) {
        clearTimeout(guessTimerRef.current);
        guessTimerRef.current = null;
      }

      setQuizOptionDisabled(true);
      return true;
    },
    [
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
