import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { broadcastPacket } from "@/service/lanGameService";
import { MODES } from "@/constants/Networking";

interface ScoreQuizDeps {
  isHostRef: React.RefObject<boolean>;
  timerRefs: React.RefObject<ReturnType<typeof setTimeout>[]>;
  currentQuizPlayerIdRef: React.RefObject<string | null>;
  scoreQuizStartedRef: React.RefObject<boolean>;
  quizOptionDisabledRef: React.RefObject<boolean>;
  setQuizDone: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizOptionDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setQuizPlayerIndex: React.Dispatch<React.SetStateAction<number>>;
  setQuizOptions: React.Dispatch<React.SetStateAction<number[]>>;
  resolveScoreQuizPlayers: () => any[];
  setQuizCountdown?: React.Dispatch<React.SetStateAction<number | null>>;
  setShowQuizLeaderboard?: React.Dispatch<React.SetStateAction<boolean>>;
  setHasGuessedThisRound?: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * LEVEL 2 — GUESS THE SCORE (1 Target, 3 Guessers)
 *
 * Rules:
 * 1. For each round, 1 player is the TARGET. The other 3 players guess the target's score.
 * 2. Target player does NOT answer. Options are disabled on target's screen.
 * 3. Guesser: Correct (+2000 L2), Wrong (-2000 L2), Timeout (-2000 L2).
 * 4. Target: No penalty, L2 bonus remains unchanged during their target round.
 * 5. Authoritative 7s deadline set by host (Date.now() + 7000).
 * 6. Idempotent evaluation: same round is never scored twice.
 * 7. Stale & duplicate packet protection.
 */
export const useCPScoreQuiz = ({
  isHostRef,
  timerRefs,
  currentQuizPlayerIdRef,
  scoreQuizStartedRef,
  quizOptionDisabledRef,
  setQuizDone,
  setQuizOptionDisabled,
  setQuizPlayerIndex,
  setQuizOptions,
  resolveScoreQuizPlayers,
  setQuizCountdown,
  setShowQuizLeaderboard,
  setHasGuessedThisRound,
}: ScoreQuizDeps) => {
  const dispatch = useDispatch<AppDispatch>();

  // ── Host-only state ──
  const pendingGuessesRef = useRef<Map<string, number>>(new Map());
  const guessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTargetPlayerIdRef = useRef<string | null>(null);
  const currentRoundIdRef = useRef<number>(0);
  const deadlineRef = useRef<number>(0);
  const scoredRoundsRef = useRef<Set<number>>(new Set());

  const buildQuizOptions = useCallback((baseScore: number) => {
    const variations = [500, 800];
    const randomOptions = new Set<number>([baseScore]);
    while (randomOptions.size < 3) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const nextScore = Math.max(0, baseScore + (Math.random() < 0.5 ? -variation : variation));
      randomOptions.add(nextScore);
    }
    return Array.from(randomOptions).sort(() => Math.random() - 0.5);
  }, []);

