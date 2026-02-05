import { Dispatch } from "redux";
import { updatePlayerScores, updateScoresByRound } from "@/redux/reducers/playerReducer";

interface PlayerScore {
  playerName: string;
  scores: number[];
  totalScore?: number;
}

export const calculateTotalScores = (
  playerScores: PlayerScore[],
  dispatch: Dispatch
) => {
  // If playerScores is empty here, STOP. Don't overwrite Redux with nothing.
  if (!playerScores || playerScores.length === 0 || playerScores[0].scores.length === 0) {
    console.warn("⚠️ Attempted to calculate scores with empty data. Aborting reset.");
    return;
  }

  const updatedScores = playerScores.map((player) => {
    const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
    return { ...player, totalScore };
  });

  const totalScoresArray = updatedScores.map((player) => ({
    playerName: player.playerName,
    totalScore: player.totalScore!,
  }));

  // Sync to Redux
  dispatch(updateScoresByRound(updatedScores));
  dispatch(updatePlayerScores(totalScoresArray));

  return updatedScores;
};
