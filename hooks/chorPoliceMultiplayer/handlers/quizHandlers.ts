import { CPMultiplayerContext } from "./types";
import { ChorPoliceEngine } from "@/service/ChorPoliceEngine";

export const handleScoreQuizTurn = (
  packet: any,
  context: CPMultiplayerContext,
) => {
  context.logic.scoreQuiz.handleScoreQuizTurnPacket(packet);
};

/**
 * HOST-ONLY: A player submitted their guess.
 * In the new simultaneous model, we collect it and let the hook decide when to evaluate.
 */
export const handleScoreGuess = (
  packet: any,
  context: CPMultiplayerContext,
) => {
  const questionIndex = Number.isInteger(packet.questionIndex)
    ? packet.questionIndex
    : typeof packet.roundId === "number"
      ? packet.roundId - 1
      : undefined;

  context.logic.scoreQuiz.collectGuess(
    packet.playerId,
    packet.guessedScore,
    packet.roundId,
    questionIndex,
  );
};

/**
 * ALL CLIENTS: The host evaluated the question and sent results.
 * In the new model, playerResults is an array with per-player outcomes.
 */
export const handleScoreGuessResult = (
  packet: any,
  context: CPMultiplayerContext,
) => {
  const { logic, setPlayerScores } = context;

  // Ignore duplicates, stale results, and results for a question that this
  // client has not entered. The hook owns the current shared-round identity.
  if (!logic.scoreQuiz.handleScoreQuizResultPacket(packet)) return;

  // Sync engine scores
  ChorPoliceEngine.syncScores(packet.leaderboard ?? []);

  // Update local player scores display
  const playerResults: Array<{
    playerId: string;
    bonus: number;
    isCorrect: boolean;
  }> = packet.playerResults ?? [];

  setPlayerScores((prev) =>
    prev.map((entry) => {
      const result = playerResults.find((r) => r.playerId === entry.playerId);
      if (result) {
        return { ...entry, scores: [...entry.scores, result.bonus] };
      }
      return entry;
    }),
  );
};

/**
 * HOST-ONLY: Advance to the next quiz question or end the quiz.
 */
export const handleScoreQuizNext = (
  packet: any,
  context: CPMultiplayerContext,
) => {
  if (context.refs.isHostRef.current) {
    context.logic.scoreQuiz.advanceScoreQuiz();
  }
};