  /**
   * HOST: Evaluate all 3 guessers for the current target round.
   * Idempotent — will only evaluate each round index once.
   */
  const evaluateGuesses = useCallback((questionPlayerIndex: number) => {
    if (!isHostRef.current) return;
    
    // 🛡️ Item 6: Idempotency check — prevent duplicate scoring
    if (scoredRoundsRef.current.has(questionPlayerIndex)) return;
    scoredRoundsRef.current.add(questionPlayerIndex);

    const CP = MODES.CHOR_POLICE;
    const players = resolveScoreQuizPlayers();
    const targetPlayer = players[questionPlayerIndex];
    if (!targetPlayer) return;

    // 🛡️ Item 1: Actual score being guessed (Target's total score before this question)
    const correctScore = ChorPoliceEngine.state.scores[targetPlayer.id]?.totalScore ?? 0;
    const guesses = pendingGuessesRef.current;

    // Build per-player results for the 3 guessers
    const playerResults: Array<{
      playerId: string;
      playerName: string;
      guessedScore: number | null;
      isCorrect: boolean;
      bonus: number;
      timedOut: boolean;
    }> = [];

    players.forEach((p) => {
      // 🛡️ Item 5: TARGET PLAYER DOES NOT GUESS & IS NOT PENALIZED
      if (p.id === targetPlayer.id) return;

      const guessedScore = guesses.get(p.id) ?? null;
      const timedOut = guessedScore === null;
      const isCorrect = !timedOut && Number(guessedScore) === correctScore;
      
      // Guesser points: Correct (+2000), Wrong (-2000), Timeout (-2000)
      const bonus = isCorrect ? 2000 : -2000;

      // 🛡️ Item 2: Apply bonus strictly to the guesser's L2 score
      ChorPoliceEngine.applyQuizBonus(p.id, bonus);

      playerResults.push({
        playerId: p.id,
        playerName: p.name,
        guessedScore,
        isCorrect,
        bonus,
        timedOut,
      });
    });

    // Clear round timer
    if (guessTimerRef.current) {
      clearTimeout(guessTimerRef.current);
      guessTimerRef.current = null;
    }

    // 🛡️ Item 11: Broadcast authoritative result
    broadcastPacket({
      type: CP.SCORE_GUESS_RESULT,
      roundId: questionPlayerIndex + 1,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      questionPlayerIndex,
      correctScore,
      playerResults,
      leaderboard: ChorPoliceEngine.getLeaderboard(),
    });

    // 🛡️ Item 16: Next target round after 4s leaderboard display
    const nextTurnTimer = setTimeout(() => {
      queueScoreQuizTurn(questionPlayerIndex + 1);
    }, 4000);
    timerRefs.current.push(nextTurnTimer);
  }, [isHostRef, resolveScoreQuizPlayers, timerRefs]);

  /**
   * HOST: Receive a single guess from one of the 3 guessers.
   * When all 3 guessers have submitted, evaluate immediately.
   */
  const collectGuess = useCallback((guessingPlayerId: string, guessedScore: number, roundId?: number) => {
    if (!isHostRef.current) return;

    const targetId = currentTargetPlayerIdRef.current;
    
    // 🛡️ Item 3: Host security check — Target player cannot guess!
    if (guessingPlayerId === targetId) {
      console.warn(`[L2_HOST] Security rejection: Target player ${guessingPlayerId} cannot guess.`);
      return;
    }

    // 🛡️ Item 7: Stale packet protection — ignore guesses for wrong roundId
    if (roundId !== undefined && roundId !== currentRoundIdRef.current) {
      console.warn(`[L2_HOST] Stale guess ignored: packet round ${roundId} vs current ${currentRoundIdRef.current}`);
      return;
    }

    // 🛡️ Item 9: Deadline authority check — ignore late guesses
    if (deadlineRef.current > 0 && Date.now() > deadlineRef.current + 300) {
      console.warn(`[L2_HOST] Late guess ignored from player ${guessingPlayerId}`);
      return;
    }

    // 🛡️ Item 8: Duplicate submission protection — only first guess counts
    if (pendingGuessesRef.current.has(guessingPlayerId)) {
      console.warn(`[L2_HOST] Duplicate guess ignored from player ${guessingPlayerId}`);
      return;
    }

    pendingGuessesRef.current.set(guessingPlayerId, guessedScore);

    // 🛡️ Item 4: Check if all 3 eligible guessers have submitted
    const players = resolveScoreQuizPlayers();
    const eligibleGuessers = players.filter(p => p.id !== targetId);
    const allGuessersSubmitted = eligibleGuessers.every(p => pendingGuessesRef.current.has(p.id));

    if (allGuessersSubmitted) {
      const questionIdx = players.findIndex(p => p.id === targetId);
      if (questionIdx >= 0) {
        evaluateGuesses(questionIdx);
      }
    }
  }, [isHostRef, resolveScoreQuizPlayers, evaluateGuesses]);

