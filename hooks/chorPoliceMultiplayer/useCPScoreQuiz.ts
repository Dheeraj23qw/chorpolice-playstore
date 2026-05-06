import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setGamePhase as setReduxGamePhase } from "@/redux/reducers/sessionSlice";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { broadcastPacket, handleIncomingPacket } from "@/service/lanGameService";
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
}

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
}: ScoreQuizDeps) => {
  const dispatch = useDispatch<AppDispatch>();

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

  const queueScoreQuizTurn = useCallback((playerIndex: number) => {
    if (!isHostRef.current) return;
    const CP = MODES.CHOR_POLICE;
    const players = resolveScoreQuizPlayers();

    if (playerIndex >= players.length) {
      setQuizDone(true);
      setQuizOptionDisabled(true);
      quizOptionDisabledRef.current = true;
      currentQuizPlayerIdRef.current = null;
      const endTimer = setTimeout(() => ChorPoliceEngine.endGame(), 500);
      timerRefs.current.push(endTimer);
      return;
    }

    const player = players[playerIndex];
    const correctScore = ChorPoliceEngine.state.scores[player.id]?.totalScore ?? 0;
    const options = buildQuizOptions(correctScore);

    broadcastPacket({
      type: CP.SCORE_QUIZ_TURN,
      playerId: player.id,
      playerIndex,
      options,
    });
  }, [buildQuizOptions, isHostRef, resolveScoreQuizPlayers, setQuizDone, setQuizOptionDisabled, quizOptionDisabledRef, currentQuizPlayerIdRef, timerRefs]);

  const handleScoreQuizTurnPacket = useCallback((packet: any) => {
    const players = resolveScoreQuizPlayers();
    let resolvedPlayerIndex = typeof packet.playerIndex === "number" ? packet.playerIndex : -1;
    let quizPlayer = resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;

    if ((!quizPlayer || quizPlayer.id !== packet.playerId) && packet.playerId) {
      resolvedPlayerIndex = players.findIndex(p => p.id === packet.playerId);
      quizPlayer = resolvedPlayerIndex >= 0 ? players[resolvedPlayerIndex] : undefined;
    }

    if (!quizPlayer || resolvedPlayerIndex < 0) return;

    scoreQuizStartedRef.current = true;
    currentQuizPlayerIdRef.current = packet.playerId;
    dispatch(setReduxGamePhase("score_quiz"));
    setQuizDone(false);
    setQuizPlayerIndex(resolvedPlayerIndex);
    setQuizOptions(Array.isArray(packet.options) ? packet.options : []);
    setQuizOptionDisabled(false);
    quizOptionDisabledRef.current = false;

    if (isHostRef.current && quizPlayer.isBot) {
      const botDelay = 2500 + Math.floor(Math.random() * 1000);
      const expectedPlayerId = packet.playerId;
      const options = Array.isArray(packet.options) ? packet.options : [];
      const correctScore = ChorPoliceEngine.state.scores[expectedPlayerId]?.totalScore ?? 0;

      const botTimer = setTimeout(() => {
        if (currentQuizPlayerIdRef.current !== expectedPlayerId) return;
        const guessedScore = Math.random() < 0.4 ? correctScore : (options.find((score: number) => score !== correctScore) ?? correctScore);
        handleIncomingPacket({ type: MODES.CHOR_POLICE.SCORE_GUESS, playerId: expectedPlayerId, guessedScore });
      }, botDelay);
      timerRefs.current.push(botTimer);
    }
  }, [dispatch, isHostRef, resolveScoreQuizPlayers, scoreQuizStartedRef, currentQuizPlayerIdRef, setQuizDone, setQuizPlayerIndex, setQuizOptions, setQuizOptionDisabled, quizOptionDisabledRef, timerRefs]);

  return {
    queueScoreQuizTurn,
    handleScoreQuizTurnPacket,
  };
};
