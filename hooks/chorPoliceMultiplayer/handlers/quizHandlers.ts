import { CPMultiplayerContext } from "./types";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";
import { AudioEngine } from "@/audio/audioEngine";

export const handleScoreQuizTurn = (packet: any, context: CPMultiplayerContext) => {
  context.logic.scoreQuiz.handleScoreQuizTurnPacket(packet);
};

/**
 * HOST-ONLY: A player submitted their guess.
 * In the new simultaneous model, we collect it and let the hook decide when to evaluate.
 */
export const handleScoreGuess = (packet: any, context: CPMultiplayerContext) => {
  const { refs, logic } = context;

  // Forward to the hook's collectGuess with roundId for stale packet protection
  logic.scoreQuiz.collectGuess(packet.playerId, packet.guessedScore, packet.roundId);
};

/**
 * ALL CLIENTS: The host evaluated the question and sent results.
 * In the new model, playerResults is an array with per-player outcomes.
 */
export const handleScoreGuessResult = (packet: any, context: CPMultiplayerContext) => {
  const {
    refs, setQuizOptionDisabled, setPlayerScores, setShowQuizLeaderboard
  } = context;

  // Sync engine scores
  ChorPoliceEngine.syncScores(packet.leaderboard ?? []);

  // Disable further guessing for this question
  refs.quizOptionDisabledRef.current = true;
  setQuizOptionDisabled(true);

  // Update local player scores display
  const playerResults: Array<{
    playerId: string;
    bonus: number;
  }> = packet.playerResults ?? [];

  setPlayerScores((prev) =>
    prev.map((entry) => {
      const result = playerResults.find(r => r.playerId === entry.playerId);
      if (result) {
        return { ...entry, scores: [...entry.scores, result.bonus] };
      }
      return entry;
    })
  );

  // Find the LOCAL player's result for audio/visual feedback
  const localPlayerId = refs.localPlayerIdRef.current;
  const localResult = playerResults.find(r => r.playerId === localPlayerId);

  if (localResult) {
    AudioEngine.play(localResult.isCorrect ? "win" : "lose", "gameplay");
  }

  // Show the per-round leaderboard overlay between questions
  if (setShowQuizLeaderboard) {
    setShowQuizLeaderboard(true);
  }

  refs.currentQuizPlayerIdRef.current = null;
};