  /**
   * HOST: Queue and start a new target round (Round 1 to 4).
   */
  const queueScoreQuizTurn = useCallback((playerIndex: number) => {
    if (!isHostRef.current) return;
    const CP = MODES.CHOR_POLICE;
    const players = resolveScoreQuizPlayers();

    if (playerIndex >= players.length) {
      setQuizDone(true);
      setQuizOptionDisabled(true);
      quizOptionDisabledRef.current = true;
      currentQuizPlayerIdRef.current = null;
      currentTargetPlayerIdRef.current = null;
      const endTimer = setTimeout(() => ChorPoliceEngine.endGame(), 500);
      timerRefs.current.push(endTimer);
      return;
    }

    // 🛡️ Item 11: Target rotation P1 -> P2 -> P3 -> P4
    const targetPlayer = players[playerIndex];
    const correctScore = ChorPoliceEngine.state.scores[targetPlayer.id]?.totalScore ?? 0;
    const options = buildQuizOptions(correctScore);

    // 🛡️ Item 10: Authoritative 7-second deadline
    const roundId = playerIndex + 1;
    const deadline = Date.now() + 7000;
    currentRoundIdRef.current = roundId;
    deadlineRef.current = deadline;

    // Reset host state for this question
    pendingGuessesRef.current = new Map();
    currentTargetPlayerIdRef.current = targetPlayer.id;

    broadcastPacket({
      type: CP.SCORE_QUIZ_TURN,
      roundId,
      targetPlayerId: targetPlayer.id,
      targetPlayerName: targetPlayer.name,
      playerIndex,
      options,
      deadline,
    });

    // 🛡️ Item 9: Authoritative host deadline timer (7s)
    if (guessTimerRef.current) clearTimeout(guessTimerRef.current);
    guessTimerRef.current = setTimeout(() => {
      evaluateGuesses(playerIndex);
    }, 7000);
    timerRefs.current.push(guessTimerRef.current);

    // Schedule bot guessers
    players.forEach((p) => {
      if (p.isBot && p.id !== targetPlayer.id) {
        const botDelay = 1500 + Math.floor(Math.random() * 3000);
        const botTimer = setTimeout(() => {
          if (currentTargetPlayerIdRef.current !== targetPlayer.id) return;
          const guessedScore = Math.random() < 0.4
            ? correctScore
            : (options.find((s: number) => s !== correctScore) ?? correctScore);
          collectGuess(p.id, guessedScore, roundId);
        }, botDelay);
        timerRefs.current.push(botTimer);
      }
    });
  }, [buildQuizOptions, isHostRef, resolveScoreQuizPlayers, setQuizDone, setQuizOptionDisabled, quizOptionDisabledRef, currentQuizPlayerIdRef, timerRefs, evaluateGuesses, collectGuess]);

  /**
   * ALL CLIENTS: Handle incoming SCORE_QUIZ_TURN packet.
   */
  const handleScoreQuizTurnPacket = useCallback((packet: any) => {
    const players = resolveScoreQuizPlayers();
    let resolvedPlayerIndex = typeof packet.playerIndex === "number" ? packet.playerIndex : -1;
    let quizPlayer = resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;

    if ((!quizPlayer || quizPlayer.id !== packet.targetPlayerId) && packet.targetPlayerId) {
      resolvedPlayerIndex = players.findIndex(p => p.id === packet.targetPlayerId);
      quizPlayer = resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;
    }

    if (!quizPlayer || resolvedPlayerIndex < 0) return;

    scoreQuizStartedRef.current = true;
    currentQuizPlayerIdRef.current = packet.targetPlayerId;
    dispatch(setReduxGamePhase("score_quiz"));
    setQuizDone(false);
    setQuizPlayerIndex(resolvedPlayerIndex);
    setQuizOptions(Array.isArray(packet.options) ? packet.options : []);
    setQuizOptionDisabled(false);
    quizOptionDisabledRef.current = false;

    // 🛡️ Item 6: Derive visual countdown from authoritative deadline
    const remainingSecs = packet.deadline ? Math.max(1, Math.ceil((packet.deadline - Date.now()) / 1000)) : 7;

    if (setQuizCountdown) setQuizCountdown(remainingSecs);
    if (setShowQuizLeaderboard) setShowQuizLeaderboard(false);
    if (setHasGuessedThisRound) setHasGuessedThisRound(false);
  }, [dispatch, resolveScoreQuizPlayers, scoreQuizStartedRef, currentQuizPlayerIdRef, setQuizDone, setQuizPlayerIndex, setQuizOptions, setQuizOptionDisabled, quizOptionDisabledRef, setQuizCountdown, setShowQuizLeaderboard, setHasGuessedThisRound]);

  return {
    queueScoreQuizTurn,
    handleScoreQuizTurnPacket,
    collectGuess,
  };
};
